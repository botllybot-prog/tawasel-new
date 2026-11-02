import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';import {translations} from '@/lib/translations';
export type Language='ar'|'en'|'ku';
const LanguageContext=createContext<{language:Language;setLanguage:(v:Language)=>void;t:(v:string)=>string}>({language:'ar',setLanguage:()=>{},t:v=>v});
export function LanguageProvider({children}:{children:ReactNode}){const [language,setLanguage]=useState<Language>('ar');useEffect(()=>{const stored=localStorage.getItem('tobezly-language');if(stored==='en'||stored==='ku')setLanguage(stored);},[]);useEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=language==='en'?'ltr':'rtl';localStorage.setItem('tobezly-language',language);},[language]);const t=(v:string)=>language==='ar'?v:translations[v]?.[language==='en'?0:1]??v;return <LanguageContext.Provider value={{language,setLanguage,t}}>{children}</LanguageContext.Provider>;}
export const useLanguage=()=>useContext(LanguageContext);
