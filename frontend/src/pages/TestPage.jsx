import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getNextQuestion, submitAnswer, getSession } from "../api";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import AbilityBar from "../components/AbilityBar";
import CircularProgress from "../components/CircularProgress";
import LoadingSpinner from "../components/LoadingSpinner";
import { Check, X, ArrowRight } from "lucide-react";

const TestPage = ({ user, onComplete }) => {
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  const navigate = useNavigate();

  const fetchState = async () => {
    try {
      setFetching(true);
      const sessionData = await getSession(user.sessionId);
      setSession(sessionData);

      if (sessionData.test_complete) {
        setTestComplete(true);
      } else {
        const qData = await getNextQuestion(user.sessionId);
        setQuestion(qData);
        setSelected(null);
        setResult(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching test state");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.sessionId]);

  const handleSubmit = async () => {
    if (!selected || !question) return;

    try {
      setSubmitting(true);
      const data = await submitAnswer(user.sessionId, question.id, selected);
      setResult(data);

      setSession((prev) => ({
        ...prev,
        ability_score: data.ability_score,
        proficiency_level: data.proficiency_level,
        questions_answered: data.questions_answered,
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (result?.test_complete) {
      setTestComplete(true);
    } else {
      fetchState();
    }
  };

  const handleGoToResults = () => {
    onComplete();
    navigate("/results");
  };

  if (fetching && !question) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getDifficultyUI = (diff) => {
    if (diff <= 0.35) return { color: "bg-success", label: "Easy" };
    if (diff <= 0.65) return { color: "bg-warning", label: "Medium" };
    return { color: "bg-error", label: "Hard" };
  };

  const getProficiencyColor = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "red";
      case "master":
      case "advanced":
        return "green";
      default:
        return "yellow";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col relative w-full h-full"
    >
      <AnimatePresence>
        {testComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md rounded-3xl"
          >
            <div className="text-center space-y-6 p-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Test Complete!
              </h2>
              <p className="text-xl text-textSecondary">
                Your final ability score is
              </p>
              <div className="text-5xl font-mono text-primary-500 my-4 font-bold">
                {session?.ability_score > 0 ? "+" : ""}
                {session?.ability_score?.toFixed(3)}
              </div>
              <Button
                className="mt-8 py-4 px-8 text-lg"
                onClick={handleGoToResults}
              >
                View Your Results <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        <div className="w-full lg:w-[30%] space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{user.name}</h2>
                <div className="flex items-center text-sm text-warning mt-1">
                  <span className="w-2 h-2 rounded-full bg-warning mr-2 animate-pulse"></span>
                  In Progress
                </div>
              </div>
            </div>

            <div className="space-y-6 border-t border-border pt-6">
              <div>
                <p className="text-sm text-textSecondary mb-2">
                  Ability Score (IRT)
                </p>
                <div
                  className={`text-3xl font-mono font-bold tracking-tight mb-2 ${
                    (session?.ability_score || 0) > 0
                      ? "text-success"
                      : (session?.ability_score || 0) < 0
                        ? "text-error"
                        : "text-textPrimary"
                  }`}
                >
                  {(session?.ability_score || 0) > 0 ? "+" : ""}
                  {(session?.ability_score || 0).toFixed(3)}
                </div>
                <AbilityBar score={session?.ability_score || 0} />
              </div>

              <div>
                <p className="text-sm text-textSecondary mb-2">
                  Proficiency Level
                </p>
                <Badge
                  variant={getProficiencyColor(session?.proficiency_level)}
                  className="text-sm px-3 py-1"
                >
                  {session?.proficiency_level || "Unknown"}
                </Badge>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-6">
                <div>
                  <p className="text-lg font-bold text-white">Question</p>
                  <p className="text-sm text-textSecondary">
                    {session?.questions_answered || 0} of 10
                  </p>
                </div>
                <CircularProgress
                  value={session?.questions_answered || 0}
                  max={10}
                  size={60}
                  strokeWidth={6}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="w-full lg:w-[70%]">
          {question && !testComplete && (
            <AnimatePresence mode="wait">
              <motion.div
                key={question.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card glow className="overflow-hidden flex flex-col">
                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          result.correct
                            ? "bg-success/20 border-b border-success/30"
                            : "bg-error/20 border-b border-error/30"
                        }`}
                      >
                        <div
                          className={`flex items-start md:items-center font-medium ${result.correct ? "text-success" : "text-error"}`}
                        >
                          {result.correct ? (
                            <Check className="w-6 h-6 mr-2 shrink-0" />
                          ) : (
                            <X className="w-6 h-6 mr-2 shrink-0" />
                          )}
                          <span>
                            {result.correct
                              ? `Correct! Ability: ${result.ability_score > 0 ? "+" : ""}${result.ability_score.toFixed(3)} · ${result.proficiency_level}`
                              : `Incorrect. The correct answer was: ${result.correct_answer}`}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleNext}
                          className="shrink-0 w-full md:w-auto"
                        >
                          {result.test_complete
                            ? "Finish Test"
                            : "Next Question"}{" "}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <Badge variant="indigo" className="px-3 py-1.5 text-sm">
                        {question.topic}
                      </Badge>
                      <div className="flex items-center text-sm text-textSecondary bg-surface px-3 py-1.5 rounded-full border border-border">
                        <span
                          className={`w-2.5 h-2.5 rounded-full mr-2 ${getDifficultyUI(question.difficulty).color}`}
                        />
                        {getDifficultyUI(question.difficulty).label}
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-8">
                      {question.question}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((opt, idx) => {
                        const isSelected = selected === opt;
                        const isCorrectAnswer = result?.correct_answer === opt;

                        let optStyle =
                          "bg-surface border-border hover:border-primary-500 text-textPrimary cursor-pointer hover:bg-surface/80";
                        let icon = null;

                        if (result) {
                          optStyle =
                            "bg-surface border-border opacity-40 cursor-default";
                          if (isCorrectAnswer) {
                            optStyle =
                              "bg-success/20 border-success text-green-300 font-medium opacity-100 shadow-[0_0_15px_rgba(34,197,94,0.15)]";
                            icon = (
                              <Check className="w-5 h-5 text-success mr-2 shrink-0" />
                            );
                          } else if (isSelected && !result.correct) {
                            optStyle =
                              "bg-error/20 border-error text-red-300 opacity-100 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
                            icon = (
                              <X className="w-5 h-5 text-error mr-2 shrink-0" />
                            );
                          }
                        } else if (isSelected) {
                          optStyle =
                            "bg-primary-500/10 border-primary-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]";
                        }

                        return (
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={idx}
                            disabled={!!result}
                            onClick={() => setSelected(opt)}
                            className={`p-4 md:p-5 text-left border rounded-xl transition-all duration-200 flex items-center ${optStyle}`}
                          >
                            {icon}
                            <span>{opt}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {!result && (
                      <div className="mt-8 flex justify-end">
                        <Button
                          onClick={handleSubmit}
                          disabled={!selected || submitting}
                          loading={submitting}
                          className="px-8 w-full md:w-auto"
                        >
                          Submit Answer
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TestPage;
