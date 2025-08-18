import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Flag } from 'lucide-react';
import { KanbanCard as KanbanCardType } from '@/types/kanban';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  card: KanbanCardType;
  onEdit?: (card: KanbanCardType) => void;
}

const priorityColors = {
  low: 'priority-low',
  medium: 'priority-medium', 
  high: 'priority-high',
  critical: 'priority-critical'
};

export function KanbanCard({ card, onEdit }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "card-glass p-4 cursor-grab active:cursor-grabbing transition-smooth hover:scale-[1.02]",
        "hover:shadow-lg hover:shadow-primary/20",
        isDragging && "opacity-50 rotate-2 scale-105"
      )}
      onClick={() => onEdit?.(card)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-card-foreground leading-tight">{card.title}</h3>
          <div className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-full border", priorityColors[card.priority])}>
            <Flag className="w-3 h-3" />
            <span className="capitalize">{card.priority}</span>
          </div>
        </div>

        {/* Description */}
        {card.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Labels */}
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.labels.map((label, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                {label}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {card.assignee && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{card.assignee}</span>
              </div>
            )}
            {card.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(card.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}