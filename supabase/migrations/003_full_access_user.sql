-- Grant full access (business tier) to owner user
update public.profiles
set tier = 'business', updated_at = now()
where id = '0293de54-f62f-440b-a834-dec05f57cefc';
