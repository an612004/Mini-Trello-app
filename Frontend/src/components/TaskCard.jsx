import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageCircle, Paperclip, User, MoreHorizontal } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import CardDetailModal from './CardDetailModal';

const TaskCard = ({ card, boardId, boardMembers, isDragging = false, onDelete, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.7 : 1,
    scale: isDragging || isSortableDragging ? 1.02 : 1,
    boxShadow: isDragging || isSortableDragging ? '0 8px 20px rgba(0,0,0,0.15)' : 'none',
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <>
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group relative ${
        isDragging ? 'rotate-2 shadow-lg' : ''
      } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={(e) => {
        // Only show detail modal if not clicking on menu button or drag handle
        if (!showMenu && !e.target.closest('.menu-button') && !e.target.closest('[data-drag-handle]')) {
          setShowDetailModal(true);
        }
      }}
    >
      {/* Drag Handle */}
      <div 
        {...listeners}
        data-drag-handle="true"
        className="absolute top-1 left-1 w-2 h-8 cursor-move opacity-0 group-hover:opacity-30 hover:opacity-60 transition-opacity"
        style={{ background: 'repeating-linear-gradient(0deg, #666 0px, #666 1px, transparent 1px, transparent 3px)' }}
      />

      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1 pr-2">
          {card.title || card.name || 'Untitled Card'}
        </h4>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all menu-button"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  setShowDetailModal(true);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit Card
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  
                  // Show confirmation dialog
                  if (!window.confirm('Bạn có chắc chắn muốn xóa card này không?')) {
                    return;
                  }
                  
                  setIsDeleting(true);
                  
                  try {
                    if (typeof onDelete === 'function') {
                      await onDelete(card.id);
                    } else {
                      throw new Error('Chức năng xóa không khả dụng');
                    }
                  } catch (error) {
                    console.error('Delete card error:', error);
                    alert('Không thể xóa card: ' + (error.response?.data?.error || error.message));
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Card'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Description */}
      {card.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Priority Badge */}
      {card.priority && (
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(card.priority)}`}>
            {card.priority}
          </span>
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Due Date */}
          {card.dueDate && (
            <div className={`flex items-center space-x-1 ${isOverdue(card.dueDate) ? 'text-red-600' : ''}`}>
              <Calendar className="w-3 h-3" />
              <span className={isOverdue(card.dueDate) ? 'font-medium' : ''}>
                {formatDate(card.dueDate)}
              </span>
            </div>
          )}

          {/* Comments Count */}
          {card.commentsCount > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{card.commentsCount}</span>
            </div>
          )}

          {/* Attachments Count */}
          {card.attachmentsCount > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="w-3 h-3" />
              <span>{card.attachmentsCount}</span>
            </div>
          )}

          {/* Tasks Count */}
          {card.tasksCount > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border border-gray-400 rounded-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              </div>
              <span>{card.completedTasks}/{card.tasksCount}</span>
            </div>
          )}
        </div>

        {/* Assignees */}
        {card.assignees && card.assignees.length > 0 && (
          <div className="flex -space-x-1" title={`Assigned to: ${card.assignees.map(a => a.name || a.email).join(', ')}`}>
            {card.assignees.slice(0, 3).map((assignee, index) => {
              const initials = assignee.name 
                ? assignee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                : assignee.email?.slice(0, 2).toUpperCase() || 'U';
              
              const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
              const colorIndex = (assignee.id || assignee.email || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              const bgColor = colors[colorIndex % colors.length];
              
              return (
                <div key={assignee.id || assignee.email || index} className="relative" title={assignee.name || assignee.email}>
                  {assignee.avatar ? (
                    <img
                      src={assignee.avatar}
                      alt={assignee.name || assignee.email}
                      className="w-6 h-6 rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <div className={`w-6 h-6 rounded-full border-2 border-white ${bgColor} flex items-center justify-center`}>
                      <span className="text-white text-xs font-medium">{initials}</span>
                    </div>
                  )}
                </div>
              );
            })}
            {card.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center" title={`+${card.assignees.length - 3} more`}>
                <span className="text-gray-600 text-xs font-medium">
                  +{card.assignees.length - 3}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showMenu && (
        <div className="absolute right-2 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Edit Card
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Add Members
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Set Due Date
          </button>
          <hr className="my-1" />
          <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            Delete Card
          </button>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Delete Loading Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2 text-red-600">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Deleting...</span>
          </div>
        </div>
      )}
    </div>

    {/* Card Detail Modal */}
    {showDetailModal && (
      <CardDetailModal
        card={{...card, boardId: card.boardId || boardId }}
        boardMembers={boardMembers || []}
        onClose={() => {
          setShowDetailModal(false);
        }}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    )}
    </>
  );
};

export default TaskCard;