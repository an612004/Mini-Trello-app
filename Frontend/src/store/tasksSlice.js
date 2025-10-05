import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasksLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTasksError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    clearTasksError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setTasksLoading,
  setTasksError,
  setTasks,
  addTask,
  updateTask,
  removeTask,
  clearTasksError,
} = tasksSlice.actions;

export default tasksSlice.reducer;