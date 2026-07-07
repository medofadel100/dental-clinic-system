const { GoogleGenerativeAI } = require('@google/generative-ai');

// In-memory store for chat histories (arrays of messages, NOT ChatSession objects)
const patientHistories = {};

// Key rotation tracker
let currentKeyIndex = 0;

function getNextApiKey() {
    // Read keys from GEMINI_API_KEYS (comma separated) or GEMINI_API_KEY
    let keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
    if (!keysStr) {
        throw new Error("No Gemini key found in env. Please set GEMINI_API_KEYS.");
    }
    
    // Split by comma and remove whitespace
    const keys = keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
    if (keys.length === 0) {
        throw new Error("No valid keys found in GEMINI_API_KEYS.");
    }

    // Select key and increment index
    const selectedKey = keys[currentKeyIndex % keys.length];
    currentKeyIndex++;
    return selectedKey;
}

const systemInstruction = `أنت موظف استقبال طبي وذكي جداً لعيادة أسنان متميزة تُدعى (لومينا ديجيتال). 
هدفك الأساسي استقبال المرضى الجدد والقدامى، الإجابة على استفساراتهم الطبية البسيطة، وطمأنتهم، وإدارة الحجوزات.
قواعدك الأساسية:
1. تحدث بالعامية المصرية الراقية والودودة جداً.
2. أنت متصل بقاعدة بيانات العيادة ولديك وعي تام بالوقت الحالي.
3. **إذا كان المريض يتحدث لأول مرة (مريض جديد):** رحب به بحرارة في لومينا ديجيتال، وأخبره أن هذا الرقم غير مسجل في النظام. اطلب منه بلباقة أن يخبرك بـ (الاسم الثلاثي) لفتح ملف طبي له.
4. **بمجرد أن يعطيك المريض الجديد اسمه:** استخدم أداة التسجيل (register_patient) لفتح الملف، ثم هنئه بفتح الملف واسأله متى يحب أن يحجز الموعد.
5. لا تحجز أي موعد لمريض جديد قبل أن تستخدم أداة التسجيل لإنشاء ملفه أولاً!
6. قبل حجز أي موعد، استخدم أداة البحث عن المواعيد (check_availability) لاقتراح أوقات وأطباء متاحين.
7. لا تحجز موعداً أبداً بدون استخدام أداة البحث أولاً لتتأكد أن الطبيب يعمل في هذا اليوم.
8. إذا طلب المريض طبيباً معيناً وكان إجازة أو جدوله ممتلئ، اقترح عليه طبيباً آخر متاحاً من نتيجة البحث، أو اقترح عليه أقرب يوم آخر يعمل فيه هذا الطبيب.
9. بعد التأكد التام من اختيار المريض للطبيب والوقت، استخدم أداة "حجز موعد" لتأكيد الحجز.
10. الأسعار: الكشف 300 جنيه، حشو العصب 1500، الخلع 500-1000، التنظيف 800.`;

// 1. Define Tools
const checkAvailabilityDecl = {
    name: "check_availability",
    description: "تبحث عن المواعيد والأطباء المتاحين للحجز في يوم معين. ترجع قائمة بالأطباء المتاحين وأوقات عملهم.",
    parameters: {
        type: "OBJECT",
        properties: {
            date: {
                type: "STRING",
                description: "التاريخ المطلوب البحث فيه بصيغة YYYY-MM-DD (مثال: 2023-11-25)"
            },
            doctor_name: {
                type: "STRING",
                description: "اسم الطبيب إذا طلب المريض طبيباً محدداً (مثلاً: مصطفى، أحمد). اتركه فارغاً إذا لم يحدد المريض."
            }
        },
        required: ["date"]
    }
};

const bookAppointmentDecl = {
    name: "book_appointment",
    description: "تقوم بتأكيد وحجز الموعد للمريض عند طبيب محدد في قاعدة البيانات.",
    parameters: {
        type: "OBJECT",
        properties: {
            date: {
                type: "STRING",
                description: "تاريخ الموعد بصيغة YYYY-MM-DD"
            },
            time: {
                type: "STRING",
                description: "وقت الموعد بصيغة HH:mm (مثال: 14:00 يعني 2 مساءً)"
            },
            doctor_id: {
                type: "STRING",
                description: "رقم الـ ID الخاص بالطبيب المتاح الذي اختاره المريض وتم إرجاعه من أداة البحث."
            }
        },
        required: ["date", "time", "doctor_id"]
    }
};

