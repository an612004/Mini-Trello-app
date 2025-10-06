import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import boardsReducer from './boardsSlice';
import cardsReducer from './cardsSlice';
import tasksReducer from './tasksSlice';
// Cấu hình store với các slice reducer
export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    cards: cardsReducer,
    tasks: tasksReducer,
  },
});
// Xuất store làm mặc định
export default store;