import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Download, Edit, User } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onUpdate?: (task: Partial<Task>) => void;
}


const priorityIcons = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  critical: '🔴',
};

export function TaskCard({ task, onEdit, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const { toast } = useToast();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTitleSave = async () => {
    if (title.trim() !== task.title && onUpdate) {
      onUpdate({ id: task.id, title: title.trim() });
      setIsEditing(false);
      toast({
        title: "Tarea Actualizada",
        description: "El título de la tarea ha sido actualizado.",
      });
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(task.title);
      setIsEditing(false);
    }
  };

  const exportTask = () => {
    const exportData = {
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        tags: task.tags,
        assignee: task.assignee,
        created_at: task.created_at,
        updated_at: task.updated_at
      },
      export_info: {
        exported_at: new Date().toISOString(),
        exported_by: "current_user@example.com" // TODO: Get from auth context
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `task-${task.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Task Exported",
      description: "Task has been downloaded as JSON file.",
    });
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-accent border-2 border-dashed border-primary rounded-lg h-32"
      />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 bg-card/80 backdrop-blur-sm border border-border/50 ${
        isDragging ? 'rotate-2 opacity-90' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleKeyPress}
                className="w-full bg-transparent border-none outline-none font-medium text-sm focus:ring-1 focus:ring-primary rounded px-1"
                autoFocus
              />
            ) : (
              <h3 
                className="font-medium text-sm leading-tight cursor-pointer hover:text-primary transition-colors"
                onDoubleClick={() => setIsEditing(true)}
              >
                {task.title}
              </h3>
            )}
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                exportTask();
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`text-xs priority-${task.priority} border`}
          >
            {priorityIcons[task.priority]} {task.priority}
          </Badge>
        </div>

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {task.assignee.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{task.assignee}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(task.created_at), 'MMM dd')}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit Details
        </Button>
      </CardContent>
    </Card>
  );
}