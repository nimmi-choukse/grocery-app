import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const main = async () => {
  const tables = ['addresses', 'profiles', 'orders'];
  for (const table of tables) {
    console.log(`--- ${table} columns ---`);
    const cols = await supabase
      .from('information_schema.columns')
      .select('column_name,data_type,is_nullable,column_default')
      .eq('table_name', table)
      .order('ordinal_position', { ascending: true });
    console.log(JSON.stringify(cols, null, 2));
    console.log(`--- ${table} constraints ---`);
    const constraints = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name,constraint_type')
      .eq('table_name', table);
    console.log(JSON.stringify(constraints, null, 2));
  }
};

main().catch((err) => { console.error(err); process.exit(1); });
