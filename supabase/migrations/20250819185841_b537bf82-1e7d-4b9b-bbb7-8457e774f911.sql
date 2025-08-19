-- Enable real-time updates for all tables
ALTER TABLE public.boards REPLICA IDENTITY FULL;
ALTER TABLE public.columns REPLICA IDENTITY FULL; 
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.users REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.boards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.columns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;