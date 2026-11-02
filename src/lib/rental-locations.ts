import catalog from './data/rental-locations.json';

export const rentalCountries = catalog;
export function citiesForCountry(code: string) {
  return rentalCountries.find(country => country.code === code)?.cities ?? [];
}
export function inferCountry(city: string) {
  return rentalCountries.find(country => country.cities.some(item => item.name === city || item.ar === city))?.code ?? '';
}
export function changeCountry(code: string) {
  return { country: code, city: '' };
}