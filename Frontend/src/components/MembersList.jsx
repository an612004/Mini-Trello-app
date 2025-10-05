import React, { useState, useEffect } from 'react';
import { Users, Plus, MoreHorizontal, UserMinus, Crown } from 'lucide-react';

// Predefined colors for avatars
const avatarColors = [
  '#EF4444', // red-500
  '#F97316', // orange-500  
  '#EAB308', // yellow-500
  '#22C55E', // green-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#14B8A6', // teal-500
];

// Generate avatar color based on user ID/email
const getAvatarColor = (userId, index) => {
  if (userId) {
    // Use consistent color based on user ID hash
    const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return avatarColors[hash % avatarColors.length];
  }
  return avatarColors[index % avatarColors.length];
};

// Generate initials from name or email
const getInitials = (user) => {
  if (user.name) {
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return 'U';
};

const MembersList = ({ members = [], boardName = 'My Trello board', onInviteClick, isOwner = false, onClose, onRemoveMember, currentUserId, ownerId }) => {
  const [memberDetails, setMemberDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Process members data
  useEffect(() => {
    const processMembers = () => {
      if (members && members.length > 0) {
        const processedMembers = members.map((member, index) => {
          if (typeof member === 'string') {
            // Member is just an ID - create fallback data
            return {
              id: member,
              name: `User ${member.slice(-4)}`, // Use last 4 chars of ID
              email: `user${member.slice(-4)}@example.com`,
              initials: `U${member.slice(-1)}`,
              color: getAvatarColor(member, index)
            };
          } else {
            // Member is an object with details from backend
            return {
              ...member,
              initials: getInitials(member),
              color: member.color || getAvatarColor(member.id, index)
            };
          }
        });
        setMemberDetails(processedMembers);
      } else {
        setMemberDetails([]);
      }
    };
    
    processMembers();
  }, [members]);
  
  const displayMembers = memberDetails;

  // Handle remove member
  const handleRemoveMember = async (memberId, memberEmail) => {
    if (!isOwner) {
      alert('Chỉ chủ board mới có thể xóa thành viên');
      return;
    }

    if (memberId === ownerId) {
      alert('Không thể xóa chủ board');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa thành viên "${memberEmail}" khỏi board?`)) {
      return;
    }

    setLoading(true);
    try {
      if (onRemoveMember) {
        await onRemoveMember(memberId);
        // Remove member from local state
        setMemberDetails(prev => prev.filter(m => m.id !== memberId));
      }
    } catch (error) {
      console.error('Remove member error:', error);
      alert('Không thể xóa thành viên: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-4 h-full min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-200">Your boards</h3>
        {/* <button className="text-gray-400 hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button> */}
      </div>

      {/* Board Title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">{boardName}</h2>
      </div>

      {/* Members Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-300">Members</h4>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
              {displayMembers.length}
            </span>
          </div>
          {isOwner && (
            <button
              onClick={onInviteClick}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span></span>
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {displayMembers.map((member) => {
            const isCurrentUser = member.id === currentUserId;
            const isBoardOwner = member.id === ownerId;
            
            return (
              <div key={member.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold relative"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.initials || member.name?.charAt(0)?.toUpperCase() || 'U'}
                    {isBoardOwner && (
                      <Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
                    )}
                  </div>
                  
                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-white truncate">
                        {member.name || `User ${member.id}`}
                      </p>
                      {isBoardOwner && (
                        <span className="text-xs bg-[#111827] text-yellow-100 px-2 py-0.5 rounded-full">
                        </span>
                      )}
                      {isCurrentUser && (
                        <span className="text-xs bg-[#111827] text-blue-100 px-2 py-0.5 rounded-full">
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {member.email || `user${member.id}@example.com`}
                    </p>
                  </div>
                </div>

                {/* Remove Member Button - Only show for owner and not for the board owner */}
                {isOwner && !isBoardOwner && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.email || member.name)}
                    disabled={loading}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                    title={`Xóa ${member.name || member.email} khỏi board`}
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
          
          {displayMembers.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">Chưa có thành viên nào trong board</p>
              {isOwner && (
                <button
                  onClick={onInviteClick}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  Mời thành viên đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Message */}
       <div className="mt-24 pt-6 border-t border-gray-700"> {/* mt-24 lùi xuống */}
    <p className="text-xs text-gray-500 leading-relaxed">
      You can't find and reopen closed boards if close the board
    </p>
    <button 
      onClick={onClose}
      className="mt-2 text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1 rounded"
    >
      Close
    </button>
  </div>
    </div>
  );
};

export default MembersList;