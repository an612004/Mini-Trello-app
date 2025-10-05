import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cards: [],
  loading: false,
  error: null,
};

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setCardsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCardsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCards: (state, action) => {
      state.cards = action.payload;
      state.loading = false;
      state.error = null;
    },
    addCard: (state, action) => {
      state.cards.push(action.payload);
    },
    updateCard: (state, action) => {
      const index = state.cards.findIndex(card => card.id === action.payload.id);
      if (index !== -1) {
        state.cards[index] = action.payload;
      }
    },
    removeCard: (state, action) => {
      state.cards = state.cards.filter(card => card.id !== action.payload);
    },
    clearCardsError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCardsLoading,
  setCardsError,
  setCards,
  addCard,
  updateCard,
  removeCard,
  clearCardsError,
} = cardsSlice.actions;

export default cardsSlice.reducer;