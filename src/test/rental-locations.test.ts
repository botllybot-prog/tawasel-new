import { describe, expect, it } from 'vitest';
import { changeCountry, citiesForCountry, inferCountry } from '../lib/rental-locations';
import { kinds } from '../lib/tobezly';

describe('Rental location selection', () => {
  it('shows only cities belonging to the selected country', () => {
    expect(citiesForCountry('IQ').some(city => city.name === 'Baghdad')).toBe(true);
    expect(citiesForCountry('TR').some(city => city.name === 'Baghdad')).toBe(false);
  });
  it('clears the previous city when the country changes', () => {
    expect(changeCountry('TR')).toEqual({ country: 'TR', city: '' });
  });
  it('infers the country for an existing city', () => {
    expect(inferCountry('Baghdad')).toBe('IQ');
  });
  it('allows apartment listings', () => { expect(kinds).toHaveProperty('apartment'); });
  it('allows cafeteria listings', () => { expect(kinds).toHaveProperty('cafeteria'); });
  it('allows bar listings', () => { expect(kinds).toHaveProperty('bar'); });
});