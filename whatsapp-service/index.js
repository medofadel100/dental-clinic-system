require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());
app.use(express.json());

let sock;
let qrCodeDataUrl = null;
let isConnected = false;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const unauthConversations = {};
const patientConversations = {};

const JID_MAP_FILE = path.join(__dirname, 'jid_map.json');
let jidToPatient = {};

// Load existing JID mapping if available
if (fs.existsSync(JID_MAP_FILE)) {
    try {
        const data = fs.readFileSync(JID_MAP_FILE, 'utf8');
        jidToPatient = JSON.parse(data);
    } catch (err) {
        console.error('Error reading JID map file:', err);
        jidToPatient = {};
    }
}

function saveJidMap() {
    try {
        fs.writeFileSync(JID_MAP_FILE, JSON.stringify(jidToPatient, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving JID map file:', err);
    }
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('New QR code received');
            try { qrCodeDataUrl = await QRCode.toDataURL(qr); } 
            catch (err) { console.error('Error generating QR Data URL', err); }
        }
        
        if (connection === 'close') {
            isConnected = false;
            qrCodeDataUrl = null;
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting:', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('WhatsApp connection opened successfully!');
            isConnected = true;
            qrCodeDataUrl = null;
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const senderJid = msg.key.remoteJid;
        const rawPhone = senderJid.split('@')[0];
        const phoneVariations = [
            rawPhone,
            rawPhone.startsWith('20') ? '0' + rawPhone.substring(2) : rawPhone,
            rawPhone.startsWith('20') ? rawPhone.substring(2) : rawPhone
        ];
        
        const messageType = Object.keys(msg.message)[0];
        const isMedia = messageType === 'imageMessage' || messageType === 'documentMessage';
        
        let textMessage = "";
        if (isMedia) {
            textMessage = msg.message.imageMessage?.caption || msg.message.documentMessage?.caption || "";
        } else {
            textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        }

        if (!textMessage && !isMedia) return;
        console.log(`[Incoming Message] Raw JID: ${senderJid}`);
        console.log(`[Incoming Message] Text: ${textMessage}`);

        try {
            let patientId = jidToPatient[senderJid];
            let patient = null;

            // Handle Cancel Command anywhere
            if (textMessage.trim() === 'إلغاء' || textMessage.trim() === '0') {
                if (patientId) {
                    patientConversations[patientId] = { state: 'MAIN_MENU' };
                } else {
                    delete unauthConversations[senderJid];
                }
                await sock.sendMessage(senderJid, { text: `تم إلغاء العملية.\nإذا احتجت لشيء آخر، فقط أرسل "مرحبا".` });
                return;
            }

            // 1. Identify Patient
            if (patientId) {
                const { data } = await supabase.from('patients').select('*').eq('id', patientId).single();
                patient = data;
            } else {
                const { data: directMatch } = await supabase.from('patients').select('*').in('phone', phoneVariations).maybeSingle();
                if (directMatch) {
                    patient = directMatch;
                    patientId = directMatch.id;
                    jidToPatient[senderJid] = patientId;
                    saveJidMap();
                }
            }

            // 2. Auth Flow: If not identified, create a temporary pseudo-patient for the AI to register
            if (!patientId) {
                patient = {
                    id: senderJid, // Temporary ID for chat history
                    full_name: "مريض جديد (غير مسجل)",
                    phone: rawPhone.startsWith('20') ? '0' + rawPhone.substring(2) : rawPhone, // Formatted as 010...
                    is_new: true
                };
            }

            // --- The Patient is now definitely identified ---
            const conv = patientConversations[patientId] || { state: 'MAIN_MENU' };
            const stateAfterAuth = conv.state;

            if (isMedia) {
                try {
                    const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino({ level: 'silent' }) });
                    
                    const base64Data = buffer.toString('base64');
                    const dataURI = `data:image/jpeg;base64,${base64Data}`;

                    await sock.sendMessage(senderJid, { text: `جاري حفظ الملف/الأشعة، يرجى الانتظار قليلاً... ⏳` });

                    const uploadResult = await cloudinary.uploader.upload(dataURI, {
                        folder: `dental-clinic/patients/${patient.id}`,
                        resource_type: 'auto',
                    });

                    const publicUrl = uploadResult.secure_url;

                    await supabase.from('media').insert([{
                        patient_id: patient.id,
                        url: publicUrl,
                        media_type: 'WhatsApp Upload'
                    }]);

                    await sock.sendMessage(senderJid, { text: `تم استلام الأشعة/المستند بنجاح وتم إضافته لملفك الطبي 🦷📸.` });
                    patientConversations[patientId] = { state: 'MAIN_MENU' };
                    return;
                } catch (err) {
                    console.error('Error downloading media:', err);
                    await sock.sendMessage(senderJid, { text: `عذراً، حدث خطأ أثناء حفظ الصورة. يرجى المحاولة مرة أخرى.` });
                    return;
                }
            }

            // --- Hand over to Autonomous AI Agent ---
            try {
                const { handleIncomingMessage } = require('./ai-agent');
                await handleIncomingMessage(patient, textMessage, supabase, sock, senderJid, (newId) => {
                    jidToPatient[senderJid] = newId;
                    saveJidMap();
                });
            } catch (aiErr) {
                console.error("AI Agent Error:", aiErr);
                await sock.sendMessage(senderJid, { text: "عذراً، أواجه مشكلة تقنية. يرجى التحدث مع الاستقبال." });
            }

        } catch (err) {
            console.error('Error processing incoming message:', err);
        }
    });
}

