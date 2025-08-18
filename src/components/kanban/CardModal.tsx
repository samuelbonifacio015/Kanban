import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Flag, Tag, X } from 'lucide-react';
import { KanbanCard, Priority } from '@/types/kanban';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Partial<KanbanCard>) => void;
  card?: KanbanCard;
  mode: 'create' | 'edit';
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-green-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'text-red-400' },
];

export function CardModal({ isOpen, onClose, onSave, card, mode }: CardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    if (card && mode === 'edit') {
      setTitle(card.title);
      setDescription(card.description || '');
      setPriority(card.priority);
      setAssignee(card.assignee || '');
      setDueDate(card.dueDate || '');
      setLabels(card.labels);
    } else {
      // Reset form for create mode
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignee('');
      setDueDate('');
      setLabels([]);
    }
  }, [card, mode, isOpen]);

  const handleSave = () => {
    const cardData: Partial<KanbanCard> = {
      title,
      description,
      priority,
      assignee: assignee || undefined,
      dueDate: dueDate || undefined,
      labels,
      updatedAt: new Date().toISOString(),
    };

    if (mode === 'create') {
      cardData.createdAt = new Date().toISOString();
    }

    onSave(cardData);
    onClose();
  };

  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-border/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? 'Create New Card' : 'Edit Card'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title..."
              className="glass border-border/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter card description..."
              className="glass border-border/50 min-h-[100px]"
            />
          </div>

          {/* Priority and Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                <SelectTrigger className="glass border-border/50">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Flag className={`w-4 h-4 ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Enter assignee name..."
                className="glass border-border/50"
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="glass border-border/50"
            />
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add a label..."
                className="glass border-border/50"
                onKeyPress={(e) => e.key === 'Enter' && addLabel()}
              />
              <Button type="button" onClick={addLabel} variant="outline" className="glass">
                <Tag className="w-4 h-4" />
              </Button>
            </div>
            
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {labels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {label}
                    <button
                      onClick={() => removeLabel(label)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
            <Button variant="outline" onClick={onClose} className="glass">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!title.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {mode === 'create' ? 'Create Card' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}