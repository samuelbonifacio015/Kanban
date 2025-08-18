import { useState, useEffect } from 'react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { KanbanBoard as KanbanBoardType } from '@/types/kanban';
import { v4 as uuidv4 } from 'uuid';

const defaultBoard: KanbanBoardType = {
  id: uuidv4(),
  title: 'My Kanban Board',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      color: '#8B5CF6',
      cards: [
        {
          id: uuidv4(),
          title: 'Welcome to your Kanban board!',
          description: 'This is a sample card. Click to edit it or drag it to another column.',
          priority: 'medium',
          assignee: 'You',
          labels: ['Welcome', 'Getting Started'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          title: 'Create your first task',
          description: 'Click the + button to add a new card to any column.',
          priority: 'high',
          labels: ['Tutorial'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: '#F59E0B',
      cards: [
        {
          id: uuidv4(),
          title: 'Drag and drop cards',
          description: 'Try dragging this card to another column to see the smooth animations.',
          priority: 'medium',
          assignee: 'Team',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          labels: ['Feature', 'UI/UX'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      color: '#10B981',
      cards: [
        {
          id: uuidv4(),
          title: 'Set up Kanban board',
          description: 'The basic structure is complete with drag-and-drop functionality.',
          priority: 'critical',
          assignee: 'Developer',
          labels: ['Setup', 'Complete'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]
    }
  ]
};

const Index = () => {
  const [board, setBoard] = useLocalStorage<KanbanBoardType>('kanban-board', defaultBoard);

  const handleUpdateBoard = (updatedBoard: KanbanBoardType) => {
    setBoard(updatedBoard);
  };

  return (
    <div className="min-h-screen">
      <KanbanBoard board={board} onUpdateBoard={handleUpdateBoard} />
    </div>
  );
};

export default Index;
