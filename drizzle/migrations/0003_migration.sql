drop policy if exists space_storage_read on storage.objects;
create policy space_storage_read on storage.objects for select to anon, authenticated using (
  bucket_id='space-photos' and (
    (auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text)
    or exists (select 1 from public.spaces s where s.published and objects.name = any(s.photos) and (storage.foldername(objects.name))[1] = s.owner_id::text)
  ));
drop policy if exists profile_storage_read on storage.objects;
create policy profile_storage_read on storage.objects for select to authenticated using (
  bucket_id='profile-photos' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_moderator()
    or exists (select 1 from public.profile_photos pp where pp.path = objects.name and pp.status='approved' and public.can_view_photo(pp.user_id))
  ));