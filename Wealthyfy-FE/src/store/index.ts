// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import sliceReducers from "@/store/slices"

// Redux Persist Action Keys to ignore for serializable state checks
const PERSIST_ACTIONS = ["persist/PERSIST", "persist/REHYDRATE"];

// Persist configuration for the root reducer
const rootPersistConfig = {
  key: "root",
  storage,
  whitelist: ["accountSetup"], // Only persist specific reducers
};

// Combine all reducers here
const rootReducer = combineReducers(sliceReducers);

// Apply persistence to the root reducer
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// Create Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: PERSIST_ACTIONS,
      },
    }),
});

// Persistor Instance
export const persistor = persistStore(store);

// Types for global usage
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
