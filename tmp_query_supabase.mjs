import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const main = async () => {
  const [ordersRes, profilesRes, addressesRes] = await Promise.all([
    supabase.from('orders').select('id, customer_id, address_id, status, subtotal, total, customer_note, placed_at').order('placed_at', { ascending: false }).limit(10),
    supabase.from('profiles').select('id, full_name, phone, role').order('id', { ascending: false }).limit(10),
    supabase.from('addresses').select('id, line1, line2, city, state, pincode').order('id', { ascending: false }).limit(10),
  ]);
  console.log(JSON.stringify({ orders: ordersRes, profiles: profilesRes, addresses: addressesRes }, null, 2));
};

main().catch((err) => { console.error(err); process.exit(1); });
