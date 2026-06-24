create table if not exists notes (
  id         int8        primary key generated always as identity,
  group_id   uuid        not null references public.groups(id) on delete cascade,
  author_id  uuid        not null references public.users(id) on delete cascade,
  body       text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert on notes to authenticated;

alter table notes enable row level security;

create policy "members can only see their group notes"
  on notes
  for select
  to authenticated
  using (
    group_id in (
      select group_id from memberships where user_id = auth.uid()
    )
  );

create policy "user can only create note for their group"
  on notes
  for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and group_id in (
      select group_id from memberships where user_id = auth.uid()
    )
  );