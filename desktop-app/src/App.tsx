import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { convex } from "./lib/convex";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Chat } from "./pages/Chat";
import { System } from "./pages/System";
import { Downloads } from "./pages/Downloads";
import { HashRouter, Routes, Route, Navigate } from "react-router";
import "./App.css";

function App() {
  return (
    <ConvexAuthProvider client={convex}>
      <AuthLoading>
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
          Loading...
        </div>
      </AuthLoading>
      <Unauthenticated>
        <Login />
      </Unauthenticated>
      <Authenticated>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/system" element={<System />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </Authenticated>
    </ConvexAuthProvider>
  );
}

export default App;
