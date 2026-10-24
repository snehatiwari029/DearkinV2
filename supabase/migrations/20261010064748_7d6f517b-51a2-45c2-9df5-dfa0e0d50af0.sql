alter table public.care_blocks drop constraint if exists care_blocks_check;
alter table public.care_blocks add constraint care_blocks_time_check check (end_time <> start_time);
