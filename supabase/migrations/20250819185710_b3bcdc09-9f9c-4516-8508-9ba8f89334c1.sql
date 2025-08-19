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

-- Create triggers for automatic updated_at timestamps
CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();