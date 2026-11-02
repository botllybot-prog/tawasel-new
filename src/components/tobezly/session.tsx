import { createContext,useContext,useEffect,useState,type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
const Session=createContext<{user:User|null;ready:boolean}>({user:null,ready:false});
export function SessionProvider({children}:{children:ReactNode}){const [user,setUser]=useState<User|null>(null);const [ready,setReady]=useState(false);const qc=useQueryClient();useEffect(()=>{let active=true;supabase.auth.getUser().then(({data})=>{if(active){setUser(data.user);setReady(true);}});const {data}=supabase.auth.onAuthStateChange((event,session)=>{if(event==='INITIAL_SESSION')return;setUser(session?.user??null);setReady(true);if(event==='SIGNED_OUT')qc.clear();else if(event==='SIGNED_IN'||event==='USER_UPDATED')qc.invalidateQueries();});return()=>{active=false;data.subscription.unsubscribe();};},[qc]);return <Session.Provider value={{user,ready}}>{children}</Session.Provider>;}
export const useSession=()=>useContext(Session);
