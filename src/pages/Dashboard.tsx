import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { useSupabaseData, Task, BoardWithData } from '@/hooks/useSupabaseData';
import { TaskCard } from '@/components/kanban/TaskCard';
import { EditableTaskModal } from '@/components/kanban/EditableTaskModal';
import { UserProfile } from '@/components/kanban/UserProfile';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { AddColumnModal } from '@/components/kanban/AddColumnModal';
import { BoardSettingsModal } from '@/components/kanban/BoardSettingsModal';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeColumnId, setActiveColumnId] = useState<string>('');
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const [currentBoard, setCurrentBoard] = useState<BoardWithData | null>(null);
  
  const { boards, boardsLoading, fetchBoardWithData, createBoard, createTask, updateTask, createColumn, deleteColumn } = useSupabaseData();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load the first board on mount and refresh when boards change
  useEffect(() => {
    if (boards && boards.length > 0 && !currentBoard) {
      fetchBoardWithData(boards[0].id).then(setCurrentBoard);
    }
  }, [boards, currentBoard, fetchBoardWithData]);

  // Remove the 2-second interval that was interfering with real-time updates
  // Real-time updates are now handled by Supabase subscriptions in useSupabaseData

  // Create initial board if none exists
  useEffect(() => {
    if (!boardsLoading && boards && boards.length === 0) {
      console.log('No boards found, creating first board...');
      createBoard('Mi Primer Tablero');
    }
  }, [boards, boardsLoading, createBoard]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic for optimistic updates
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    // Handle task reordering and column changes
  };

  const findTaskById = (id: string): Task | undefined => {
    if (!currentBoard) return undefined;
    for (const column of currentBoard.columns) {
      const task = column.tasks.find(task => task.id === id);
      if (task) return task;
    }
  };

  const handleAddTask = (columnId: string) => {
    setActiveColumnId(columnId);
    setSelectedTask(undefined);
    setModalMode('create');
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setIsTaskModalOpen(true);
  };

  const handleUpdateTask = async (taskUpdates: Partial<Task>) => {
    try {
      await updateTask(taskUpdates);
      
      // Update local state immediately for better UX
      if (currentBoard) {
        setCurrentBoard(prev => {
          if (!prev) return prev;
          
          const updatedBoard = { ...prev };
          const column = updatedBoard.columns.find(c => 
            c.tasks.some(t => t.id === taskUpdates.id)
          );
          
          if (column) {
            const taskIndex = column.tasks.findIndex(t => t.id === taskUpdates.id);
            if (taskIndex !== -1) {
              column.tasks[taskIndex] = { ...column.tasks[taskIndex], ...taskUpdates };
            }
          }
          return updatedBoard;
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (modalMode === 'create') {
      const newTask = {
        ...taskData,
        column_id: activeColumnId,
        position: currentBoard?.columns.find(c => c.id === activeColumnId)?.tasks.length || 0
      } as Omit<Task, 'id' | 'created_at' | 'updated_at'>;
      
      await createTask(newTask);
    } else if (selectedTask) {
      await updateTask({ id: selectedTask.id, ...taskData });
      
      // Update local state immediately for better UX
      if (currentBoard) {
        setCurrentBoard(prev => {
          if (!prev) return prev;
          
          const updatedBoard = { ...prev };
          const column = updatedBoard.columns.find(c => c.id === selectedTask.column_id);
          if (column) {
            const taskIndex = column.tasks.findIndex(t => t.id === selectedTask.id);
            if (taskIndex !== -1) {
              column.tasks[taskIndex] = { ...column.tasks[taskIndex], ...taskData };
            }
          }
          return updatedBoard;
        });
      }
    }
    
    // Refresh board data to ensure consistency
    if (currentBoard?.id) {
      const updatedBoard = await fetchBoardWithData(currentBoard.id);
      setCurrentBoard(updatedBoard);
    }
    
    setIsTaskModalOpen(false);
  };

  const handleAddColumn = async (columnData: { title: string; color: string }) => {
    if (currentBoard) {
      await createColumn({ ...columnData, boardId: currentBoard.id });
      
      // Refresh board data immediately
      const updatedBoard = await fetchBoardWithData(currentBoard.id);
      setCurrentBoard(updatedBoard);
    }
    setIsAddColumnOpen(false);
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (currentBoard) {
      await deleteColumn(columnId);
      
      // Refresh board data immediately
      const updatedBoard = await fetchBoardWithData(currentBoard.id);
      setCurrentBoard(updatedBoard);
    }
  };

  const handleUpdateBoard = async (updatedBoard: any) => {
    if (currentBoard) {
      // Update the board in Supabase
      const { error } = await supabase
        .from('boards')
        .update({
          title: updatedBoard.title,
          description: updatedBoard.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentBoard.id);

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el tablero.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setCurrentBoard(prev => prev ? {
        ...prev,
        title: updatedBoard.title,
        description: updatedBoard.description,
        updated_at: updatedBoard.updatedAt
      } : null);

      toast({
        title: "Tablero Actualizado",
        description: "La configuración del tablero ha sido guardada exitosamente.",
      });
    }
  };

  const handleExportBoard = () => {
    if (currentBoard) {
      const boardData = {
        title: currentBoard.title,
        description: currentBoard.description || '',
        columns: currentBoard.columns.map(col => ({
          title: col.title,
          color: col.color,
          tasks: col.tasks.map(task => ({
            title: task.title,
            description: task.description,
            priority: task.priority,
            tags: task.tags,
            assignee: task.assignee
          }))
        })),
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(boardData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentBoard.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Tablero Exportado",
        description: "El tablero ha sido exportado exitosamente.",
      });
    }
  };

  const handleImportBoard = async (importedData: any) => {
    if (currentBoard) {
      try {
        // Update board title and description
        const { error: boardError } = await supabase
          .from('boards')
          .update({
            title: importedData.title || currentBoard.title,
            description: importedData.description || currentBoard.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentBoard.id);

        if (boardError) throw boardError;

        // Clear existing columns and tasks
        const { error: clearTasksError } = await supabase
          .from('tasks')
          .delete()
          .in('column_id', currentBoard.columns.map(c => c.id));

        if (clearTasksError) throw clearTasksError;

        const { error: clearColumnsError } = await supabase
          .from('columns')
          .delete()
          .eq('board_id', currentBoard.id);

        if (clearColumnsError) throw clearColumnsError;

        // Create new columns and tasks
        if (importedData.columns && Array.isArray(importedData.columns)) {
          for (let i = 0; i < importedData.columns.length; i++) {
            const col = importedData.columns[i];
            
            // Create column
            const { data: newColumn, error: colError } = await supabase
              .from('columns')
              .insert([{
                board_id: currentBoard.id,
                title: col.title,
                color: col.color || '#3b82f6',
                position: i
              }])
              .select()
              .single();

            if (colError) throw colError;

            // Create tasks for this column
            if (col.tasks && Array.isArray(col.tasks)) {
              for (let j = 0; j < col.tasks.length; j++) {
                const task = col.tasks[j];
                
                const { error: taskError } = await supabase
                  .from('tasks')
                  .insert([{
                    column_id: newColumn.id,
                    title: task.title,
                    description: task.description || '',
                    priority: task.priority || 'medium',
                    tags: task.tags || [],
                    assignee: task.assignee || null,
                    position: j
                  }]);

                if (taskError) throw taskError;
              }
            }
          }
        }

        // Refresh board data
        const updatedBoard = await fetchBoardWithData(currentBoard.id);
        setCurrentBoard(updatedBoard);

        toast({
          title: "Tablero Importado",
          description: "El tablero ha sido importado exitosamente.",
        });
      } catch (error) {
        console.error('Error importing board:', error);
        toast({
          title: "Error de Importación",
          description: "No se pudo importar el tablero.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClearBoard = async () => {
    if (currentBoard) {
      try {
        // Clear all tasks
        const { error: tasksError } = await supabase
          .from('tasks')
          .delete()
          .in('column_id', currentBoard.columns.map(c => c.id));

        if (tasksError) throw tasksError;

        // Refresh board data
        const updatedBoard = await fetchBoardWithData(currentBoard.id);
        setCurrentBoard(updatedBoard);

        toast({
          title: "Tablero Limpiado",
          description: "Todas las tareas han sido eliminadas del tablero.",
        });
      } catch (error) {
        console.error('Error clearing board:', error);
        toast({
          title: "Error",
          description: "No se pudo limpiar el tablero.",
          variant: "destructive",
        });
      }
    }
  };

  if (boardsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Kanban</h2>
          <p className="text-muted-foreground mb-4">Creating your first board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{currentBoard.title}</h1>
            <p className="text-muted-foreground mt-1">
              Real-time collaborative Kanban board
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserProfile />
            <Button 
              variant="outline" 
              className="glass"
              onClick={() => setIsBoardSettingsOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Board Settings
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsAddColumnOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </Button>
          </div>
        </div>

        {/* Board */}
        <div className="flex gap-6 overflow-x-auto pb-6">
          {currentBoard.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddCard={handleAddTask}
              onEditCard={handleEditTask}
              onUpdateTask={handleUpdateTask}
              onDeleteColumn={handleDeleteColumn}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 opacity-90">
              <TaskCard task={activeTask} onEdit={handleEditTask} onUpdate={handleUpdateTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <EditableTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={selectedTask}
        mode={modalMode}
      />

      <BoardSettingsModal
        isOpen={isBoardSettingsOpen}
        onClose={() => setIsBoardSettingsOpen(false)}
        board={{
          id: currentBoard.id,
          title: currentBoard.title,
          description: '',
          columns: [],
          createdAt: currentBoard.created_at,
          updatedAt: currentBoard.updated_at
        }}
        onUpdateBoard={handleUpdateBoard}
        onExportBoard={handleExportBoard}
        onImportBoard={handleImportBoard}
        onClearBoard={handleClearBoard}
      />

      <AddColumnModal
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        onAddColumn={handleAddColumn}
      />
    </div>
  );
}