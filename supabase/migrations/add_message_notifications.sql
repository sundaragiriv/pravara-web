-- ============================================================
-- NOTIFICATIONS — alert on a new message
--
-- Testing what actually fires showed that interest and acceptance
-- notifications already work, through the existing notify_on_connection
-- trigger. Messages were the gap: a member could be sent a message and
-- never be told.
--
-- Written as a trigger to match how the other two work, and because the
-- alternative — inserting from the client — cannot work anyway: a member
-- has no business writing a notification row addressed to somebody else,
-- and RLS should keep it that way.
--
-- Deliberately at most ONE unread message notification per conversation.
-- A notification per message turns a lively exchange into forty alerts,
-- and the bell stops meaning anything. Once the recipient has read it,
-- the next message earns a fresh one.
--
-- Run in Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- (dev first, then production)
-- ============================================================

CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient UUID;
BEGIN
  -- The other party to the conversation.
  SELECT CASE WHEN c.sender_id = NEW.sender_id THEN c.receiver_id ELSE c.sender_id END
    INTO recipient
  FROM public.connections c
  WHERE c.id = NEW.connection_id;

  IF recipient IS NULL OR recipient = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  -- A block should stop the alert as well as the message. The message
  -- policy already refuses the insert, so this is belt and braces for any
  -- path that writes with elevated privileges.
  IF public.is_blocked_between(NEW.sender_id, recipient) THEN
    RETURN NEW;
  END IF;

  -- Only if they have already seen the last one.
  IF EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.user_id = recipient
      AND n.actor_id = NEW.sender_id
      AND n.type = 'message_received'
      AND n.is_read = FALSE
  ) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, actor_id, type, content, is_read)
  VALUES (recipient, NEW.sender_id, 'message_received', 'Sent you a message.', FALSE);

  RETURN NEW;
END $$;

REVOKE EXECUTE ON FUNCTION public.notify_on_message() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_notify_on_message ON public.messages;

CREATE TRIGGER trg_notify_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_message();
