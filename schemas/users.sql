id uuid primary key default uuid_generate_v4()
email varchar unique not null
password varchar not null
phone varchar
role varchar not null check (role in ( 'customer', 'barber', 'employee', 'admin'))
first_name varchar
last_name varchar
created_at timestamp with time zone default now()
updated_at timestamp with time zone default now()
