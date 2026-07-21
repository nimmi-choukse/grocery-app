import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const main = async () => {
  const res = await supabase.from('addresses').select('id, user_id, profile_id, address_type, type, line1, line2, city, state, pincode').limit(1);
  console.log(JSON.stringify(res, null, 2));
  const res2 = await supabase.from('addresses').select('id, user_id, profile_id').limit(1);
  console.log(JSON.stringify(res2, null, 2));
};

main().catch((err) => { console.error(err); process.exit(1); });