connectToWhatsApp();

app.get('/api/status', (req, res) => res.json({ connected: isConnected, qrCode: qrCodeDataUrl }));
app.post('/api/send', async (req, res) => {
    try {
        const { number, message } = req.body;
        if (!isConnected || !sock) return res.status(500).json({ error: 'WhatsApp is not connected yet.' });
        if (!number || !message) return res.status(400).json({ error: 'Missing number or message.' });
        let formattedNumber = number.replace(/[^0-9]/g, '');
        if (formattedNumber.startsWith('01')) formattedNumber = '2' + formattedNumber;
        const jid = `${formattedNumber}@s.whatsapp.net`;
        await sock.sendMessage(jid, { text: message });
        res.json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/logout', async (req, res) => {
    try {
        if (sock) {
            await sock.logout('Log out requested via dashboard');
            sock = null;
        }
        isConnected = false;
        qrCodeDataUrl = null;
        
        // Delete auth info directory
        const authPath = path.join(__dirname, 'auth_info_baileys');
        if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true });
        }
        
        // Reconnect to generate new QR
        connectToWhatsApp();
        
        res.json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/trigger-reschedule', async (req, res) => {
    try {
        const { phone, patientId, doctorId } = req.body;
        if (!isConnected || !sock) return res.status(500).json({ error: 'WhatsApp is not connected yet.' });
        
        let formattedNumber = phone.replace(/[^0-9]/g, '');
        if (formattedNumber.startsWith('01')) formattedNumber = '2' + formattedNumber;
        const senderJid = `${formattedNumber}@s.whatsapp.net`;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(tomorrow);
        nextDay.setDate(nextDay.getDate() + 1);

        let query = supabase
            .from('appointments')
            .select('appointment_date')
            .gte('appointment_date', tomorrow.toISOString())
            .lt('appointment_date', nextDay.toISOString())
            .eq('status', 'Scheduled');
        
        if (doctorId) {
            query = query.eq('doctor_id', doctorId);
        }

        const { data: tomorrowAppts } = await query;
        const takenTimes = (tomorrowAppts || []).map(a => new Date(a.appointment_date).getTime());

        const availableSlots = [];
        let slotTime = new Date(tomorrow);
        slotTime.setHours(10, 0, 0, 0);

        while (slotTime.getHours() < 22 && availableSlots.length < 5) {
            if (!takenTimes.includes(slotTime.getTime())) {
                const hours = slotTime.getHours();
                const ampm = hours >= 12 ? 'مساءً' : 'صباحاً';
                const displayHours = hours % 12 || 12;
                const mins = slotTime.getMinutes() === 0 ? '00' : '30';
                
                availableSlots.push({
                    text: `غداً ${displayHours}:${mins} ${ampm}`,
                    date: new Date(slotTime)
                });
            }
            slotTime.setMinutes(slotTime.getMinutes() + 30);
        }

        if (availableSlots.length === 0) {
            await sock.sendMessage(senderJid, { text: `نعتذر منك، لقد تم إلغاء الموعد لظروف طارئة، ولا يوجد مواعيد متاحة غداً.\nسيتواصل معك الاستقبال قريباً لتحديد موعد آخر.` });
            return res.json({ success: true, message: 'No slots available, sent apology.' });
        }

        const slotTexts = availableSlots.map((s, idx) => `${idx + 1}. ${s.text}`);

        patientConversations[patientId] = {
            state: 'WAITING_SLOT_SELECTION',
            selectedDoctorId: doctorId,
            availableSlots: availableSlots
        };
        
        await sock.sendMessage(senderJid, { text: `نعتذر منك، نظراً لظروف طارئة تم إلغاء موعدك السابق.\n\nالرجاء اختيار موعد جديد من الأوقات المتاحة التالية:\n\n${slotTexts.join('\n')}\n\nيرجى الرد برقم الموعد المناسب لك:` });

        res.json({ success: true, message: 'Reschedule request sent successfully.' });
    } catch (error) {
        console.error('Trigger reschedule error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cron Jobs for Appointment Reminders
// Runs every hour at minute 0
cron.schedule('0 * * * *', async () => {
    if (!isConnected || !sock) return;
    try {
        console.log('[Cron] Running appointment reminders check...');
        
        // 1. Send 24h Reminder
        const tomorrowStart = new Date();
        tomorrowStart.setHours(tomorrowStart.getHours() + 24);
        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setHours(tomorrowEnd.getHours() + 1);

        const { data: upcoming24h } = await supabase
            .from('appointments')
            .select('*, patients(*)')
            .gte('appointment_date', tomorrowStart.toISOString())
            .lt('appointment_date', tomorrowEnd.toISOString())
            .eq('status', 'Scheduled');

        if (upcoming24h) {
            for (const appt of upcoming24h) {
                if (appt.patients && appt.patients.phone) {
                    let phone = appt.patients.phone.replace(/[^0-9]/g, '');
                    if (phone.startsWith('01')) phone = '2' + phone;
                    const jid = `${phone}@s.whatsapp.net`;
                    const timeStr = new Date(appt.appointment_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                    await sock.sendMessage(jid, { text: `تذكير بموعدك ⏰\nأهلاً أ. ${appt.patients.full_name}\nنذكرك بموعدك غداً الساعة ${timeStr} في لومينا ديجيتال 🦷.` });
                }
            }
        }

        // 2. Send 1h Reminder
        const oneHourStart = new Date();
        oneHourStart.setHours(oneHourStart.getHours() + 1);
        const oneHourEnd = new Date(oneHourStart);
        oneHourEnd.setMinutes(oneHourEnd.getMinutes() + 59);

        const { data: upcoming1h } = await supabase
            .from('appointments')
            .select('*, patients(*)')
            .gte('appointment_date', oneHourStart.toISOString())
            .lt('appointment_date', oneHourEnd.toISOString())
            .eq('status', 'Scheduled');

        if (upcoming1h) {
            for (const appt of upcoming1h) {
                if (appt.patients && appt.patients.phone) {
                    let phone = appt.patients.phone.replace(/[^0-9]/g, '');
                    if (phone.startsWith('01')) phone = '2' + phone;
                    const jid = `${phone}@s.whatsapp.net`;
                    await sock.sendMessage(jid, { text: `تذكير اقتراب الموعد ⏰\nنذكرك بأن موعدك بعد ساعة من الآن.\nنتمنى لك وصولاً آمناً 🦷.` });
                }
            }
        }
    } catch (err) {
        console.error('[Cron] Error running reminders:', err);
    }
});

// Doctor Morning Briefing
cron.schedule('0 8 * * *', async () => {
    if (!isConnected || !sock) return;
    try {
        console.log('[Cron] Running morning briefing...');
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const { data: todayAppts } = await supabase
            .from('appointments')
            .select('*, patients(*)')
            .gte('appointment_date', todayStart.toISOString())
            .lt('appointment_date', todayEnd.toISOString())
            .eq('status', 'Scheduled')
            .order('appointment_date', { ascending: true });

        const count = todayAppts?.length || 0;
        let msg = `صباح الخير يا دكتور ☕\nلديك اليوم ${count} مواعيد مجدولة.\n\n`;

        if (count > 0) {
            const firstAppt = todayAppts[0];
            const timeStr = new Date(firstAppt.appointment_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            msg += `أول موعد الساعة ${timeStr} للمريض/ة: ${firstAppt.patients?.full_name}\n`;
            msg += `\nنتمنى لك يوماً موفقاً في لومينا ديجيتال 🦷✨`;
        } else {
            msg += `لا يوجد مواعيد مسجلة لليوم حتى الآن.`;
        }

        const adminPhone = process.env.ADMIN_PHONE || '201223840100';
        const adminJid = `${adminPhone}@s.whatsapp.net`;
        await sock.sendMessage(adminJid, { text: msg });
    } catch (err) {
        console.error('[Cron] Error running morning briefing:', err);
    }
});

// Doctor Evening Briefing (Revenue Summary)
cron.schedule('0 23 * * *', async () => {
    if (!isConnected || !sock) return;
    try {
        console.log('[Cron] Running evening briefing...');
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        // Fetch today's invoices
        const { data: todayInvoices } = await supabase
            .from('invoices')
            .select('paid_amount')
            .gte('created_at', todayStart.toISOString())
            .lt('created_at', todayEnd.toISOString());

        const totalIncome = todayInvoices?.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0) || 0;

        // Fetch today's expenses
        const { data: todayExpenses } = await supabase
            .from('expenses')
            .select('amount')
            .gte('created_at', todayStart.toISOString())
            .lt('created_at', todayEnd.toISOString());

        const totalExpenses = todayExpenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;

        const netProfit = totalIncome - totalExpenses;

        let msg = `ملخص نهاية اليوم المالي 📊\n\n`;
        msg += `إجمالي الإيرادات: ${totalIncome.toLocaleString()} ج.م 🟢\n`;
        msg += `إجمالي المصروفات: ${totalExpenses.toLocaleString()} ج.م 🔴\n`;
        msg += `الصافي: ${netProfit.toLocaleString()} ج.م\n\n`;
        msg += `تصبح على خير يا دكتور 🌙`;

        const adminPhone = process.env.ADMIN_PHONE || '201223840100';
        const adminJid = `${adminPhone}@s.whatsapp.net`;
        await sock.sendMessage(adminJid, { text: msg });
    } catch (err) {
        console.error('[Cron] Error running evening briefing:', err);
    }
});

// Post-Op Follow-up Cron Job (Runs every day at 12:00 PM)
cron.schedule('0 12 * * *', async () => {
    if (!isConnected || !sock) return;
    try {
        console.log('[Cron] Running post-op follow-ups...');
        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterdayStart);
        yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

        const { data: yesterdayAppts } = await supabase
            .from('appointments')
            .select('*, patients(*)')
            .gte('appointment_date', yesterdayStart.toISOString())
            .lt('appointment_date', yesterdayEnd.toISOString())
            .in('status', ['Scheduled', 'Completed']); 

        if (yesterdayAppts) {
            for (const appt of yesterdayAppts) {
                if (appt.patients && appt.patients.phone) {
                    let phone = appt.patients.phone.replace(/[^0-9]/g, '');
                    if (phone.startsWith('01')) phone = '2' + phone;
                    const jid = `${phone}@s.whatsapp.net`;
                    await sock.sendMessage(jid, { text: `مرحباً أ. ${appt.patients.full_name} 🌸\nنتمنى أن تكون بصحة جيدة بعد زيارتك لنا بالأمس في لومينا ديجيتال 🦷.\nإذا شعرت بأي ألم مستمر أو احتجت لاستشارة، لا تتردد في مراسلتنا هنا.` });
                }
            }
        }
    } catch (err) {
        console.error('[Cron] Error running post-op follow-ups:', err);
    }
});

// Broadcast Route
app.post('/api/broadcast', async (req, res) => {
    try {
        const { message, patientIds } = req.body;
        if (!isConnected || !sock) return res.status(500).json({ error: 'WhatsApp is not connected yet.' });
        if (!message) return res.status(400).json({ error: 'Missing message.' });
        
        let query = supabase.from('patients').select('id, phone');
        if (patientIds && patientIds.length > 0) {
            query = query.in('id', patientIds);
        }
        
        const { data: patients } = await query;
        let sentCount = 0;

        for (const pt of patients) {
            if (pt.phone) {
                let phone = pt.phone.replace(/[^0-9]/g, '');
                if (phone.startsWith('01')) phone = '2' + phone;
                const jid = `${phone}@s.whatsapp.net`;
                try {
                    await sock.sendMessage(jid, { text: message });
                    sentCount++;
                } catch(e) {}
            }
        }
        
        res.json({ success: true, sentCount, total: patients.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// WhatsApp Outbox Poller
setInterval(async () => {
    if (!isConnected || !sock) return;
    try {
        const { data: messages, error } = await supabase
            .from('whatsapp_queue')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(10);
            
        if (error || !messages || messages.length === 0) return;

        for (const msg of messages) {
            if (msg.phone && msg.message) {
                let formattedNumber = msg.phone.replace(/[^0-9]/g, '');
                if (formattedNumber.startsWith('01')) formattedNumber = '2' + formattedNumber;
                const jid = `${formattedNumber}@s.whatsapp.net`;
                
                try {
                    await sock.sendMessage(jid, { text: msg.message });
                    await supabase.from('whatsapp_queue').update({ status: 'sent' }).eq('id', msg.id);
                } catch(e) {
                    console.error('Failed to send queue message:', e);
                    await supabase.from('whatsapp_queue').update({ status: 'failed' }).eq('id', msg.id);
                }
            } else {
                await supabase.from('whatsapp_queue').update({ status: 'invalid' }).eq('id', msg.id);
            }
        }
    } catch (err) {
        // Silent catch for missing table or network issues
    }
}, 3000);

app.listen(process.env.PORT || 4000, '0.0.0.0', () => console.log(`WhatsApp Microservice is running on 0.0.0.0:4000`));
