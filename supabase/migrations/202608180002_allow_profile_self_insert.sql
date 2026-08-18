create policy "profiles can insert themselves"
on public.profiles for insert
to authenticated
with check (id = auth.uid());
