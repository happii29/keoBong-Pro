drop function if exists public.create_team_with_owner(
  text,
  text,
  text,
  public.match_format,
  text,
  jsonb
);

create or replace function public.create_team_with_owner(
  team_name text,
  team_slug text,
  team_area text default null,
  team_default_format public.match_format default '7v7',
  team_home_venue_name text default null,
  team_fixed_schedule jsonb default '{}'::jsonb
)
returns table (created_team_id uuid, created_team_slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  new_team_id uuid := gen_random_uuid();
begin
  if current_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  insert into public.profiles (id, display_name)
  values (current_user_id, 'New player')
  on conflict (id) do nothing;

  insert into public.teams (
    id,
    name,
    slug,
    area,
    default_format,
    home_venue_name,
    fixed_schedule,
    created_by
  )
  values (
    new_team_id,
    team_name,
    team_slug,
    nullif(team_area, ''),
    team_default_format,
    nullif(team_home_venue_name, ''),
    coalesce(team_fixed_schedule, '{}'::jsonb),
    current_user_id
  );

  insert into public.team_members (team_id, user_id, role)
  values (new_team_id, current_user_id, 'owner');

  insert into public.automation_settings (team_id)
  values (new_team_id);

  return query
  select new_team_id as created_team_id, team_slug as created_team_slug;
end;
$$;

grant execute on function public.create_team_with_owner(
  text,
  text,
  text,
  public.match_format,
  text,
  jsonb
) to authenticated;

create or replace function public.join_team_by_slug(team_slug text)
returns table (joined_team_id uuid, joined_team_slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_team_id uuid;
  target_team_slug text;
begin
  if current_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  select t.id, t.slug
  into target_team_id, target_team_slug
  from public.teams t
  where t.slug = team_slug;

  if target_team_id is null then
    raise exception 'Team not found.' using errcode = 'P0002';
  end if;

  insert into public.profiles (id, display_name)
  values (current_user_id, 'New player')
  on conflict (id) do nothing;

  insert into public.team_members (team_id, user_id, role)
  values (target_team_id, current_user_id, 'member')
  on conflict (team_id, user_id) do update
  set updated_at = now()
  returning team_members.team_id into target_team_id;

  return query
  select target_team_id as joined_team_id, target_team_slug as joined_team_slug;
end;
$$;

grant execute on function public.join_team_by_slug(text) to authenticated;

notify pgrst, 'reload schema';
