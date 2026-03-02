import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";

// Import slices
import authSlice from "./slices/authSlice";
import uiSlice from "./slices/uiSlice";
import bookmarkSlice from "./slices/bookmarkSlice";
import unlockSlice from "./slices/unlockSlice";

// Combine all reducers first
const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  bookmarks: bookmarkSlice,
  unlock: unlockSlice,
});

/**
 * Transform: strip accessToken before writing to localStorage.
 * On rehydration the provider will do a silent /auth/refresh
 * to get a fresh accessToken from the httpOnly cookie.
 * This prevents tokens from sitting in localStorage.
 */
const stripTokenTransform = createTransform(
  // inbound: state → storage (strip the token)
  (inboundState: any, key) => {
    if (key === "auth") {
      const { accessToken, ...rest } = inboundState;
      return rest; // don't persist the access token
    }
    return inboundState;
  },
  // outbound: storage → state (nothing special)
  (outboundState: any, key) => {
    return outboundState;
  },
  { whitelist: ["auth"] }
);

// Single persist config for the entire root
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "ui"], // Only persist auth and ui slices
  transforms: [stripTokenTransform],
};

// Create single persisted root reducer
const persistedRootReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
