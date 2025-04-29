id uuid primary key default uuid_generate_v4()
shop_id uuid references shops(id) not null
user_id uuid references users(id) not null
employee_id uuid references users(id) not null
date date not null
time time not null
end_time time not null -- bitiş zamanı
notes text
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()