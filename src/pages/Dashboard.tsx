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

export default function Dashboard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeColumnId, setActiveColumnId] = useState<string>('');
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const [currentBoard, setCurrentBoard] = useState<BoardWithData | null>(null);
  
  const { boards, boardsLoading, fetchBoardWithData, createBoard, createTask, updateTask, createColumn } = useSupabaseData();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load the first board on mount
  useEffect(() => {
    if (boards && boards.length > 0 && !currentBoard) {
      fetchBoardWithData(boards[0].id).then(setCurrentBoard);
    }
  }, [boards, currentBoard, fetchBoardWithData]);

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

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (modalMode === 'create') {
      const newTask = {
        ...taskData,
        column_id: activeColumnId,
        position: currentBoard?.columns.find(c => c.id === activeColumnId)?.tasks.length || 0
      } as Omit<Task, 'id' | 'created_at' | 'updated_at'>;
      
      createTask(newTask);
    } else if (selectedTask) {
      updateTask({ id: selectedTask.id, ...taskData });
    }
    setIsTaskModalOpen(false);
  };

  const handleAddColumn = (columnData: { title: string; color: string }) => {
    if (currentBoard) {
      createColumn({ ...columnData, boardId: currentBoard.id });
    }
    setIsAddColumnOpen(false);
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
              onUpdateTask={updateTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 opacity-90">
              <TaskCard task={activeTask} onEdit={handleEditTask} onUpdate={updateTask} />
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
        onUpdateBoard={() => {}}
        onExportBoard={() => {}}
        onImportBoard={() => {}}
        onClearBoard={() => {}}
      />

      <AddColumnModal
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        onAddColumn={handleAddColumn}
      />
    </div>
  );
}