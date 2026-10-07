create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'My board',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  board_id uuid references public.boards(id) on delete cascade not null,
  title text not null check (char_length(title) between 1 and 500),
  status text not null default 'open' check (status in ('open', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  created_at timestamptz not null default now()
);

alter table public.tasks
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

alter table public.tasks
  add column if not exists board_id uuid references public.boards(id) on delete cascade;

alter table public.tasks
  add column if not exists status text default 'open';

alter table public.tasks
  alter column status set default 'open';

alter table public.tasks
  add constraint tasks_status_check
  check (status in ('open', 'done'))
  not valid;

alter table public.tasks validate constraint tasks_status_check;

alter table public.tasks enable row level security;

create policy "Users can read their own boards" on public.boards
  for select to authenticated using (auth.uid() = user_id);

create policy "Users can add their own boards" on public.boards
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update their own boards" on public.boards
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own boards" on public.boards
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Public can read tasks" on public.tasks;
drop policy if exists "Public can add tasks" on public.tasks;
drop policy if exists "Public can update tasks" on public.tasks;
drop policy if exists "Public can delete tasks" on public.tasks;
drop policy if exists "Users can read their own tasks" on public.tasks;
drop policy if exists "Users can add their own tasks" on public.tasks;
drop policy if exists "Users can update their own tasks" on public.tasks;
drop policy if exists "Users can delete their own tasks" on public.tasks;

create policy "Users can read their own tasks" on public.tasks
  for select to authenticated using (auth.uid() = user_id);

create policy "Users can add their own tasks" on public.tasks
  for insert to authenticated with check (auth.uid() = user_id and auth.uid() = (select user_id from public.boards where id = board_id));

create policy "Users can update their own tasks" on public.tasks
  for update to authenticated using (auth.uid() = user_id and auth.uid() = (select user_id from public.boards where id = board_id)) with check (auth.uid() = user_id and auth.uid() = (select user_id from public.boards where id = board_id));

create policy "Users can delete their own tasks" on public.tasks
  for delete to authenticated using (auth.uid() = user_id and auth.uid() = (select user_id from public.boards where id = board_id));
