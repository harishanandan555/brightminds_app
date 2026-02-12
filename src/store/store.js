import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import parentReducer from './slices/parentSlice';
import betaReducer from './slices/betaSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['token', 'user', 'isAuthenticated', 'role'], // Persist essential auth data
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
    reducer: {
        auth: persistedReducer,
        projects: projectReducer,
        parent: parentReducer,
        beta: betaReducer,
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
