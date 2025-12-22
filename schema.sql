-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  sku text not null unique,
  category text not null,
  price numeric(10, 2) not null check (price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  min_stock integer not null default 5,
  supplier text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workers Table
create table workers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  role text not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transactions (Stock Movement) Table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('IN', 'OUT')),
  product_id uuid references products(id) on delete cascade not null,
  quantity integer not null check (quantity > 0),
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text
);

-- Tasks Table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  worker_id uuid references workers(id) on delete set null,
  description text not null,
  status text not null check (status in ('PENDING', 'COMPLETED')) default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Indexes for performance
create index idx_products_sku on products(sku);
create index idx_transactions_product_id on transactions(product_id);
create index idx_transactions_date on transactions(date);
create index idx_tasks_worker_id on tasks(worker_id);
