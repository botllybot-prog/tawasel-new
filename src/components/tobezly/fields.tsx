import type {InputHTMLAttributes,ReactNode} from 'react';
import { Button } from '@/components/ui/button';
import { interests } from '@/lib/tobezly';
export function Field({label,...props}:InputHTMLAttributes<HTMLInputElement>&{label:string}){return <label className="field"><span>{label}</span><input {...props}/></label>;}
export function TextField({label,children}:{label:string;children:ReactNode}){return <label className="field"><span>{label}</span>{children}</label>;}
export function Interests({value,onChange}:{value:string[];onChange:(v:string[])=>void}){return <div className="interest-options">{interests.map(i=><Button key={i} type="button" variant={value.includes(i)?'default':'outline'} onClick={()=>onChange(value.includes(i)?value.filter(x=>x!==i):[...value,i])}>{i}</Button>)}</div>;}
