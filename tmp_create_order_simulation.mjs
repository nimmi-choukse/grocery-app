import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const main = async () => {
  const userId = '4b6a9b99-e4eb-4930-abb6-7b3a2d1ae1fe';
  const checkoutData = {
    customerName: 'Test Customer',
    phone: '9876543210',
    addressLine1: '123 Test Street',
    area: 'Test Area',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456',
    deliveryNotes: 'Leave at door',
  };

  console.log('Inserting/updating profile');
  const profileRes = await supabase.from('profiles').upsert({
    id: userId,
    full_name: checkoutData.customerName,
    phone: checkoutData.phone,
    role: 'customer',
  }, { onConflict: 'id' }).select('id');
  console.log(JSON.stringify(profileRes, null, 2));

  console.log('Inserting address');
  const addressRes = await supabase.from('addresses').insert({
    user_id: userId,
    line1: checkoutData.addressLine1,
    line2: checkoutData.area || null,
    city: checkoutData.city,
    state: checkoutData.state,
    pincode: checkoutData.pincode,
  }).select('id').single();
  console.log(JSON.stringify(addressRes, null, 2));

  console.log('Creating order');
  const subtotal = 100;
  const orderRes = await supabase.from('orders').insert({
    customer_id: userId,
    status: 'pending',
    payment_method: 'cod',
    subtotal,
    delivery_fee: 0,
    customer_note: checkoutData.deliveryNotes || null,
    address_id: addressRes.data?.id || null,
  }).select('id, address_id').single();
  console.log(JSON.stringify(orderRes, null, 2));
};

main().catch((err) => { console.error(err); process.exit(1); });
