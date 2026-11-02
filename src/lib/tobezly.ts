export const interests = ['القراءة', 'السفر', 'الموسيقى', 'الفن', 'الرياضة', 'التقنية', 'الطبيعة', 'القهوة'];
export const kinds: Record<string,string> = {office:'مكتب',meeting:'قاعة اجتماعات',studio:'استوديو',home:'منزل'};
export function isAdult(dob: string, now = new Date()) { const birth = new Date(`${dob}T00:00:00Z`); if (Number.isNaN(birth.getTime())) return false; let age=now.getUTCFullYear()-birth.getUTCFullYear(); if (now.getUTCMonth()<birth.getUTCMonth() || (now.getUTCMonth()===birth.getUTCMonth() && now.getUTCDate()<birth.getUTCDate())) age--; return age>=18 && age<=110; }
export function priceFor(mode: string, hours: number, hourly: number, daily: number) { return mode==='day'?daily:Math.ceil(hours)*hourly; }
export function metadata(title:string,description:string) { return {meta:[{title:`${title} | تواصل Tawasel`},{name:'description',content:description},{property:'og:title',content:`${title} | تواصل Tawasel`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}; }
export function money(value:number) { return new Intl.NumberFormat('ar-IQ').format(value)+' د.ع'; }
export function when(value:string) {return new Date(value).toLocaleString('ar-IQ',{dateStyle:'medium',timeStyle:'short'});}
