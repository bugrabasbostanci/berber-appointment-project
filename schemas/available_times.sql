id uuid primary key default uuid_generate_v4()
shop_id uuid references shops(id) not null
employee_id uuid references users(id) not null
date date not null
is_available boolean default true -- müsait olup olmadığı
time_slots jsonb not null -- müsait zaman aralıkları
reason text -- müsait olmama nedeni
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()