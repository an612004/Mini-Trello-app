import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Grid, Search, Filter, LogOut, User, Settings } from 'lucide-react';
import { boardsAPI } from '../services/api';
import { setBoards, setBoardsLoading, setBoardsError, addBoard } from '../store/boardsSlice';
import { logout } from '../store/authSlice';
import useSocket from '../hooks/useSocket';
import BoardCard from '../components/BoardCard';
import CreateBoardModal from '../components/CreateBoardModal';

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards, loading, error } = useSelector(state => state.boards);
  const { user } = useSelector(state => state.auth);
  
  // Initialize socket connection
  useSocket();

  const fetchBoards = useCallback(async () => {
    dispatch(setBoardsLoading(true));
    try {
      const response = await boardsAPI.getAll();
      dispatch(setBoards(response.data || []));
    } catch (error) {
      dispatch(setBoardsError(error.response?.data?.error || 'Failed to fetch boards'));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreateBoard = async (boardData) => {
    try {
      const response = await boardsAPI.create(boardData);
      dispatch(addBoard(response.data));
      setShowCreateModal(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create board');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    board.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#242A30]">
      {/* Original Header */}
     <header className="w-full bg-[#242A30] shadow-sm border-b fixed top-0 left-0 z-50">
  {/* Bỏ max-w và mx-auto để không bị căn giữa */}
  <div className="w-full px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Nhóm bên trái: icon + logo */}
      <div className="flex items-center space-x-2 pl-8">
        <div className="w-8 h-8 bg-[#242A30] rounded-lg flex items-center justify-center">
          <Grid className="w-5 h-5 text-white" />
        </div>
        <div>
          <img
            src="/assets/logo.png"
            alt="Logo"
            className="w-8 h-8 object-contain bg-center bg-no-repeat"
          />
        </div>
      </div>

      {/* Nhóm bên phải: search + user menu */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search boards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 text-gray-200 hover:text-white focus:outline-none"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-medium text-white">{user?.name}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</header>
      {/* Layout with Sidebar */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <div className="w-64 #242a30 text-white flex-shrink-0 h-screen fixed left-0 top-16 bottom-0">
          <div className="p-4 h-full overflow-y-auto">
            {/* Boards Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 bg-[#162032] border border-gray-500 rounded-md px-3 py-2 mb-2">
                <Grid className="w-4 h-4" />
                <span className="text-sm font-medium">Boards</span>
              </div>
            </div>
            
            {/* All Members Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md cursor-pointer">
                <User className="w-4 h-4" />
                <span className="text-sm">All Members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          {/* Main Content */}
          <main className="p-6">
          {/* YOUR WORKSPACES Section */}
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">YOUR WORKSPACES</h2>
            
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-black-50 border border-black-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Boards Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Existing Boards */}
                {filteredBoards.length > 0 ? (
                  filteredBoards.map(board => (
                    <div
                      key={board.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/board/${board.id}`)}
                    >
                      <h3 className="font-medium text-gray-900 mb-2">{board.name}</h3>
                      {board.description && (
                        <p className="text-sm text-gray-600">{board.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="font-medium text-gray-900 mb-2">My Trello board</h3>
                    <p className="text-sm text-gray-600">Your first workspace</p>
                  </div>
                )}
                
                {/* Create New Board Button */}
                <div
                  onClick={() => setShowCreateModal(true)}
                  className="#213547 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <div className="text-center">
                    <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">Create a new board</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateBoard}
        />
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;