import { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Flag, User, MessageCircle, Archive, Eye, Github, Link, FileText, Edit2, Save, Plus, UserCheck, UserX } from 'lucide-react';

const CardDetailModal = ({ card, onClose, onDelete, onUpdate, boardMembers = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignees: []
  });
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [members, setMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const loadComments = useCallback(async () => {
    if (!card) return;
    try {
      const response = await fetch(`http://localhost:3000/boards/${card.boardId}/cards/${card.id}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, [card]);

  const loadMembers = useCallback(() => {
    if (!card) return;
    try {
      // For now, use card.members array and match with boardMembers
      const cardMembers = boardMembers.filter(member => 
        card.members && card.members.includes(member.id)
      );
      setMembers(cardMembers);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  }, [card, boardMembers]);

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || card.name || '',
        description: card.description || '',
        priority: card.priority || 'medium',
        dueDate: card.dueDate || '',
        assignees: card.assignees || []
      });
      loadComments();
      loadMembers();
    }
  }, [card, boardMembers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      await onUpdate({ ...card, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    console.log('💬 Adding comment:', { cardId: card.id, boardId: card.boardId, hasToken: !!localStorage.getItem('token') });

    try {
      const response = await fetch(`http://localhost:3000/boards/${card.boardId}/cards/${card.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment('');
        loadComments(); // Reload comments
      } else {
        const errorData = await response.json();
        console.error('❌ Comment error:', errorData);
        alert(errorData.error || 'Không thể thêm comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    console.log('👥 Adding member:', { 
      cardId: card.id, 
      boardId: card.boardId, 
      email: newMemberEmail,
      hasToken: !!localStorage.getItem('token') 
    });

    try {
      const response = await fetch(`http://localhost:3000/boards/${card.boardId}/cards/${card.id}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userEmail: newMemberEmail })
      });

      console.log('👥 Member response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Member added successfully:', responseData);
        
        setNewMemberEmail('');
        setShowAddMember(false);
        
        // Update card object locally to include new member
        if (responseData.user) {
          const updatedCard = {
            ...card,
            members: [...(card.members || []), responseData.user.id]
          };
          // Call parent update function to refresh card data
          if (onUpdate) {
            onUpdate(updatedCard);
          }
        }
        
        loadMembers(); // Reload members
      } else {
        const errorData = await response.json();
        console.error('❌ Member error:', errorData);
        alert(errorData.error || 'Không thể thêm thành viên');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Có lỗi xảy ra khi thêm thành viên');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await fetch(`http://localhost:3000/boards/${card.boardId}/cards/${card.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadMembers(); // Reload members
        window.location.reload(); // Simple refresh for now
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };



  const handleAssigneeToggle = (member) => {
    const isAssigned = formData.assignees.some(assignee => 
      (assignee.id && assignee.id === member.id) || 
      (assignee.email && assignee.email === member.email)
    );

    if (isAssigned) {
      setFormData(prev => ({
        ...prev,
        assignees: prev.assignees.filter(assignee => 
          assignee.id !== member.id && assignee.email !== member.email
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assignees: [...prev.assignees, member]
      }));
    }
  };

  const removeAssignee = (memberId) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.filter(assignee => assignee.id !== memberId)
    }));
  };

  const getInitials = (name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getAvatarColor = (id, index = 0) => {
    const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
    if (id) {
      const hash = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      return colors[hash % colors.length];
    }
    return colors[index % colors.length];
  };

  if (!card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="text-lg font-semibold bg-gray-700 text-white px-2 py-1 rounded border-none outline-none"
                autoFocus
              />
            ) : (
              <h2 className="text-lg font-semibold">{formData.title || 'Project planning'}</h2>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Members Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Members</span>
                <div className="flex items-center space-x-1">
                  {formData.assignees.map((assignee, index) => (
                    <div
                      key={assignee.id || assignee.email || index}
                      className="relative group"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: getAvatarColor(assignee.id || assignee.email, index) }}
                        title={assignee.name || assignee.email}
                      >
                        {getInitials(assignee.name, assignee.email)}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeAssignee(assignee.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowAssigneeModal(true)}
                    className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Notifications</span>
                <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center space-x-2 transition-colors">
                  <Eye className="w-4 h-4" />
                  <span>Watch</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold">Description</h3>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add a more detailed description"
                    className="w-full bg-transparent text-gray-300 placeholder-gray-500 resize-none border-none outline-none min-h-[60px]"
                  />
                ) : (
                  <div 
                    className="text-gray-300 min-h-[60px] cursor-pointer"
                    onClick={() => setIsEditing(true)}
                  >
                    {formData.description || 'Add a more detailed description'}
                  </div>
                )}
              </div>
            </div>

            {/* Activity */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold">Activity</h3>
                {comments.length > 3 && (
                  <span className="ml-auto text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    {comments.length} comments • Scroll để xem tất cả
                  </span>
                )}
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  SD
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg p-3 border-none outline-none resize-none min-h-[40px]"
                  />
                  {newComment && (
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                    >
                      Comment
                    </button>
                  )}
                </div>
              </div>

              {/* Existing Comments */}
              <div className="mt-6">
                <div className="max-h-80 overflow-y-auto space-y-4 pr-2 scrollbar-thin border-t border-gray-700 pt-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(comment.userName || comment.userEmail)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm truncate">
                              {comment.userName || comment.userEmail.split('@')[0]}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {new Date(comment.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 break-words">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {comments.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Chưa có comment nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-48 bg-gray-900 p-4 space-y-4 overflow-y-auto">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Add to card</h4>
              <div className="space-y-2">
                {/* Members Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-gray-300">Members</h5>
                    <button 
                      onClick={() => setShowAddMember(!showAddMember)}
                      className="p-1 hover:bg-gray-600 rounded text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Current Members */}
                  <div className="space-y-1">
                    {members.map(member => (
                      <div key={member.id} className="flex items-center justify-between bg-gray-700 rounded px-2 py-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {(member.githubUsername || member.email)[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-300">
                            {member.githubUsername || member.email.split('@')[0]}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          <UserX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Member Form */}
                  {showAddMember && (
                    <div className="space-y-2 p-2 bg-gray-700 rounded">
                      <input
                        type="email"
                        placeholder="Email người dùng"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex space-x-2">
                        <button 
                          onClick={handleAddMember}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                        >
                          Thêm
                        </button>
                        <button 
                          onClick={() => setShowAddMember(false)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Power-Ups</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Actions</h4>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-1 text-sm text-gray-400 hover:text-white">
                  Attach Branch
                </button>
                <button className="w-full text-left px-2 py-1 text-sm text-gray-400 hover:text-white">
                  Attach Commit
                </button>
                <button className="w-full text-left px-2 py-1 text-sm text-gray-400 hover:text-white">
                  Attach Issue
                </button>
                <button className="w-full text-left px-2 py-1 text-sm text-gray-400 hover:text-white">
                  Attach Pull Request...
                </button>
              </div>
            </div>

            <div className="pt-4">
              {/* Danger Zone */}
              <div className="border-t border-gray-700 pt-4">
                <h5 className="text-xs font-medium text-red-400 mb-3 uppercase tracking-wider">Danger Zone</h5>
                <button 
                  onClick={async () => {
                    if (window.confirm('⚠️ Xác nhận xóa card\n\nBạn có chắc chắn muốn xóa card này không? Hành động này không thể hoàn tác và sẽ xóa tất cả tasks bên trong.')) {
                      try {
                        setLoading(true);
                        console.log('🗑️ Delete attempt:', { 
                          cardId: card.id, 
                          boardId: card.boardId || 'undefined',
                          hasToken: !!localStorage.getItem('token')
                        });
                        
                        await onDelete(card.id);
                        console.log('✅ Delete successful');
                        onClose();
                      } catch (error) {
                        console.error('❌ Delete card error:', error);
                        console.log('❌ Full error details:', {
                          message: error.message,
                          status: error.response?.status,
                          data: error.response?.data,
                          url: error.config?.url,
                          method: error.config?.method
                        });
                        const errorMessage = error.response?.data?.error || error.message || 'Không thể xóa card';
                        alert(`❌ ${errorMessage}`);
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <Archive className="w-4 h-4" />
                  <span>{loading ? 'Đang xóa...' : '🗑️ Xóa Card Vĩnh Viễn'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignee Modal */}
      {showAssigneeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-gray-800 text-white rounded-lg shadow-xl max-w-md w-full max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold">Assign Members</h3>
              <button
                onClick={() => setShowAssigneeModal(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {boardMembers.map((member) => {
                  const isAssigned = formData.assignees.some(assignee => 
                    (assignee.id && assignee.id === member.id) || 
                    (assignee.email && assignee.email === member.email)
                  );
                  return (
                    <div
                      key={member.id || member.email}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleAssigneeToggle(member)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: getAvatarColor(member.id || member.email) }}
                        >
                          {getInitials(member.name, member.email)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {member.name || member.email}
                          </div>
                          {member.name && member.email && (
                            <div className="text-xs text-gray-400">{member.email}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {isAssigned ? (
                          <UserCheck className="w-5 h-5 text-green-400" />
                        ) : (
                          <UserX className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
                {boardMembers.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <User className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                    <p>No members available</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-700">
              <button
                onClick={() => setShowAssigneeModal(false)}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAssigneeModal(false);
                  if (isEditing) handleSave();
                }}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardDetailModal;