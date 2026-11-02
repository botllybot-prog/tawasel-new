import { describe, expect, it } from 'vitest';
import { isPublishedSpacePhoto } from '@/lib/space-photo-access';

const owner = '00000000-0000-4000-8000-000000000001';
const path = `${owner}/00000000-0000-4000-8000-000000000002.jpeg`;
const listing = { owner_id: owner, published: true, photos: [path] };
describe('Rental photo authorization', () => {
  it('allows an exact photo from its owner published listing', () => {
    expect(isPublishedSpacePhoto(path, listing)).toBe(true);
  });
  it('denies unpublished listing photos', () => {
    expect(isPublishedSpacePhoto(path, { ...listing, published: false })).toBe(false);
  });
  it('denies unattached photos', () => {
    expect(isPublishedSpacePhoto(path, { ...listing, photos: [] })).toBe(false);
  });
  it('denies another owner attaching a private photo', () => {
    expect(isPublishedSpacePhoto(path, { ...listing, owner_id: '00000000-0000-4000-8000-000000000003' })).toBe(false);
  });
  it('denies paths outside the rental upload format', () => {
    expect(isPublishedSpacePhoto(`${owner}/../private.jpeg`, listing)).toBe(false);
  });
});