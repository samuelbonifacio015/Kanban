import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, Trash2 } from 'lucide-react';
import { KanbanBoard } from '@/types/kanban';
import { useToast } from '@/hooks/use-toast';

interface BoardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: KanbanBoard;
  onUpdateBoard: (board: KanbanBoard) => void;
  onExportBoard: () => void;
  onImportBoard: (data: KanbanBoard) => void;
  onClearBoard: () => void;
}

export function BoardSettingsModal({
  isOpen,
  onClose,
  board,
  onUpdateBoard,
  onExportBoard,
  onImportBoard,
  onClearBoard
}: BoardSettingsModalProps) {
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || '');
  const { toast } = useToast();

  const handleSave = () => {
    const updatedBoard = {
      ...board,
      title,
      description,
      updatedAt: new Date().toISOString()
    };
    onUpdateBoard(updatedBoard);
    onClose();
    toast({
      title: "Board Updated",
      description: "Board settings have been saved successfully.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        onImportBoard(importedData);
        toast({
          title: "Board Imported",
          description: "Board has been imported successfully.",
        });
        onClose();
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to import board. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
      onClearBoard();
      toast({
        title: "Board Cleared",
        description: "All tasks have been removed from the board.",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Board Settings</DialogTitle>
          <DialogDescription>
            Customize your board and manage your data
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-title">Board Title</Label>
            <Input
              id="board-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter board title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="board-description">Description (Optional)</Label>
            <Textarea
              id="board-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter board description"
              rows={3}
            />
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Data Management</h4>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={onExportBoard}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Board as JSON
              </Button>
              
              <div>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('import-file')?.click()}
                  className="justify-start w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Board from JSON
                </Button>
              </div>
              
              <Button
                variant="destructive"
                onClick={handleClear}
                className="justify-start"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Tasks
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}