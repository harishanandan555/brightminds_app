import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import parentReducer from './slices/parentSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // Only persist auth slice
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
    reducer: {
        auth: persistedReducer,
        projects: projectReducer,
        parent: parentReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);

export default store;
