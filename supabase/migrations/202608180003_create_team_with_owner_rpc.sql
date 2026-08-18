create or replace function public.create_team_with_owner(
  team_name text,
  team_slug text,
  team_area text default null,
  team_default_format public.match_format default '7v7',
  team_home_venue_name text default null,
  team_fixed_schedule jsonb default '{}'::jsonb
)
returns table (id uuid, slug text)
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
  select new_team_id, team_slug;
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
