import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Board {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  assignee?: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface BoardWithData extends Board {
  columns: (Column & { tasks: Task[] })[];
}

export function useSupabaseData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user boards
  const { data: boards, isLoading: boardsLoading } = useQuery({
    queryKey: ['boards', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Board[];
    },
    enabled: !!user?.id,
  });

  // Fetch board with full data
  const fetchBoardWithData = async (boardId: string): Promise<BoardWithData | null> => {
    if (!user?.id) return null;

    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .eq('user_id', user.id)
      .single();

    if (boardError) throw boardError;

    const { data: columns, error: columnsError } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position');

    if (columnsError) throw columnsError;

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('column_id', columns.map(c => c.id))
      .order('position');

    if (tasksError) throw tasksError;

    const columnsWithTasks = columns.map(column => ({
      ...column,
      tasks: tasks.filter(task => task.column_id === column.id).map(task => ({
        ...task,
        priority: (task.priority || 'medium') as 'low' | 'medium' | 'high' | 'critical',
        tags: task.tags || [],
        description: task.description || undefined,
        assignee: task.assignee || undefined
      }))
    }));

    return {
      ...board,
      columns: columnsWithTasks
    };
  };

  // Create board mutation
  const createBoardMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Ensure user exists in users table first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!userData) {
        console.log('Creating user in users table...');
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
            avatar_url: user.user_metadata?.avatar_url
          });

        if (createUserError) {
          console.error('Error creating user:', createUserError);
          throw new Error('Error al crear el perfil de usuario');
        }
      }

      const { data: board, error: boardError } = await supabase
        .from('boards')
        .insert([{ user_id: user.id, title }])
        .select()
        .single();

      if (boardError) throw boardError;

      // Create default columns
      const defaultColumns = [
        { board_id: board.id, title: 'Por Hacer', position: 0, color: '#3b82f6' },
        { board_id: board.id, title: 'En Progreso', position: 1, color: '#f59e0b' },
        { board_id: board.id, title: 'Completado', position: 2, color: '#10b981' }
      ];

      const { error: columnsError } = await supabase
        .from('columns')
        .insert(defaultColumns);

      if (columnsError) throw columnsError;

      return board;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast({
        title: "Tablero Creado",
        description: "Tu nuevo tablero ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error creating board:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      // Refresh current board data immediately
      queryClient.invalidateQueries({ queryKey: ['board'] });
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      // Refresh current board data immediately
      queryClient.invalidateQueries({ queryKey: ['board'] });
      toast({
        title: "Tarea Actualizada",
        description: "La tarea ha sido actualizada exitosamente.",
      });
    }
  });

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const boardsChannel = supabase
      .channel('boards-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'boards',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['boards'] });
        }
      )
      .subscribe();

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['board'] });
        }
      )
      .subscribe();

    const columnsChannel = supabase
      .channel('columns-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['board'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(boardsChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(columnsChannel);
    };
  }, [user?.id, queryClient]);

  // Create column mutation
  const createColumnMutation = useMutation({
    mutationFn: async ({ title, color, boardId }: { title: string; color: string; boardId: string }) => {
      // Get current columns to calculate position
      const { data: columns, error: columnsError } = await supabase
        .from('columns')
        .select('position')
        .eq('board_id', boardId)
        .order('position', { ascending: false })
        .limit(1);

      if (columnsError) throw columnsError;

      const maxPosition = columns.length > 0 ? columns[0].position : -1;

      const { data, error } = await supabase
        .from('columns')
        .insert([{
          board_id: boardId,
          title,
          color,
          position: maxPosition + 1
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      // Refresh current board data immediately
      queryClient.invalidateQueries({ queryKey: ['board'] });
      toast({
        title: "Columna Creada",
        description: "Nueva columna agregada al tablero.",
      });
    },
    onError: (error) => {
      console.error('Error creating column:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la columna.",
        variant: "destructive",
      });
    }
  });

  return {
    boards,
    boardsLoading,
    fetchBoardWithData,
    createBoard: createBoardMutation.mutate,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    createColumn: createColumnMutation.mutate,
    isCreatingBoard: createBoardMutation.isPending,
  };
}