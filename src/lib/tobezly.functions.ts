import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
export const listSpaces = createServerFn({method:'GET'}).handler(async()=>{
 const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY']; if(!url||!key) throw new Error('تعذر تحميل الأماكن');
 const client=createClient<Database>(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 const {data,error}=await client.from('spaces').select('*').eq('published',true).order('created_at',{ascending:false});if(error)throw error;return data;
});
