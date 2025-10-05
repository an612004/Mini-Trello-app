import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ArrowLeft, Plus, ArrowLeftRight, Users, Settings, Star, MoreHorizontal } from 'lucide-react'; // dùng 1 số icon  của lucide-react
import { boardsAPI, cardsAPI } from '../services/api';
import { setCurrentBoard } from '../store/boardsSlice';
import { setCards, removeCard, updateCard } from '../store/cardsSlice';
import Column from '../components/Column';
import TaskCard from '../components/TaskCard';
import CreateCardModal from '../components/CreateCardModal';
import CreateListModal from '../components/CreateListModal';
import InviteMembersModal from '../components/InviteMembersModal';
import BoardSettingsModal from '../components/BoardSettingsModal';
import MembersList from '../components/MembersList';
import useSocket from '../hooks/useSocket';

const Board = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log('🏠 Board component rendering, boardId:', boardId);

  const { currentBoard } = useSelector(state => state.boards);
  const { cards } = useSelector(state => state.cards);

  const [activeCard, setActiveCard] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedColumnId, setSelectedColumnId] = useState('Todo');
  const [loading, setLoading] = useState(true);

  // Initialize socket
  useSocket();

  // Columns state - dynamic columns
  const [columns, setColumns] = useState([
    { id: 'Todo', title: 'Todo', color: '#6B7280' },
    { id: 'Doing', title: 'Doing', color: '#3B82F6' },
    { id: 'done', title: 'Done', color: '#10B981' },
  ]);

  // Mock board members data
  const [boardMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: null },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', avatar: null },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', avatar: null },
  ]);



  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (boardId) {
      fetchBoardData();
      fetchCards();
    }
  }, [boardId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBoardData = async () => {
    try {
      const response = await boardsAPI.getById(boardId);
      dispatch(setCurrentBoard(response.data));
    } catch (error) {
      console.error('Failed to fetch board:', error);
      if (error.response?.status === 404 || error.response?.status === 403) {
        navigate('/dashboard');
      }
    }
  };

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await cardsAPI.getAll(boardId);
      const cardsData = response.data || [];
      
      console.log('📥 Fetched cards from API:', cardsData);
      
      // Ensure all cards have a status (default to 'Todo' if missing)
      const cardsWithStatus = cardsData.map(card => {
        console.log(`📋 Card "${card.name}" has status:`, card.status || 'Todo (default)');
        return {
          ...card,
          status: card.status || 'Todo'
        };
      });
      
      console.log('📊 Final cards with status:', cardsWithStatus);
      dispatch(setCards(cardsWithStatus));
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    } finally {
      setLoading(false);
    }
  };  const handleCreateCard = async (cardData) => {
    try {
      const requestData = {
        name: cardData.title || cardData.name,
        description: cardData.description,
        status: selectedColumnId || cardData.status,
        priority: cardData.priority,
        dueDate: cardData.dueDate,
        assignees: cardData.assignees
      };

      const response = await cardsAPI.create(boardId, requestData);
      const newCard = response.data;

      dispatch(setCards([...cards, newCard]));
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create card:', error);
      alert('Failed to create card: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleInviteMember = async (email) => {
    try {
      await boardsAPI.invite(boardId, { email_member: email });
      setShowInviteModal(false);
      // Refresh the board data to show new members
      await fetchBoardData();
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error; // Let the modal handle the error display
    }
  };

  const handleBoardUpdated = (updatedBoard) => {
    dispatch(setCurrentBoard(updatedBoard));
  };

  const handleBoardDeleted = () => {
    // Navigate back to dashboard when board is deleted or user leaves
    navigate('/dashboard');
  };

  const handleRemoveMemberFromSidebar = async (memberId) => {
    try {
      await boardsAPI.removeMember(boardId, memberId);
      // Refresh board data to update members list
      await fetchBoardData();
    } catch (error) {
      console.error('Remove member error:', error);
      throw error;
    }
  };

  const handleCreateList = async (listData) => {
    try {
      const newColumnId = listData.title.replace(/\s+/g, '').toLowerCase();
      const newColumn = {
        id: newColumnId,
        title: listData.title,
        color: listData.color
      };

      setColumns(prev => [...prev, newColumn]);
      setShowCreateListModal(false);
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const handleAddCard = (columnId) => {
    setSelectedColumnId(columnId);
    setShowCreateModal(true);
  };

  const handleDeleteCard = async (cardId) => {
    try {
      console.log('🔄 HandleDeleteCard called:', { boardId, cardId });
      
      // Call API to delete card from backend
      await cardsAPI.delete(boardId, cardId);
      
      console.log('✅ API delete successful, updating Redux...');
      // Remove card from Redux store
      dispatch(removeCard(cardId));
    } catch (error) {
      console.error('❌ Failed to delete card:', error);
      throw error; // Re-throw to let UI components handle the error display
    }
  };

  const handleUpdateCard = async (updatedCard) => {
    try {
      const response = await cardsAPI.update(boardId, updatedCard.id, {
        title: updatedCard.title,
        description: updatedCard.description,
        priority: updatedCard.priority,
        dueDate: updatedCard.dueDate,
        assignees: updatedCard.assignees
      });

      dispatch(updateCard({ ...updatedCard, ...response.data }));
    } catch (error) {
      console.error('Failed to update card:', error);
      alert('Failed to update card: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteList = (columnId) => {
    const updatedColumns = columns.filter(col => col.id !== columnId);
    setColumns(updatedColumns);

    const updatedCards = cards.filter(card => card.status !== columnId);
    dispatch(setCards(updatedCards));
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const card = cards.find(c => c.id === active.id);
    setActiveCard(card);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    const activeCard = cards.find(c => c.id === active.id);
    if (!activeCard) return;

    // Determine the target column
    let targetColumnId = over.id;
    
    // If dropped over a card, get the column that card belongs to
    if (cards.find(c => c.id === over.id)) {
      const targetCard = cards.find(c => c.id === over.id);
      targetColumnId = targetCard?.status || targetCard?.status;
    }

    // Check if it's a valid column
    const validColumn = columns.find(col => col.id === targetColumnId);
    if (!validColumn) return;

    const oldStatus = activeCard.status;
    
    if (oldStatus !== targetColumnId) {
      console.log(`🔄 Moving card "${activeCard.name}" from ${oldStatus} to ${targetColumnId}`);
      
      // Add visual feedback
      const cardElement = document.querySelector(`[data-card-id="${activeCard.id}"]`);
      if (cardElement) {
        cardElement.style.transition = 'transform 0.3s ease-in-out';
      }
      
      // Optimistically update UI first
      const updatedCards = cards.map(card =>
        card.id === activeCard.id
          ? { ...card, status: targetColumnId }
          : card
      );
      dispatch(setCards(updatedCards));

      // Update on server
      try {
        await cardsAPI.update(boardId, activeCard.id, {
          status: targetColumnId
        });
        console.log('✅ Card status updated successfully');
      } catch (error) {
        console.error('❌ Failed to update card status:', error);
        
        // Revert optimistic update on error
        const revertedCards = cards.map(card =>
          card.id === activeCard.id
            ? { ...card, status: oldStatus }
            : card
        );
        dispatch(setCards(revertedCards));
        
        alert('Không thể di chuyển card. Vui lòng thử lại.');
      }
    }
  };

  const getCardsForColumn = (columnId) => {
    const columnCards = cards.filter(card => card.status === columnId);
    console.log(`📋 Column ${columnId} cards:`, columnCards);
    return columnCards;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  // Safety check
  console.log('🔍 Current board:', currentBoard);
  console.log('🃏 Cards:', cards);
  console.log('🎭 Show Create Modal:', showCreateModal);
  console.log('🎭 Show Invite Modal:', showInviteModal);

  try {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Header */}
        <header className="w-full bg-[#242A30] text-white shadow-sm border-b border-gray-700 fixed top-0 left-0 z-50 h-16">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center space-x-3">
              <div>
                <img src="/assets/logo.png" alt="Logo" className="w-8 h-8" />
              </div>
            </div>
            <div className='relative'>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex pt-16" style={{ backgroundColor: '#f3f4f6' }}>
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-64 flex-shrink-0 bg-white shadow-sm">
              <MembersList
                members={currentBoard?.memberDetails || currentBoard?.members || []}
                boardName={currentBoard?.name || 'My Trello board'}
                onInviteClick={() => setShowInviteModal(true)}
                isOwner={JSON.parse(localStorage.getItem('user') || '{}').id === currentBoard?.ownerId}
                onClose={() => setShowSidebar(false)}
                onRemoveMember={handleRemoveMemberFromSidebar}
                currentUserId={JSON.parse(localStorage.getItem('user') || '{}').id}
                ownerId={currentBoard?.ownerId}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Board Header */}
            <header className="bg-[#743254] shadow-sm border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>

                  <div className="flex items-center space-x-3">
                    {/* <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: currentBoard?.color || '#3B82F6' }}
                    >
                      <span className="text-white font-medium text-sm">
                        {currentBoard?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div> */}
                    <div>
                      <h1 className="text-xl font-bold text-white-900">
                        {currentBoard?.name || 'Board'}
                      </h1>
                      {currentBoard?.description && (
                        <p className="text-sm text-white-600">{currentBoard.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Cài đặt Board"
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Toggle Sidebar"
                  >
                    <ArrowLeftRight className="w-5 h-5 text-white" />
                  </button>
                  
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Users className="w-4 h-4" />
                    <span>Invite member</span>
                  </button>
                  
                  <button
                    onClick={() => setShowCreateListModal(true)}
                    className="bg-[#A16081] text-white px-4 py-2 rounded-lg hover:bg-[#A16081]/80 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add List</span>
                  </button>
                </div>
              </div>
            </header>

          {/* Board Content */}
          <main className="p-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex space-x-6 overflow-x-auto pb-6">
                {columns.map(column => (
                  <Column
                    key={column.id}
                    column={column}
                    cards={getCardsForColumn(column.id)}
                    boardId={boardId}
                    boardMembers={boardMembers}
                    onAddCard={handleAddCard}
                    onDeleteCard={handleDeleteCard}
                    onUpdateCard={handleUpdateCard}
                    onDeleteList={handleDeleteList}
                  />
                ))}
              </div>

              <DragOverlay>
                {activeCard ? (
                  <div className="rotate-2 scale-105 shadow-2xl">
                    <TaskCard card={activeCard} isDragging />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </main>

          {/* Create Card Modal */}
          {showCreateModal && (
            <CreateCardModal
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateCard}
              columns={columns}
            />
          )}

          {/* Create List Modal */}
          {showCreateListModal && (
            <CreateListModal
              onClose={() => setShowCreateListModal(false)}
              onSubmit={handleCreateList}
            />
          )}

          {/* Invite Members Modal */}
          {showInviteModal && (
            <InviteMembersModal
              onClose={() => setShowInviteModal(false)}
              onSubmit={handleInviteMember}
            />
          )}

          {/* Board Settings Modal */}
          {showSettingsModal && (
            <BoardSettingsModal
              board={currentBoard}
              isOpen={showSettingsModal}
              onClose={() => setShowSettingsModal(false)}
              onBoardUpdated={handleBoardUpdated}
              onBoardDeleted={handleBoardDeleted}
            />
          )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Board render error:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Board Error</h1>
          <p className="text-red-500 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default Board;