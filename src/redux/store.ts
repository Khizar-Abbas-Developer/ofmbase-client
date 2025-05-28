import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import notificationReducer from "./notifications/notifications";
import {
  persistReducer,
  persistStore,
  PersistConfig,
  Persistor,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import type { Reducer } from "redux";
import type { PersistPartial } from "redux-persist/es/persistReducer";

// Define user state manually if not imported

// 1) Create combined reducer
const rootReducer = combineReducers({
  user: userReducer,
  notifications: notificationReducer,
});

// 2) Create a no-op storage for SSR
function createNoopStorage() {
  return {
    getItem(_key: string): Promise<null> {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string): Promise<string> {
      return Promise.resolve(value);
    },
    removeItem(_key: string): Promise<void> {
      return Promise.resolve();
    },
  };
}

// 3) Choose storage depending on environment
const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

// 4) Define base state and config
type RootReducerState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<RootReducerState> = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["user", "notifications"],
  stateReconciler: autoMergeLevel2, // <-- ADD THIS LINE
};

// 5) Wrap with persistReducer
const persistedReducer: Reducer<RootReducerState & PersistPartial> =
  persistReducer(persistConfig, rootReducer);

// 6) Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 7) Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor: Persistor = persistStore(store);
