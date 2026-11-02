import { z } from 'zod';

export const spacePhotoPath = z.string().max(160).regex(
  /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpeg|jpg|png|webp)$/i,
);

type PhotoListing = { owner_id: string; published: boolean; photos: string[] };

export function isPublishedSpacePhoto(path: string, listing: PhotoListing | null) {
  return spacePhotoPath.safeParse(path).success && listing !== null &&
    listing.published && listing.photos.includes(path) &&
    path.split('/')[0] === listing.owner_id;
}