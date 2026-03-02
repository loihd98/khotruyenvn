"use client";

import { Provider } from "react-redux";
import { useEffect } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";
import { store, persistor } from "../store";
import { setTokenHandlers } from "../utils/api";
import { clearAuth, refreshToken } from "../store/slices/authSlice";
import { getBookmarks } from "../store/slices/bookmarkSlice";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Set up token handlers for API client
    setTokenHandlers(
      // getAuthToken — reads accessToken from memory (Redux store)
      () => {
        const state = store.getState();
        return state.auth.accessToken;
      },
      // handleTokenRefresh — calls /auth/refresh (cookie sent automatically)
      async () => {
        try {
          const result = await store.dispatch(refreshToken());
          if (refreshToken.fulfilled.match(result)) {
            const state = store.getState();
            return state.auth.accessToken;
          }
          return null;
        } catch (error) {
          return null;
        }
      },
      // handleLogout
      () => {
        store.dispatch(clearAuth());
      }
    );

    // Validate auth on app startup by attempting a silent refresh.
    // After rehydration, we have user info but no accessToken
    // (stripped by the persist transform). The httpOnly cookie
    // is used to get a fresh accessToken.
    const validateAuth = () => {
      const state = store.getState();

      if (state.auth.isAuthenticated || state.auth.user) {
        // Try to refresh the access token
        store
          .dispatch(refreshToken())
          .then((result) => {
            if (refreshToken.fulfilled.match(result)) {
              store.dispatch(getBookmarks());
            } else {
              store.dispatch(clearAuth());
            }
          })
          .catch(() => {
            store.dispatch(clearAuth());
          });
      }
    };

    // Wait for persist gate to rehydrate, then validate
    setTimeout(validateAuth, 500);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
        persistor={persistor}
      >
        <LanguageProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
                borderRadius: "8px",
                fontSize: "14px",
                maxWidth: "400px",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#4aed88",
                  secondary: "#fff",
                },
                style: {
                  background: "#10b981",
                  color: "#fff",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
                style: {
                  background: "#ef4444",
                  color: "#fff",
                },
              },
            }}
          />
        </LanguageProvider>
      </PersistGate>
    </Provider>
  );
}
