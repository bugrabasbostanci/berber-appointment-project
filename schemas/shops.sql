id uuid primary key default uuid_generate_v4()
user_id uuid references users(id)
name varchar not null
description text
owner_id uuid references users(id)
employees uuid[] -- user_id array
contact_information jsonb
address text
location geography(point) -- konum bilgisi için
working_hours jsonb -- çalışma saatleri için
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()
