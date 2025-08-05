import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import servicesReducer from './slices/servicesSlice';
import meetingsReducer from './slices/meetingsSlice';
import consultantsReducer from './slices/businessConsultantSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    meetings: meetingsReducer,
    consultants: consultantsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
