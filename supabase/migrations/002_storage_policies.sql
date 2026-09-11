-- Private Supabase Storage policies for course documents.
-- First create a PRIVATE bucket named "course-documents" in Supabase Storage.

create policy "course_documents_read_published_or_teacher"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'course-documents'
  and (
    public.is_teacher()
    or exists (
      select 1
      from public.documents d
      where d.storage_path = storage.objects.name
        and d.published = true
    )
  )
);

create policy "course_documents_teacher_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'course-documents'
  and public.is_teacher()
);

create policy "course_documents_teacher_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'course-documents'
  and public.is_teacher()
)
with check (
  bucket_id = 'course-documents'
  and public.is_teacher()
);

create policy "course_documents_teacher_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'course-documents'
  and public.is_teacher()
);
