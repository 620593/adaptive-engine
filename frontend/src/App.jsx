import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import TestPage from "./pages/TestPage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check localStorage on mount
    const savedName = localStorage.getItem("gre_user_name");
    const savedSessionId = localStorage.getItem("gre_session_id");
    const isComplete = localStorage.getItem("gre_session_complete") === "true";

    if (savedName && savedSessionId) {
      setUser({
        name: savedName,
        sessionId: savedSessionId,
        isComplete: isComplete,
      });
    }
  }, []);

  const handleLogin = (name, sessionId) => {
    localStorage.setItem("gre_user_name", name);
    localStorage.setItem("gre_session_id", sessionId);
    localStorage.setItem("gre_session_complete", "false");
    setUser({ name, sessionId, isComplete: false });
  };

  const handleComplete = () => {
    localStorage.setItem("gre_session_complete", "true");
    setUser((prev) => ({ ...prev, isComplete: true }));
  };

  const handleReset = () => {
    localStorage.removeItem("gre_user_name");
    localStorage.removeItem("gre_session_id");
    localStorage.removeItem("gre_session_complete");
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-textPrimary selection:bg-primary-500/30 font-sans flex flex-col pt-16">
        <Navbar user={user} onReset={handleReset} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col relative z-10">
          <Routes>
            <Route
              path="/"
              element={
                <LandingPage
                  user={user}
                  onLogin={handleLogin}
                  onReset={handleReset}
                />
              }
            />
            <Route
              path="/test"
              element={
                user ? (
                  user.isComplete ? (
                    <Navigate to="/results" replace />
                  ) : (
                    <TestPage user={user} onComplete={handleComplete} />
                  )
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/results"
              element={
                user && user.sessionId ? (
                  <ResultsPage user={user} onReset={handleReset} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </main>

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#1e1e2e",
              color: "#f1f5f9",
              border: "1px solid #334155",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#1e1e2e",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#1e1e2e",
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
