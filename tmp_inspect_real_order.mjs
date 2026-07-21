import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const serviceSupabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ORDER_ID = 'fd62ef22-4335-42a7-a07c-aee7ff49b377';

const log = (title, result) => {
  console.log(`\n===== ${title} =====`);
  console.log(JSON.stringify(result, null, 2));
};

const main = async () => {
  const orderRes = await serviceSupabase.from('orders').select('*').eq('id', ORDER_ID).single();
  log('SERVICE ROLE: orders row', orderRes);

  if (!orderRes.data) {
    console.log('Order not found');
    return;
  }

  const customerId = orderRes.data.customer_id;
  const addressId = orderRes.data.address_id;

  const profileRes = await serviceSupabase.from('profiles').select('*').eq('id', customerId).single();
  log('SERVICE ROLE: profile row', profileRes);

  const addressRes = addressId
    ? await serviceSupabase.from('addresses').select('*').eq('id', addressId).single()
    : { data: null, error: null, status: 200, statusText: 'OK' };
  log('SERVICE ROLE: address row', addressRes);

  const adminOrdersRes = await anonSupabase.from('orders').select('*').order('placed_at', { ascending: false });
  log('ANON: orders query result', adminOrdersRes);

  const customerIds = [...new Set((adminOrdersRes.data || []).map((o) => o.customer_id).filter(Boolean))];
  console.log('ANON: customerIds', JSON.stringify(customerIds));
  const profilesRes = await anonSupabase.from('profiles').select('id, full_name, phone').in('id', customerIds);
  log('ANON: profiles query result', profilesRes);

  const addressIds = [...new Set((adminOrdersRes.data || []).map((o) => o.address_id).filter(Boolean))];
  console.log('ANON: addressIds', JSON.stringify(addressIds));
  const addressesRes = await anonSupabase.from('addresses').select('id, line1, line2, city, state, pincode').in('id', addressIds);
  log('ANON: addresses query result', addressesRes);

  if (orderRes.data) {
    const profileSingle = await anonSupabase.from('profiles').select('*').eq('id', orderRes.data.customer_id).single();
    log('ANON: direct profile lookup', profileSingle);
    const addressSingle = await anonSupabase.from('addresses').select('*').eq('id', orderRes.data.address_id).single();
    log('ANON: direct address lookup', addressSingle);
  }
};

main().catch((err) => { console.error(err); process.exit(1); });
