import { useState, useCallback } from 'react';
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
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { CardModal } from './CardModal';
import { BoardSettingsModal } from './BoardSettingsModal';
import { AddColumnModal } from './AddColumnModal';
import { Button } from '@/components/ui/button';
import { Plus, Settings, LogOut, User } from 'lucide-react';
import { KanbanBoard as KanbanBoardType, KanbanCard as KanbanCardType, KanbanColumn as KanbanColumnType } from '@/types/kanban';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  board: KanbanBoardType;
  onUpdateBoard: (board: KanbanBoardType) => void;
}

export function KanbanBoard({ board, onUpdateBoard }: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeColumnId, setActiveColumnId] = useState<string>('');
  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = findCardById(active.id as string);
    setActiveCard(card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCard = findCardById(activeId);
    const overCard = findCardById(overId);

    if (!activeCard) return;

    const activeColumnId = findColumnByCardId(activeId)?.id;
    const overColumnId = overCard ? findColumnByCardId(overId)?.id : overId;

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    const updatedBoard = { ...board };
    const activeColumn = updatedBoard.columns.find(col => col.id === activeColumnId)!;
    const overColumn = updatedBoard.columns.find(col => col.id === overColumnId)!;

    // Remove card from active column
    activeColumn.cards = activeColumn.cards.filter(card => card.id !== activeId);

    // Add card to over column
    const overCardIndex = overCard ? overColumn.cards.findIndex(card => card.id === overId) : overColumn.cards.length;
    overColumn.cards.splice(overCardIndex, 0, activeCard);

    onUpdateBoard(updatedBoard);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCard = findCardById(activeId);
    const overCard = findCardById(overId);

    if (!activeCard) return;

    const activeColumnId = findColumnByCardId(activeId)?.id;
    const overColumnId = overCard ? findColumnByCardId(overId)?.id : overId;

    if (!activeColumnId || !overColumnId) return;

    if (activeColumnId === overColumnId) {
      // Reordering within the same column
      const column = board.columns.find(col => col.id === activeColumnId)!;
      const activeIndex = column.cards.findIndex(card => card.id === activeId);
      const overIndex = overCard ? column.cards.findIndex(card => card.id === overId) : column.cards.length;

      if (activeIndex !== overIndex) {
        const updatedBoard = { ...board };
        const updatedColumn = updatedBoard.columns.find(col => col.id === activeColumnId)!;
        updatedColumn.cards = arrayMove(updatedColumn.cards, activeIndex, overIndex);
        onUpdateBoard(updatedBoard);
      }
    }
  };

  const findCardById = (id: string): KanbanCardType | undefined => {
    for (const column of board.columns) {
      const card = column.cards.find(card => card.id === id);
      if (card) return card;
    }
  };

  const findColumnByCardId = (cardId: string): KanbanColumnType | undefined => {
    return board.columns.find(column => 
      column.cards.some(card => card.id === cardId)
    );
  };

  const handleAddCard = (columnId: string) => {
    setActiveColumnId(columnId);
    setSelectedCard(undefined);
    setModalMode('create');
    setIsCardModalOpen(true);
  };

  const handleEditCard = (card: KanbanCardType) => {
    setSelectedCard(card);
    setModalMode('edit');
    setIsCardModalOpen(true);
  };

  const handleSaveCard = useCallback((cardData: Partial<KanbanCardType>) => {
    const updatedBoard = { ...board };
    
    if (modalMode === 'create') {
      const newCard: KanbanCardType = {
        id: uuidv4(),
        title: cardData.title!,
        description: cardData.description,
        priority: cardData.priority!,
        assignee: cardData.assignee,
        dueDate: cardData.dueDate,
        labels: cardData.labels || [],
        createdAt: cardData.createdAt!,
        updatedAt: cardData.updatedAt!,
      };
      
      const column = updatedBoard.columns.find(col => col.id === activeColumnId);
      if (column) {
        column.cards.push(newCard);
      }
    } else if (modalMode === 'edit' && selectedCard) {
      // Find and update the existing card
      for (const column of updatedBoard.columns) {
        const cardIndex = column.cards.findIndex(card => card.id === selectedCard.id);
        if (cardIndex !== -1) {
          column.cards[cardIndex] = { ...selectedCard, ...cardData };
          break;
        }
      }
    }

    updatedBoard.updatedAt = new Date().toISOString();
    onUpdateBoard(updatedBoard);
  }, [board, modalMode, selectedCard, activeColumnId, onUpdateBoard]);

  const handleAddColumn = (columnData: Omit<KanbanColumnType, 'id'>) => {
    const newColumn: KanbanColumnType = {
      id: uuidv4(),
      ...columnData
    };
    
    const updatedBoard = {
      ...board,
      columns: [...board.columns, newColumn],
      updatedAt: new Date().toISOString()
    };
    
    onUpdateBoard(updatedBoard);
    toast({
      title: "Column Added",
      description: `"${columnData.title}" column has been created.`,
    });
  };

  const handleExportBoard = () => {
    const dataStr = JSON.stringify(board, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Board Exported",
      description: "Your board has been downloaded as JSON file.",
    });
  };

  const handleImportBoard = (importedBoard: KanbanBoardType) => {
    const updatedBoard = {
      ...importedBoard,
      id: board.id, // Keep current board ID
      updatedAt: new Date().toISOString()
    };
    onUpdateBoard(updatedBoard);
  };

  const handleClearBoard = () => {
    const clearedBoard = {
      ...board,
      columns: board.columns.map(col => ({ ...col, cards: [] })),
      updatedAt: new Date().toISOString()
    };
    onUpdateBoard(clearedBoard);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

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
            <h1 className="text-3xl font-bold text-foreground">{board.title}</h1>
            <p className="text-muted-foreground mt-1">
              {board.description || 'Manage your project tasks and workflow'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                {user.email}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="ml-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
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
          {board.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="rotate-2 opacity-90">
              <KanbanCard card={activeCard} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleSaveCard}
        card={selectedCard}
        mode={modalMode}
      />

      <BoardSettingsModal
        isOpen={isBoardSettingsOpen}
        onClose={() => setIsBoardSettingsOpen(false)}
        board={board}
        onUpdateBoard={onUpdateBoard}
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