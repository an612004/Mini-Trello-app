import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || card.name || '',
        description: card.description || '',
        priority: card.priority || 'medium',
        dueDate: card.dueDate || '',
        assignees: card.assignees || []
      });
    }
  }, [card]);

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

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    // Add comment logic here
    setNewComment('');
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
      <div className="bg-gray-800 text-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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

        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6">
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
                <button className="ml-auto text-sm text-blue-400 hover:text-blue-300">
                  Show details
                </button>
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
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-48 bg-gray-900 p-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Add to card</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowAssigneeModal(true)}
                  className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Members</span>
                </button>
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

            <div className="pt-4 space-y-2">
              <button 
                onClick={() => {
                  const token = localStorage.getItem('token');
                  const user = localStorage.getItem('user');
                  console.log('🔍 Auth Status Check:', {
                    hasToken: !!token,
                    tokenLength: token?.length || 0,
                    hasUser: !!user,
                    userData: user ? JSON.parse(user) : null,
                    localStorage: {
                      allKeys: Object.keys(localStorage),
                      tokenValue: token
                    }
                  });
                  alert(`Token: ${token ? 'Có (' + token.length + ' chars)' : 'Không có'}\nUser: ${user ? 'Có' : 'Không có'}\nAll localStorage keys: ${Object.keys(localStorage).join(', ')}`);
                }}
                className="w-full flex items-center justify-center px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
              >
                Check Auth
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    console.log('🧪 Testing backend connection...');
                    const response = await fetch('http://localhost:3000/boards');
                    const text = await response.text();
                    console.log('🔗 Backend response:', {
                      status: response.status,
                      statusText: response.statusText,
                      body: text
                    });
                    alert(`Backend Status: ${response.status}\nResponse: ${text}`);
                  } catch (error) {
                    console.error('❌ Backend connection error:', error);
                    alert(`Backend Error: ${error.message}`);
                  }
                }}
                className="w-full flex items-center justify-center px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
              >
                Test Backend
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    // Test with the current token
                    const token = localStorage.getItem('token');
                    console.log('🧪 Testing API with current token...');
                    
                    const response = await fetch('http://localhost:3000/boards', {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    const text = await response.text();
                    console.log('🔗 API Test with token:', {
                      status: response.status,
                      statusText: response.statusText,
                      body: text,
                      token: token ? token.substring(0, 20) + '...' : 'None'
                    });
                    
                    alert(`API Test with Token:\nStatus: ${response.status}\nResponse: ${text}`);
                  } catch (error) {
                    console.error('❌ API test error:', error);
                    alert(`API Test Error: ${error.message}`);
                  }
                }}
                className="w-full flex items-center justify-center px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors"
              >
                Test API Auth
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    // Generate a valid JWT token for testing
                    const payload = {
                      id: 'test-user-123',
                      email: 'test@example.com',
                      name: 'Test User',
                      iat: Math.floor(Date.now() / 1000),
                      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
                    };
                    
                    // For testing, we'll create a simple token
                    // In a real app, this should be done on the server side
                    const testToken = btoa(JSON.stringify(payload));
                    
                    localStorage.setItem('token', testToken);
                    localStorage.setItem('user', JSON.stringify({ 
                      id: 'test-user-123', 
                      email: 'test@example.com',
                      name: 'Test User'
                    }));
                    
                    console.log('🔑 Generated test token:', testToken);
                    alert('Generated test token! Check console for details.');
                  } catch (error) {
                    console.error('❌ Token generation error:', error);
                    alert(`Token Error: ${error.message}`);
                  }
                }}
                className="w-full flex items-center justify-center px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs transition-colors"
              >
                Generate Token
              </button>
              
              <button 
                onClick={() => {
                  // Clear all auth data and redirect to login
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  alert('Auth cleared! You need to login properly.');
                  // In real app, redirect to login page
                  window.location.href = '/login';
                }}
                className="w-full flex items-center justify-center px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-xs transition-colors"
              >
                Go to Login
              </button>
              
              <button 
                onClick={async () => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa card này?')) {
                    try {
                      setLoading(true);
                      console.log('🗑️ CardDetailModal: Attempting to delete card:', card.id);
                      
                      // Check auth before delete
                      const token = localStorage.getItem('token');
                      if (!token) {
                        throw new Error('Bạn cần đăng nhập để xóa card');
                      }
                      
                      await onDelete(card.id);
                      console.log('✅ CardDetailModal: Delete successful, closing modal');
                      onClose(); // Close modal after successful delete
                    } catch (error) {
                      console.error('❌ CardDetailModal delete error:', error);
                      console.error('❌ Error details:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status,
                        cardId: card.id
                      });
                      const errorMessage = error.response?.data?.error || error.message || 'Không xác định';
                      alert(`Không thể xóa card.\nLỗi: ${errorMessage}\nVui lòng thử lại.`);
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                disabled={loading}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors"
              >
                <Archive className="w-4 h-4" />
                <span>{loading ? 'Đang xóa...' : 'Delete Card'}</span>
              </button>
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