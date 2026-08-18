create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  token text not null unique,
  role public.team_role not null default 'member',
  expires_at timestamptz not null,
  max_uses int not null default 1,
  used_count int not null default 0,
  revoked_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_invites_token_format check (token ~ '^[A-Za-z0-9_-]{24,}$'),
  constraint team_invites_role_allowed check (role in ('member', 'viewer')),
  constraint team_invites_max_uses_positive check (max_uses > 0),
  constraint team_invites_used_count_non_negative check (used_count >= 0)
);

create index if not exists team_invites_team_id_created_at_idx
on public.team_invites (team_id, created_at desc);

create index if not exists team_invites_token_idx
on public.team_invites (token);

drop trigger if exists team_invites_set_updated_at on public.team_invites;
create trigger team_invites_set_updated_at
before update on public.team_invites
for each row execute function public.set_updated_at();

alter table public.team_invites enable row level security;

drop policy if exists "team admins can read invites" on public.team_invites;
create policy "team admins can read invites"
on public.team_invites for select
to authenticated
using (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));

drop policy if exists "team admins can create invites" on public.team_invites;
create policy "team admins can create invites"
on public.team_invites for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[])
);

drop policy if exists "team admins can update invites" on public.team_invites;
create policy "team admins can update invites"
on public.team_invites for update
to authenticated
using (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]))
with check (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));

create or replace function public.accept_team_invite(invite_token text)
returns table (joined_team_id uuid, joined_team_slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  invite_row public.team_invites%rowtype;
  target_team_slug text;
  already_member boolean;
begin
  if current_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  select *
  into invite_row
  from public.team_invites ti
  where ti.token = invite_token
  for update;

  if invite_row.id is null then
    raise exception 'Invite not found.' using errcode = 'P0002';
  end if;

  if invite_row.revoked_at is not null then
    raise exception 'Invite has been revoked.' using errcode = 'P0001';
  end if;

  if invite_row.expires_at <= now() then
    raise exception 'Invite has expired.' using errcode = '22023';
  end if;

  if invite_row.used_count >= invite_row.max_uses then
    select exists (
      select 1
      from public.team_members tm
      where tm.team_id = invite_row.team_id
        and tm.user_id = current_user_id
    )
    into already_member;

    if not already_member then
      raise exception 'Invite has reached its usage limit.' using errcode = '22023';
    end if;
  end if;

  select t.slug
  into target_team_slug
  from public.teams t
  where t.id = invite_row.team_id;

  insert into public.profiles (id, display_name)
  values (current_user_id, 'New player')
  on conflict (id) do nothing;

  insert into public.team_members (team_id, user_id, role)
  values (invite_row.team_id, current_user_id, invite_row.role)
  on conflict (team_id, user_id) do nothing;

  if found then
    update public.team_invites
    set used_count = used_count + 1
    where team_invites.id = invite_row.id;
  end if;

  return query
  select invite_row.team_id as joined_team_id, target_team_slug as joined_team_slug;
end;
$$;

grant execute on function public.accept_team_invite(text) to authenticated;

notify pgrst, 'reload schema';
