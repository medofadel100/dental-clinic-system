require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const services = [
  { name: 'كشف مبدئي (Consultation)', base_price: 300 },
  { name: 'إعادة كشف (Re-check)', base_price: 0 },
  { name: 'خلع بسيط (Simple Extraction)', base_price: 500 },
  { name: 'خلع جراحي (Surgical Extraction)', base_price: 1500 },
  { name: 'حشو عادي (Amalgam Filling)', base_price: 600 },
  { name: 'حشو تجميلي ليزر (Composite Filling)', base_price: 800 },
  { name: 'حشو عصب (Root Canal Treatment)', base_price: 1500 },
  { name: 'تنظيف وتلميع أسنان (Scaling & Polishing)', base_price: 600 },
  { name: 'تبييض بالليزر (Laser Teeth Whitening)', base_price: 2500 },
  { name: 'طربوش بورسلين (Porcelain Crown)', base_price: 1200 },
  { name: 'طربوش زيركون (Zirconia Crown)', base_price: 2500 },
  { name: 'تركيب تقويم معدني (Metal Braces)', base_price: 15000 },
];

async function seedServices() {
  console.log('Seeding services...');
  
  for (const s of services) {
    const { data, error } = await supabase
      .from('services_catalog')
      .upsert([s], { onConflict: 'name' }) // this requires a unique constraint, but we don't have one.
      // So let's just check if it exists first.
      ;
  }
}

async function safeSeed() {
  for (const s of services) {
    const { data: existing } = await supabase.from('services_catalog').select('id').eq('name', s.name).single();
    if (!existing) {
      const { error } = await supabase.from('services_catalog').insert([s]);
      if (error) console.error(`Error inserting ${s.name}:`, error.message);
      else console.log(`Inserted: ${s.name}`);
    } else {
      console.log(`Already exists: ${s.name}`);
    }
  }
  console.log('Seeding complete!');
}

safeSeed();
