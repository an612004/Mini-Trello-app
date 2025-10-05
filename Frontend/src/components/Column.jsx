import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import TaskCard from './TaskCard';

const Column = ({ column, cards, boardId, boardMembers, onAddCard, onDeleteCard, onEditCard, onUpdateCard, onDeleteList }) => {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-black-100 rounded-lg p-4">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="font-medium text-gray-900">
              {column.title}
            </h3>
            <span className="bg-black-200 text-gray-600 text-xs px-2 py-1 rounded-full">
              {cards.length}
            </span>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
            
            {/* Column Menu */}
            {showColumnMenu && (
              <div className="absolute right-0 top-8 bg-black-100 border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                <button
                  onClick={() => {
                    setShowColumnMenu(false);
                    // TODO: Add edit list functionality
                    alert('Edit list functionality coming soon!');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit List
                </button>
                <button
                  onClick={() => {
                    setShowColumnMenu(false);
                    if (cards.length > 0) {
                      alert('Cannot delete list with cards. Please move or delete all cards first.');
                      return;
                    }
                    if (window.confirm(`Are you sure you want to delete "${column.title}" list?`)) {
                      onDeleteList && onDeleteList(column.id);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete List
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drop Zone */}
        <div
          ref={setNodeRef}
          className={`min-h-[200px] space-y-3 ${
            isOver ? 'bg-black-50 border-2 border-dashed border-blue-300 rounded-lg p-2' : ''
          }`}
        >
          <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
            {cards.map(card => (
              <TaskCard 
                key={card.id} 
                card={card} 
                boardId={boardId}
                boardMembers={boardMembers}
                onDelete={onDeleteCard}
                onEdit={onEditCard}
                onUpdate={onUpdateCard}
              />
            ))}
          </SortableContext>

          {/* Add Card Button */}
          <button 
            onClick={() => onAddCard && onAddCard(column.id)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-white transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add a card</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Column;