const registerPatientDecl = {
    name: "register_patient",
    description: "تقوم بتسجيل ملف طبي لمريض جديد في الداتابيز. استخدم هذه الأداة بمجرد أن يعطيك المريض الجديد اسمه.",
    parameters: {
        type: "OBJECT",
        properties: {
            full_name: {
                type: "STRING",
                description: "الاسم الكامل للمريض كما أدخله."
            }
        },
        required: ["full_name"]
    }
};

async function handleIncomingMessage(patient, textMessage, supabase, sock, senderJid) {
    // 1. Initialize History if not exists
    if (!patientHistories[patient.id]) {
        let medicalContext = "";
        
        if (patient.is_new) {
            medicalContext = `تنبيه هام للذكاء الاصطناعي: هذا المريض يتحدث للمرة الأولى ورقم هاتفه (${patient.phone}) غير مسجل في السيستم. رحب به واطلب منه الاسم الثلاثي لفتح الملف واستخدم أداة register_patient.`;
        } else {
            // Fetch patient history for better context
            const { data: pastAppts } = await supabase
                .from('appointments')
                .select('appointment_date, status, profiles(full_name), treatments(treatment_plan)')
                .eq('patient_id', patient.id)
                .order('appointment_date', { ascending: false })
                .limit(3);

            medicalContext = `بيانات المريض الحالي الذي يتحدث معك الآن:\nالاسم: ${patient.full_name}\nالهاتف: ${patient.phone}\n`;
            if (pastAppts && pastAppts.length > 0) {
                medicalContext += `مواعيده السابقة:\n`;
                pastAppts.forEach(a => {
                    const docName = a.profiles?.full_name ? ` مع د. ${a.profiles.full_name}` : '';
                    medicalContext += `- تاريخ: ${new Date(a.appointment_date).toLocaleDateString('ar-EG')} ${docName}, الحالة: ${a.status}\n`;
                });
            } else {
                medicalContext += `هذا مريض مسجل لدينا ولكن ليس له مواعيد سابقة مسجلة.\n`;
            }
        }

        patientHistories[patient.id] = [
            { role: 'user', parts: [{ text: medicalContext }] },
            { role: 'model', parts: [{ text: 'علمت ذلك، ومستعد لمساعدته بناءً على هذه البيانات.' }] }
        ];
    }

    let success = false;
    let lastError = null;
    const maxRetries = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',').length : 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // 2. Select API Key & Init Model
            const activeApiKey = getNextApiKey();
            const genAI = new GoogleGenerativeAI(activeApiKey);
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.5-flash', 
                tools: [{
                    functionDeclarations: [checkAvailabilityDecl, bookAppointmentDecl, registerPatientDecl]
                }],
                systemInstruction: systemInstruction
            });

            // Create fresh chat session with preserved history
            // Use JSON parse/stringify to deeply clone the history so retries don't stack modifications
            const chat = model.startChat({
                history: JSON.parse(JSON.stringify(patientHistories[patient.id]))
            });

            // Time Awareness
            const now = new Date();
            const cairoTimeOptions = { timeZone: 'Africa/Cairo', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
            const currentCairoTimeStr = now.toLocaleString('ar-EG', cairoTimeOptions);

            let timeContext = `\n[تحديث زمني]: التاريخ والوقت الآن هو: ${currentCairoTimeStr}.`;

            // Append time awareness to their message invisibly
            const augmentedMessage = `${textMessage}\n${timeContext}`;
            let result = await chat.sendMessage(augmentedMessage);
            
            // Handle Function Calling recursively
            let functionCalls = result.response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall)?.map(p => p.functionCall) || [];
            if (typeof result.response.functionCalls === 'function') {
                const extracted = result.response.functionCalls();
                if (extracted && extracted.length > 0) functionCalls = extracted;
            }

            while (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                let functionResult = {};

                if (call.name === 'register_patient') {
                    const fullName = call.args.full_name;
                    
                    const { data: newPatient, error } = await supabase.from('patients').insert([{
                        full_name: fullName,
                        phone: patient.phone,
                    }]).select('id').single();

                    if (error) {
                        console.error('Registration Error:', error);
                        functionResult = { success: false, message: "حدث خطأ في قاعدة البيانات أثناء تسجيل المريض." };
                    } else {
                        const oldTempId = patient.id;
                        patient.id = newPatient.id;
                        patient.is_new = false;
                        patient.full_name = fullName;
                        
                        patientHistories[patient.id] = patientHistories[oldTempId];
                        delete patientHistories[oldTempId];

                        functionResult = { success: true, message: `تم تسجيل المريض بنجاح باسم ${fullName}. معرف المريض الجديد: ${patient.id}. يمكنك الآن المتابعة في حجز الموعد باستخدام الأدوات الأخرى.` };
                        
                        try {
                            const adminPhone = process.env.ADMIN_PHONE || '201223840100'; 
                            const adminJid = `${adminPhone}@s.whatsapp.net`;
                            await sock.sendMessage(adminJid, { text: `🆕 مريض جديد انضم للعيادة (عبر الذكاء الاصطناعي):\nالاسم: ${fullName}\nالهاتف: ${patient.phone}` });
                        } catch (err) {}
                    }
                }
                else if (call.name === 'check_availability') {
                    const requestedDateStr = call.args.date;
                    const requestedDoctor = call.args.doctor_name || '';
                    
                    const requestedDate = new Date(requestedDateStr);
                    const dayOfWeek = requestedDate.getDay();

                    const { data: settings } = await supabase.from('clinic_settings').select('*').single();
                    const workingDays = settings?.working_days || [0, 1, 2, 3, 4, 6];
                    const slotDuration = settings?.slot_duration || 30;

                    if (!workingDays.includes(dayOfWeek)) {
                        functionResult = { message: "العيادة إجازة مغلقة في هذا اليوم بالكامل." };
                    } else {
                        let doctorsQuery = supabase.from('profiles').select('id, full_name').eq('role', 'Doctor');
                        if (requestedDoctor) {
                            doctorsQuery = doctorsQuery.ilike('full_name', `%${requestedDoctor}%`);
                        }
                        const { data: doctors } = await doctorsQuery;

                        if (!doctors || doctors.length === 0) {
                            functionResult = { message: "لم يتم العثور على طبيب بهذا الاسم." };
                        } else {
                            const doctorIds = doctors.map(d => d.id);
                            
                            const { data: schedules } = await supabase
                                .from('doctor_schedules')
                                .select('*')
                                .in('doctor_id', doctorIds)
                                .eq('day_of_week', dayOfWeek)
                                .eq('is_active', true);

                            if (!schedules || schedules.length === 0) {
                                functionResult = { 
                                    message: requestedDoctor ? 
                                    `الطبيب د. ${requestedDoctor} إجازة أو لا يعمل في هذا اليوم. الرجاء ترشيح يوم آخر أو طبيب آخر.` : 
                                    "لا يوجد أطباء يعملون في هذا اليوم."
                                };
                            } else {
                                const startOfDay = new Date(requestedDateStr);
                                startOfDay.setHours(0, 0, 0, 0);
                                const endOfDay = new Date(requestedDateStr);
                                endOfDay.setHours(23, 59, 59, 999);

                                const { data: existingAppts } = await supabase
                                    .from('appointments')
                                    .select('doctor_id, appointment_date')
                                    .gte('appointment_date', startOfDay.toISOString())
                                    .lte('appointment_date', endOfDay.toISOString())
                                    .eq('status', 'Scheduled');

                                let availableDoctorsResult = [];

                                schedules.forEach(schedule => {
                                    const doctorInfo = doctors.find(d => d.id === schedule.doctor_id);
                                    if (!doctorInfo) return;

                                    const startHour = parseInt(schedule.start_time.split(':')[0]);
                                    const endHour = parseInt(schedule.end_time.split(':')[0]);

                                    let slotTime = new Date(requestedDateStr);
                                    slotTime.setHours(startHour, 0, 0, 0);
                                    
                                    const endShift = new Date(requestedDateStr);
                                    endShift.setHours(endHour, 0, 0, 0);

                                    const docAppts = existingAppts ? existingAppts.filter(a => a.doctor_id === doctorInfo.id).map(a => new Date(a.appointment_date).getTime()) : [];

                                    let slots = [];
                                    while (slotTime < endShift && slots.length < 5) {
                                        if (!docAppts.includes(slotTime.getTime()) && slotTime > now) {
                                            const h = slotTime.getHours();
                                            const m = slotTime.getMinutes();
                                            slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                                        }
                                        slotTime.setMinutes(slotTime.getMinutes() + slotDuration);
                                    }

                                    if (slots.length > 0) {
                                        availableDoctorsResult.push({
                                            doctor_id: doctorInfo.id,
                                            doctor_name: doctorInfo.full_name,
                                            available_slots: slots
                                        });
                                    }
                                });

                                if (availableDoctorsResult.length > 0) {
                                    functionResult = { 
                                        message: "يوجد أطباء متاحين", 
                                        doctors: availableDoctorsResult 
                                    };
                                } else {
                                    functionResult = { message: "جميع الأطباء الذين يعملون في هذا اليوم محجوزون بالكامل. الرجاء اقتراح يوم آخر." };
                                }
                            }
                        }
                    }
                } 
                else if (call.name === 'book_appointment') {
                    if (patient.is_new) {
                        functionResult = { success: false, message: "لا يمكن حجز موعد لمريض جديد قبل فتح ملف وتسجيله أولاً باستخدام register_patient." };
                    } else {
                        const date = call.args.date;
                        const time = call.args.time;
                        const doctorId = call.args.doctor_id;
                        
                        const [h, m] = time.split(':');
                        const apptDate = new Date(date);
                        apptDate.setHours(parseInt(h), parseInt(m), 0, 0);

                        const { error } = await supabase.from('appointments').insert([{
                            patient_id: patient.id,
                            doctor_id: doctorId,
                            appointment_date: apptDate.toISOString(),
                            status: 'Scheduled',
                            notes: 'حجز تلقائي بواسطة الذكاء الاصطناعي'
                        }]);

                        if (error) {
                            console.error('Booking Error:', error);
                            functionResult = { success: false, message: "حدث خطأ في قاعدة البيانات أثناء الحجز." };
                        } else {
                            const { data: docData } = await supabase.from('profiles').select('full_name').eq('id', doctorId).single();
                            const docName = docData ? docData.full_name : "";

                            functionResult = { success: true, message: `تم حجز الموعد بنجاح يوم ${date} الساعة ${time} مع دكتور ${docName}` };
                            
                            try {
                                const adminPhone = process.env.ADMIN_PHONE || '201223840100'; 
                                const adminJid = `${adminPhone}@s.whatsapp.net`;
                                await sock.sendMessage(adminJid, { text: `🤖 إشعار حجز من الذكاء الاصطناعي:\nالمريض: ${patient.full_name}\nالطبيب: د. ${docName}\nالموعد: ${date} ${time}` });
                            } catch (err) {}
                        }
                    }
                }

                // Send function result back to Gemini
                result = await chat.sendMessage([{
                    functionResponse: {
                        name: call.name,
                        response: functionResult
                    }
                }]);
                
                functionCalls = result.response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall)?.map(p => p.functionCall) || [];
                if (typeof result.response.functionCalls === 'function') {
                    const extracted = result.response.functionCalls();
                    if (extracted && extracted.length > 0) functionCalls = extracted;
                }
            }

            // 3. Save History manually on SUCCESS
            const finalHistory = await chat.getHistory();
            patientHistories[patient.id] = finalHistory;

            const aiResponse = result.response.text();
            if (!aiResponse || aiResponse.trim() === '') {
                console.log("[Empty Response] Raw result:", JSON.stringify(result.response, null, 2));
                await sock.sendMessage(senderJid, { text: "لحظة واحدة براجع بياناتك..." });
            } else {
                await sock.sendMessage(senderJid, { text: aiResponse });
            }
            
            success = true;
            break; // Break out of retry loop

        } catch (e) {
            lastError = e;
            if (e.status === 429) {
                console.log(`[Rate Limit] Hit 429 on attempt ${attempt + 1}. Switching to next key...`);
                continue; // Try again with the next key
            }
            // If it's a different error, break and show technical error
            break;
        }
    }

    if (!success) {
        console.error('Gemini Final Error after retries:', lastError);
        if (lastError && lastError.status === 429) {
            await sock.sendMessage(senderJid, { text: `يرجى الانتظار للحظات والمحاولة مرة أخرى. (زحام في الاستقبال)` });
        } else {
            await sock.sendMessage(senderJid, { text: `عذراً، أواجه مشكلة تقنية بسيطة في الوقت الحالي. هل يمكنك التواصل معنا لاحقاً؟` });
        }
    }
}

module.exports = { handleIncomingMessage };
