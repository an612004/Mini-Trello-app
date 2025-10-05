import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Star, MoreHorizontal, Eye, Edit3, Trash2 } from 'lucide-react';
import { boardsAPI } from '../services/api';
import { useDispatch } from 'react-redux';
import { removeBoard } from '../store/boardsSlice';

const BoardCard = ({ board }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleOpenBoard = () => {
    navigate(`/board/${board.id}`);
  };

  const handleDeleteBoard = async () => {
    if (!window.confirm('Are you sure you want to delete this board?')) return;
    
    setLoading(true);
    try {
      await boardsAPI.delete(board.id);
      dispatch(removeBoard(board.id));
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete board');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-black rounded-xl shadow-sm border border-black-200 hover:shadow-md transition-shadow duration-200 group">
      <div 
        className="p-6 cursor-pointer"
        onClick={handleOpenBoard}
      >
        {/* Board Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {board.name}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-100 transition-all"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenBoard();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open Board</span>
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Board</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBoard();
                  }}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{loading ? 'Deleting...' : 'Delete Board'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Board Description */}
        {board.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {board.description}
          </p>
        )}

        {/* Board Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{board.members?.length || 0} members</span>
            </div>
            {board.isStarred && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(board.createdAt || Date.now())}</span>
          </div>
        </div>

        {/* Board Members Avatars */}
        {board.members && board.members.length > 0 && (
          <div className="flex -space-x-2">
            {board.members.slice(0, 4).map((member, index) => (
              <div
                key={member.id || index}
                className="relative"
              >
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {member.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {board.members.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 text-xs font-medium">
                  +{board.members.length - 4}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default BoardCard;