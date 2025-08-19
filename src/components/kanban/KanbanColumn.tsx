import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import { Column, Task } from '@/hooks/useSupabaseData';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import { useOptimizedAnimation } from '@/hooks/usePerformance';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface KanbanColumnProps {
  column: Column & { tasks: Task[] };
  onAddCard: (columnId: string) => void;
  onEditCard?: (task: Task) => void;
  onUpdateTask?: (task: Partial<Task>) => void;
  onDeleteColumn?: (columnId: string) => void;
}

export function KanbanColumn({ column, onAddCard, onEditCard, onUpdateTask, onDeleteColumn }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const { getAnimationClass, getTransitionClass } = useOptimizedAnimation();

  const handleDeleteColumn = () => {
    if (onDeleteColumn && window.confirm(`¿Estás seguro de que quieres eliminar la columna "${column.title}"? Esta acción eliminará todas las tareas y no se puede deshacer.`)) {
      onDeleteColumn(column.id);
    }
  };

  return (
    <Card className={cn(
      "glass p-4 min-h-[600px] w-80 flex flex-col",
      getAnimationClass("animate-fade-in", ""),
      getTransitionClass("transition-normal", ""),
      isOver && "ring-2 ring-primary/50"
    )}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h2 className="font-semibold text-lg text-foreground">{column.title}</h2>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {column.tasks.length}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddCard(column.id)}
            className="hover:bg-primary/10 text-primary"
          >
            <Plus className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-muted/50 text-muted-foreground"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDeleteColumn} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Columna
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards Container */}
      <div ref={setNodeRef} className="flex-1 space-y-3 min-h-[400px]">
        <SortableContext 
          items={column.tasks.map(task => task.id)} 
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={onEditCard!}
              onUpdate={onUpdateTask}
            />
          ))}
        </SortableContext>
        
        {column.tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-lg py-12">
            <div className="text-center">
              <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Drop cards here or click + to add</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}