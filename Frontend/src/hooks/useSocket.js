import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { addBoard, updateBoard, removeBoard } from '../store/boardsSlice';
import { addCard, updateCard, removeCard } from '../store/cardsSlice';
import { addTask, updateTask, removeTask } from '../store/tasksSlice';

const useSocket = () => {
  const socket = useRef(null);
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize socket connection
      socket.current = io('http://localhost:3000', {
        auth: {
          token: token
        }
      });

      // Listen for board events
      socket.current.on('board:created', (board) => {
        dispatch(addBoard(board));
      });

      socket.current.on('board:updated', (board) => {
        dispatch(updateBoard(board));
      });

      socket.current.on('board:deleted', (boardId) => {
        dispatch(removeBoard(boardId));
      });

      // Listen for card events
      socket.current.on('card:created', (card) => {
        dispatch(addCard(card));
      });

      socket.current.on('card:updated', (card) => {
        dispatch(updateCard(card));
      });

      socket.current.on('card:deleted', (cardId) => {
        dispatch(removeCard(cardId));
      });

      // Listen for task events
      socket.current.on('task:created', (task) => {
        dispatch(addTask(task));
      });

      socket.current.on('task:updated', (task) => {
        dispatch(updateTask(task));
      });

      socket.current.on('task:deleted', (taskId) => {
        dispatch(removeTask(taskId));
      });

      socket.current.on('connect', () => {
        console.log('✅ Connected to WebSocket server');
      });

      socket.current.on('disconnect', () => {
        console.log('❌ Disconnected from WebSocket server');
      });

      socket.current.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, token, dispatch]);

  const emit = (event, data) => {
    if (socket.current) {
      socket.current.emit(event, data);
    }
  };

  return { socket: socket.current, emit };
};

export default useSocket;