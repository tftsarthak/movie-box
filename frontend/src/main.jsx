import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster, toast } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { authKeys } from "@/hooks/queries/auth";

// Central 401 session-expired handler from axios interceptor
window.addEventListener("moviebox:session-expired", () => {
  const prevUser = queryClient.getQueryData(authKeys.user());
  if (prevUser) {
    toast.error("Your session has expired. Please log in again.", {
      id: "session-expired",
    });
  }
  queryClient.setQueryData(authKeys.user(), null);
  queryClient.removeQueries({ queryKey: ["account"] });
});

const ReactQueryDevtools = import.meta.env.DEV
  ? await import("@tanstack/react-query-devtools").then(
      (m) => m.ReactQueryDevtools
    )
  : () => null;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-right"
          toastOptions={{
            className: "border border-border bg-card text-foreground text-sm shadow-md",
            duration: 3500,
          }}
        />
        <App />
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
