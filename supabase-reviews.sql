-- Run this in your Supabase SQL Editor

create table if not exists reviews (
  id           text primary key,
  order_id     text not null references orders(id) on delete cascade,
  user_id      text not null references users(id) on delete cascade,
  product_name text not null default '',
  rating       int  not null check (rating >= 1 and rating <= 5),
  comment      text not null,
  created_at   timestamptz not null default now()
);

create unique index if not exists idx_reviews_order on reviews (order_id);
create index if not exists idx_reviews_user    on reviews (user_id);
create index if not exists idx_reviews_rating  on reviews (rating);

alter table reviews disable row level security;
