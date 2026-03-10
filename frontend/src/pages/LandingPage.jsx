import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { startSession } from "../api";
import Button from "../components/Button";
import Card from "../components/Card";

const LandingPage = ({ user, onLogin, onReset }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStart = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const data = await startSession(name);
      onLogin(data.student_name, data.session_id);
      navigate("/test");
    } catch (error) {
      console.error(error);
      toast.error("Failed to start session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResume = () => {
    navigate(user.isComplete ? "/results" : "/test");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none hero-pattern opacity-50 z-0"></div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center text-center space-y-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="bg-primary-500/10 text-primary-500 border border-primary-500/20 px-4 py-1.5 rounded-full text-sm font-medium"
        >
          ✦ AI-Powered · IRT Algorithm · Groq LLM
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-2">
          Know Exactly Where <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-400">
            You Stand
          </span>
        </h1>

        <p className="text-xl text-textSecondary max-w-2xl px-4 mt-2">
          An adaptive GRE diagnostic that adjusts to your ability in real time
          and generates a personalized AI study plan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="text-lg font-bold text-white mb-2">IRT Algorithm</h3>
            <p className="text-sm text-textSecondary">
              Rasch model updates your ability after every answer
            </p>
          </Card>
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Adaptive Questions
            </h3>
            <p className="text-sm text-textSecondary">
              Difficulty self-adjusts based on your performance
            </p>
          </Card>
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="text-lg font-bold text-white mb-2">AI Study Plan</h3>
            <p className="text-sm text-textSecondary">
              Groq LLM generates a 3-step personalized plan
            </p>
          </Card>
        </div>

        <div className="w-full max-w-md mt-12 bg-surface/50 p-8 rounded-3xl border border-border backdrop-blur-sm shadow-xl">
          {user ? (
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-white">
                Welcome back, {user.name}!
              </h3>
              <p className="text-textSecondary text-sm">
                You have an {user.isComplete ? "completed" : "incomplete"} test
                session.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="w-full py-4 text-lg font-semibold"
                  onClick={handleResume}
                >
                  {user.isComplete ? "View Results" : "Resume Test"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-4 text-lg font-semibold"
                  onClick={onReset}
                >
                  Start Fresh
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleStart}
              className="flex flex-col space-y-6 w-full"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name to begin"
                className="w-full bg-[#111118] border border-[#1e1e2e] focus:border-primary-500 rounded-xl px-5 py-4 text-lg text-white placeholder-textMuted outline-none transition-colors shadow-inner"
                required
              />
              <Button
                type="submit"
                loading={loading}
                className="w-full py-4 text-lg font-semibold shadow-primary-500/25"
              >
                Start Diagnostic →
              </Button>
            </form>
          )}
        </div>
      </div>

      <footer className="absolute bottom-4 text-textMuted text-sm text-center">
        Built with FastAPI · MongoDB Atlas · IRT · Groq LLM
      </footer>
    </motion.div>
  );
};

export default LandingPage;
