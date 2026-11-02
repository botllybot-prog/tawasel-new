import { useState } from 'react';
import { TextField } from './fields';
import { useLanguage } from './language';
import { changeCountry, citiesForCountry, inferCountry, rentalCountries } from '@/lib/rental-locations';

export function LocationFields({ initialCity = '', initialCountry }: { initialCity?: string; initialCountry?: string | null }) {
  const { t, language } = useLanguage();
  const [location, setLocation] = useState(() => ({ country: initialCountry ?? inferCountry(initialCity), city: initialCity }));
  const locale = language === 'ku' ? 'ar' : language;
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  const cities = citiesForCountry(location.country);
  const legacyCity = location.city && !cities.some(city => city.name === location.city || city.ar === location.city);
  return <div className="form-columns">
    <TextField label={t('الدولة')}><select name="country_code" value={location.country} required onChange={event => setLocation(changeCountry(event.target.value))}>
      <option value="" disabled>{t('اختر الدولة')}</option>
      {[...rentalCountries].sort((a, b) => (names.of(a.code) ?? a.name).localeCompare(names.of(b.code) ?? b.name, locale)).map(country => <option key={country.code} value={country.code}>{names.of(country.code) ?? country.name}</option>)}
    </select></TextField>
    <TextField label={t('المدينة')}><select name="city" value={location.city} required disabled={!location.country} onChange={event => setLocation(current => ({ ...current, city: event.target.value }))}>
      <option value="" disabled>{t('اختر المدينة')}</option>
      {legacyCity && <option value={location.city}>{location.city}</option>}
      {cities.map(city => <option key={city.name} value={city.ar === location.city ? city.ar : city.name}>{language === 'en' ? city.name : city.ar}</option>)}
    </select></TextField>
  </div>;
}