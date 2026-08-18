-- KeoBong Pro MVP schema for Supabase.
-- Apply this on a fresh Supabase project before wiring the app to real data.

create extension if not exists pgcrypto;

create type public.team_plan as enum ('free', 'pro', 'club');
create type public.team_role as enum ('owner', 'manager', 'captain', 'member', 'viewer');
create type public.player_position as enum ('GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST');
create type public.player_status as enum ('active', 'injured', 'inactive', 'left');
create type public.match_format as enum ('5v5', '7v7', '9v9', '11v11', 'other');
create type public.match_status as enum ('draft', 'scheduled', 'locked', 'completed', 'cancelled');
create type public.attendance_status as enum ('pending', 'going', 'absent', 'late', 'goalkeeper');
create type public.fund_transaction_type as enum ('income', 'expense');
create type public.automation_workflow_status as enum ('ready', 'scheduled', 'paused', 'warning');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  phone text,
  zalo_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan public.team_plan not null default 'free',
  timezone text not null default 'Asia/Ho_Chi_Minh',
  area text,
  default_format public.match_format not null default '7v7',
  home_venue_name text,
  fixed_schedule jsonb not null default '{}'::jsonb,
  zalo_group_id text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.team_role not null default 'member',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  display_name text not null,
  phone text,
  zalo_name text,
  shirt_number int,
  position public.player_position,
  level numeric(3, 1) not null default 5.0,
  status public.player_status not null default 'active',
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint players_level_range check (level >= 1 and level <= 10),
  constraint players_shirt_number_range check (shirt_number is null or (shirt_number >= 0 and shirt_number <= 999)),
  unique (id, team_id),
  unique (team_id, shirt_number)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  opponent_name text,
  venue_name text,
  starts_at timestamptz not null,
  format public.match_format not null default '7v7',
  min_players int not null default 10,
  status public.match_status not null default 'scheduled',
  notes text,
  team_score int,
  opponent_score int,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_min_players_positive check (min_players > 0),
  constraint matches_score_non_negative check (
    (team_score is null or team_score >= 0)
    and (opponent_score is null or opponent_score >= 0)
  ),
  unique (id, team_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  match_id uuid not null,
  player_id uuid not null,
  user_id uuid references public.profiles (id) on delete set null,
  status public.attendance_status not null default 'pending',
  note text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (match_id, team_id) references public.matches (id, team_id) on delete cascade,
  foreign key (player_id, team_id) references public.players (id, team_id) on delete cascade,
  unique (match_id, player_id)
);

create table public.fund_transactions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  match_id uuid references public.matches (id) on delete set null,
  player_id uuid references public.players (id) on delete set null,
  type public.fund_transaction_type not null,
  category text not null,
  title text not null,
  amount_vnd bigint not null,
  transaction_date date not null default current_date,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fund_transactions_amount_positive check (amount_vnd > 0)
);

create table public.player_stats (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  match_id uuid not null,
  player_id uuid not null,
  goals int not null default 0,
  assists int not null default 0,
  mvp boolean not null default false,
  rating numeric(3, 1),
  minutes_played int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (match_id, team_id) references public.matches (id, team_id) on delete cascade,
  foreign key (player_id, team_id) references public.players (id, team_id) on delete cascade,
  unique (match_id, player_id),
  constraint player_stats_non_negative check (
    goals >= 0
    and assists >= 0
    and (minutes_played is null or minutes_played >= 0)
  ),
  constraint player_stats_rating_range check (rating is null or (rating >= 1 and rating <= 10))
);

create table public.automation_settings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null unique references public.teams (id) on delete cascade,
  automation_enabled boolean not null default false,
  webhook_url text,
  webhook_secret text,
  workflows jsonb not null default '[]'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_display_name_idx on public.profiles using gin (to_tsvector('simple', display_name));
