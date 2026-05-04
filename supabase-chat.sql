-- Run this in your Supabase SQL Editor

create table if not exists chat_messages (
  id           text primary key,
  sender_id    text not null,
  sender_role  text not null check (sender_role in ('admin', 'customer')),
  receiver_id  text not null,
  message      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now(),
  replied_at   timestamptz
);

create index if not exists idx_chat_messages_sender   on chat_messages (sender_id);
create index if not exists idx_chat_messages_receiver on chat_messages (receiver_id);
create index if not exists idx_chat_messages_created  on chat_messages (created_at);

-- Disable RLS so service role can read/write freely
alter table chat_messages disable row level security;
