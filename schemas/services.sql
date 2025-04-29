id uuid primary key default uuid_generate_v4()
shop_id uuid references shops(id) -- hangi berbere ait
name varchar not null
description text
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()