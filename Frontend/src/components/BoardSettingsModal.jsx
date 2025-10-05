import React, { useState } from 'react';
import { X, Settings, Trash2, Users, UserMinus, Edit3 } from 'lucide-react';
import { boardsAPI } from '../services/api';

const BoardSettingsModal = ({ board, isOpen, onClose, onBoardUpdated, onBoardDeleted }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [editMode, setEditMode] = useState(false);
  const [boardName, setBoardName] = useState(board?.name || '');
  const [boardDescription, setBoardDescription] = useState(board?.description || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !board) return null;

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = currentUser.id === board.ownerId;

  const handleUpdateBoard = async () => {
    if (!boardName.trim()) return;

    setLoading(true);
    try {
      await boardsAPI.update(board.id, {
        name: boardName.trim(),
        description: boardDescription.trim()
      });
      
      onBoardUpdated({
        ...board,
        name: boardName.trim(),
        description: boardDescription.trim()
      });
      
      setEditMode(false);
      alert('Cập nhật board thành công!');
    } catch (error) {
      console.error('Update board error:', error);
      alert('Không thể cập nhật board: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!isOwner) {
      alert('Chỉ chủ board mới có thể xóa board');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa board "${board.name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    setLoading(true);
    try {
      await boardsAPI.delete(board.id);
      onBoardDeleted(board.id);
      onClose();
      alert('Xóa board thành công!');
    } catch (error) {
      console.error('Delete board error:', error);
      alert('Không thể xóa board: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!isOwner && memberId !== currentUser.id) {
      alert('Chỉ chủ board hoặc bản thân mới có thể xóa thành viên');
      return;
    }

    const memberName = board.memberDetails?.find(m => m.id === memberId)?.email || memberId;
    const confirmMsg = memberId === currentUser.id 
      ? `Bạn có chắc muốn rời khỏi board "${board.name}"?`
      : `Bạn có chắc muốn xóa thành viên "${memberName}" khỏi board?`;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      await boardsAPI.removeMember(board.id, memberId);
      
      if (memberId === currentUser.id) {
        // User left the board
        onBoardDeleted(board.id);
        onClose();
        alert('Bạn đã rời khỏi board!');
      } else {
        // Owner removed a member
        const updatedBoard = {
          ...board,
          members: board.members.filter(id => id !== memberId),
          memberDetails: board.memberDetails?.filter(m => m.id !== memberId) || []
        };
        onBoardUpdated(updatedBoard);
        alert('Đã xóa thành viên khỏi board!');
      }
    } catch (error) {
      console.error('Remove member error:', error);
      alert('Không thể xóa thành viên: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'Thông tin chung', icon: Settings },
    { id: 'members', name: 'Thành viên', icon: Users }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Cài đặt Board</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 160px)' }}>
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Board Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Thông tin Board</h3>
                  {isOwner && (
                    <button
                      onClick={() => {
                        setEditMode(!editMode);
                        if (!editMode) {
                          setBoardName(board.name);
                          setBoardDescription(board.description || '');
                        }
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      disabled={loading}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{editMode ? 'Hủy' : 'Chỉnh sửa'}</span>
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên Board
                      </label>
                      <input
                        type="text"
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tên board..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả
                      </label>
                      <textarea
                        value={boardDescription}
                        onChange={(e) => setBoardDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Mô tả về board..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleUpdateBoard}
                        disabled={loading || !boardName.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                      >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Tên Board:</span>
                      <p className="font-medium">{board.name}</p>
                    </div>
                    {board.description && (
                      <div>
                        <span className="text-sm text-gray-600">Mô tả:</span>
                        <p className="text-gray-800">{board.description}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-600">Chủ board:</span>
                      <p className="font-medium">{board.ownerEmail || board.ownerId}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Được tạo:</span>
                      <p className="text-gray-800">
                        {new Date(board.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Danger Zone */}
              {isOwner && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-red-600 mb-4">Vùng nguy hiểm</h3>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-800">Xóa board</h4>
                        <p className="text-sm text-red-600 mt-1">
                          Xóa vĩnh viễn board và tất cả dữ liệu liên quan. Hành động này không thể hoàn tác.
                        </p>
                        <button
                          onClick={handleDeleteBoard}
                          disabled={loading}
                          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                        >
                          {loading ? 'Đang xóa...' : 'Xóa board'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Thành viên Board</h3>
              
              <div className="space-y-3">
                {/* Owner */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {(board.ownerEmail || board.ownerId).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{board.ownerEmail || board.ownerId}</p>
                      <p className="text-sm text-blue-600">Chủ board</p>
                    </div>
                  </div>
                </div>

                {/* Members */}
                {board.memberDetails && board.memberDetails
                  .filter(member => member.id !== board.ownerId)
                  .map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {member.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{member.email}</p>
                          <p className="text-sm text-gray-600">Thành viên</p>
                        </div>
                      </div>
                      
                      {(isOwner || member.id === currentUser.id) && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={loading}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <UserMinus className="w-4 h-4" />
                          <span>{member.id === currentUser.id ? 'Rời board' : 'Xóa'}</span>
                        </button>
                      )}
                    </div>
                  ))}

                {/* Current user if they're a member but not owner */}
                {currentUser.id !== board.ownerId && board.members.includes(currentUser.id) && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{currentUser.email || currentUser.id}</p>
                        <p className="text-sm text-gray-600">Bạn</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveMember(currentUser.id)}
                      disabled={loading}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span>Rời board</span>
                    </button>
                  </div>
                )}
              </div>

              {board.memberDetails && board.memberDetails.length === 1 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Chỉ có chủ board trong board này</p>
                  <p className="text-sm mt-1">Mời thêm thành viên để cộng tác</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardSettingsModal;