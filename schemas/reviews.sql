id uuid primary key default uuid_generate_v4()
appointment_id uuid references appointments(id) not null
user_id uuid references users(id) not null
shop_id uuid references shops(id) not null
rating integer not null check (rating between 1 and 5)
comment text
created_at timestamp with time zone default now()