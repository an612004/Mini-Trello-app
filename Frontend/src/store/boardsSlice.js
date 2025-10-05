import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoardsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBoardsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setBoards: (state, action) => {
      state.boards = action.payload;
      state.loading = false;
      state.error = null;
    },
    addBoard: (state, action) => {
      state.boards.push(action.payload);
    },
    updateBoard: (state, action) => {
      const index = state.boards.findIndex(board => board.id === action.payload.id);
      if (index !== -1) {
        state.boards[index] = action.payload;
      }
    },
    removeBoard: (state, action) => {
      state.boards = state.boards.filter(board => board.id !== action.payload);
    },
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
    clearBoardsError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setBoardsLoading,
  setBoardsError,
  setBoards,
  addBoard,
  updateBoard,
  removeBoard,
  setCurrentBoard,
  clearBoardsError,
} = boardsSlice.actions;

export default boardsSlice.reducer;