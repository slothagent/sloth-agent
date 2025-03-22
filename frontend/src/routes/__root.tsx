import { Outlet, createRootRoute } from "@tanstack/react-router";
import React from "react";
import { Providers } from "../components/Layout/Providers";
import Header from "../components/Layout/Header";
import { Toaster } from "react-hot-toast";


export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
});

export const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-6">The page you are looking for does not exist.</p>
      <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Go Home
      </a>
    </div>
  );
}

function RootComponent() {
  return (
    <>
      <Providers>
        <Header />
        <Outlet />
        <TanStackRouterDevtools position="bottom-right" />
        <Toaster toastOptions={{
          success: {
            style: {
              backgroundColor: "#1f2937",
              color: "#22c55e",
            },
            iconTheme: {
              primary: "#22c55e",
              secondary: "#1f2937"
            }
          },
          error: {
            style: {
              backgroundColor: "#1f2937",
              color: "#ef4444",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#1f2937"
            }
          },
          loading: {
            style: {
              backgroundColor: "#1f2937",
              color: "#f59e0b",
            },
            iconTheme: {
              primary: "#f59e0b",
              secondary: "#1f2937"
            }
          }
        }} position="top-center" />
      </Providers>
    </>
  );
}