create index teams_created_by_idx on public.teams (created_by);
create index team_members_user_id_idx on public.team_members (user_id);
create index team_members_team_id_role_idx on public.team_members (team_id, role);
create index players_team_id_status_idx on public.players (team_id, status);
create index players_team_id_user_id_idx on public.players (team_id, user_id);
create index matches_team_id_starts_at_idx on public.matches (team_id, starts_at desc);
create index matches_team_id_status_idx on public.matches (team_id, status);
create index attendance_team_id_match_id_idx on public.attendance (team_id, match_id);
create index attendance_player_id_idx on public.attendance (player_id);
create index fund_transactions_team_id_date_idx on public.fund_transactions (team_id, transaction_date desc);
create index fund_transactions_match_id_idx on public.fund_transactions (match_id);
create index player_stats_team_id_player_id_idx on public.player_stats (team_id, player_id);
create index player_stats_match_id_idx on public.player_stats (match_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger teams_set_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create trigger team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

create trigger players_set_updated_at
before update on public.players
for each row execute function public.set_updated_at();

create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

create trigger attendance_set_updated_at
before update on public.attendance
for each row execute function public.set_updated_at();

create trigger fund_transactions_set_updated_at
before update on public.fund_transactions
for each row execute function public.set_updated_at();

create trigger player_stats_set_updated_at
before update on public.player_stats
for each row execute function public.set_updated_at();

create trigger automation_settings_set_updated_at
before update on public.automation_settings
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, phone, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1), 'New player'),
    nullif(new.phone, ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger auth_users_create_profile
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.is_team_member(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = target_team_id
      and tm.user_id = auth.uid()
  );
$$;

create or replace function public.has_team_role(target_team_id uuid, allowed_roles public.team_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = target_team_id
      and tm.user_id = auth.uid()
      and tm.role = any(allowed_roles)
  );
$$;

create or replace function public.is_player_owner(target_player_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.players p
    where p.id = target_player_id
      and p.user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.attendance enable row level security;
alter table public.fund_transactions enable row level security;
alter table public.player_stats enable row level security;
alter table public.automation_settings enable row level security;

create policy "profiles can read themselves"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles can read teammates"
on public.profiles for select
to authenticated
using (
  exists (
    select 1
    from public.team_members mine
    join public.team_members teammate on teammate.team_id = mine.team_id
    where mine.user_id = auth.uid()
      and teammate.user_id = profiles.id
  )
);

create policy "profiles can update themselves"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "teams can be created by authenticated users"
on public.teams for insert
to authenticated
with check (created_by = auth.uid());

create policy "team members can read teams"
on public.teams for select
to authenticated
using (public.is_team_member(id));

create policy "team admins can update teams"
on public.teams for update
to authenticated
using (public.has_team_role(id, array['owner', 'manager', 'captain']::public.team_role[]))
with check (public.has_team_role(id, array['owner', 'manager', 'captain']::public.team_role[]));

create policy "team owners can delete teams"
on public.teams for delete
to authenticated
using (public.has_team_role(id, array['owner']::public.team_role[]));

create policy "team members can read memberships"
on public.team_members for select
to authenticated
using (public.is_team_member(team_id));

create policy "users can add themselves as initial owner"
on public.team_members for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'owner'
  and exists (
    select 1
    from public.teams t
    where t.id = team_members.team_id
      and t.created_by = auth.uid()
  )
);

create policy "team admins can add members"
on public.team_members for insert
to authenticated
with check (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));

create policy "team admins can update memberships"
on public.team_members for update
to authenticated
using (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]))
with check (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));

create policy "team admins can remove memberships"
on public.team_members for delete
to authenticated
using (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));

create policy "team members can read players"
on public.players for select
to authenticated
using (public.is_team_member(team_id));

create policy "team admins can manage players"
on public.players for all
to authenticated
using (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]))
with check (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));

create policy "players can update their own profile row"
on public.players for update
to authenticated
using (user_id = auth.uid() and public.is_team_member(team_id))
with check (user_id = auth.uid() and public.is_team_member(team_id));

create policy "team members can read matches"
on public.matches for select
to authenticated
using (public.is_team_member(team_id));

create policy "team admins can manage matches"
on public.matches for all
to authenticated
using (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]))
with check (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));

create policy "team members can read attendance"
on public.attendance for select
to authenticated
using (public.is_team_member(team_id));

create policy "team admins can manage attendance"
on public.attendance for all
to authenticated
using (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]))
with check (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));

create policy "players can update their own attendance"
on public.attendance for update
to authenticated
using (public.is_player_owner(player_id) and public.is_team_member(team_id))
with check (public.is_player_owner(player_id) and public.is_team_member(team_id));

create policy "players can insert their own attendance"
on public.attendance for insert
to authenticated
with check (public.is_player_owner(player_id) and public.is_team_member(team_id));

create policy "team members can read fund transactions"
on public.fund_transactions for select
to authenticated
using (public.is_team_member(team_id));

create policy "team admins can manage fund transactions"
on public.fund_transactions for all
to authenticated
using (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]))
with check (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));

create policy "team members can read player stats"
on public.player_stats for select
to authenticated
using (public.is_team_member(team_id));

create policy "team admins can manage player stats"
on public.player_stats for all
to authenticated
using (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]))
with check (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));

create policy "team admins can read automation settings"
on public.automation_settings for select
to authenticated
using (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));

create policy "team admins can manage automation settings"
on public.automation_settings for all
to authenticated
using (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]))
with check (public.has_team_role(team_id, array['owner', 'manager', 'captain']::public.team_role[]));
