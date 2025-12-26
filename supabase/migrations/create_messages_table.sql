-- 1. Create Messages Table
CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id uuid REFERENCES public.connections(id) NOT NULL,
    sender_id uuid REFERENCES public.profiles(id) NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can only see messages in their own connections
CREATE POLICY "Users can view messages in their connections"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.connections c
        WHERE c.id = messages.connection_id
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
    )
);

-- 4. Policy: Users can send messages to their connections
CREATE POLICY "Users can insert messages"
ON public.messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.connections c
        WHERE c.id = connection_id
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
        AND c.status = 'accepted'
    )
);

-- 5. Enable Realtime for this table
-- Run this in Supabase SQL Editor OR enable via Dashboard:
-- Database -> Replication -> Source -> Toggle 'supabase_realtime' ON for 'messages' table
alter publication supabase_realtime add table messages;
