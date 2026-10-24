revoke execute on function public.my_role(uuid), public.is_parent(uuid), public.validate_block_assignee() from public, anon;
revoke execute on function public.validate_block_assignee() from authenticated;
