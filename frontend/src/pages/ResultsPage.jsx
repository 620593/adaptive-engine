import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getResult, getStudyPlan } from "../api";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import AbilityBar from "../components/AbilityBar";
import TopicChart from "../components/TopicChart";
import StudyPlanTimeline from "../components/StudyPlanTimeline";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  RefreshCw,
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
} from "lucide-react";

const ResultsPage = ({ user, onReset }) => {
  const [resultData, setResultData] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loadingResult, setLoadingResult] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoadingResult(true);
        const data = await getResult(user.sessionId);
        setResultData(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load results");
      } finally {
        setLoadingResult(false);
      }
    };

    fetchResults();
  }, [user.sessionId]);

  const handleGeneratePlan = async () => {
    try {
      setLoadingPlan(true);
      const data = await getStudyPlan(user.sessionId);
      setStudyPlan(data);
      toast.success("Study plan generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate study plan");
    } finally {
      setLoadingPlan(false);
    }
  };

  if (loadingResult) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-textSecondary animate-pulse">
          Analyzing your performance...
        </p>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-4">Could not load results.</p>
          <Button onClick={onReset}>Return Home</Button>
        </div>
      </div>
    );
  }

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

  const totalQuestions = resultData.total_questions || 10;

  const averageAccuracy =
    Object.values(resultData.topic_stats || {}).reduce(
      (a, b) => a + (b.accuracy || 0) * 100,
      0,
    ) / (Object.keys(resultData.topic_stats || {}).length || 1);
  const estimatedCorrect = Math.round((averageAccuracy / 100) * totalQuestions);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      <motion.div
        variants={itemVariants}
        className="text-center space-y-2 mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Test Complete 🎯
        </h1>
        <p className="text-lg text-textSecondary">
          {user.name} •{" "}
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card
            glow
            className="p-8 h-full flex flex-col justify-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-indigo-400"></div>
            <h2 className="text-textSecondary text-lg font-medium mb-6">
              Final Ability Score
            </h2>

            <div
              className={`text-6xl md:text-7xl font-mono font-bold tracking-tighter mb-4 drop-shadow-xl ${
                resultData.final_ability > 0
                  ? "text-success"
                  : resultData.final_ability < 0
                    ? "text-error"
                    : "text-white"
              }`}
            >
              {resultData.final_ability > 0 ? "+" : ""}
              {resultData.final_ability?.toFixed(3)}
            </div>

            <div className="mb-8">
              <Badge
                variant={getProficiencyColor(resultData.proficiency_level)}
                className="text-base px-4 py-1.5 shadow-lg"
              >
                {resultData.proficiency_level}
              </Badge>
            </div>

            <div className="mt-auto">
              <AbilityBar score={resultData.final_ability} />
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 grid grid-cols-2 gap-4"
        >
          <Card className="p-6 flex flex-col justify-center">
            <div className="flex items-center text-textSecondary mb-2">
              <Target className="w-5 h-5 mr-2" />
              <span className="font-medium">Total Questions</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono">
              {totalQuestions}
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-center">
            <div className="flex items-center text-textSecondary mb-2">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span className="font-medium">Correct Answers</span>
            </div>
            <div className="text-3xl font-bold text-success font-mono">
              ~{estimatedCorrect}
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-center">
            <div className="flex items-center text-textSecondary mb-2">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="font-medium">Accuracy</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono">
              {averageAccuracy.toFixed(0)}%
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-center">
            <div className="flex items-center text-textSecondary mb-2">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-medium">Time Taken</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono">--:--</div>
          </Card>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">
            Performance by Topic
          </h3>
          <TopicChart data={resultData.topic_stats} />
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">Topic Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(resultData.topic_stats || {}).map(
              ([topic, stats]) => {
                const accuracy = Math.round((stats.accuracy || 0) * 100);
                return (
                  <div key={topic} className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-textPrimary font-medium">
                        {topic}
                      </span>
                      <Badge variant={accuracy >= 50 ? "green" : "red"}>
                        {accuracy}%
                      </Badge>
                    </div>
                    <div className="w-full bg-border rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${accuracy >= 50 ? "bg-success" : "bg-error"}`}
                        style={{ width: `${accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6">
            <div>
              <p className="text-sm font-medium text-textSecondary mb-3">
                Strong Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {resultData.strong_topics?.length > 0 ? (
                  resultData.strong_topics.map((t, i) => (
                    <Badge key={i} variant="green">
                      {t}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-textMuted">
                    None identified
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-textSecondary mb-3">
                Weak Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {resultData.weak_topics?.length > 0 ? (
                  resultData.weak_topics.map((t, i) => (
                    <Badge key={i} variant="red">
                      {t}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-textMuted">
                    None identified
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-8 border-primary-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Sparkles className="w-6 h-6 text-primary-500 mr-3" />
                Your Personalised Study Plan
              </h3>
              <p className="text-textSecondary mt-2">
                Generated by Groq LLM based on your performance data.
              </p>
            </div>

            {!studyPlan && (
              <Button
                onClick={handleGeneratePlan}
                loading={loadingPlan}
                className="whitespace-nowrap shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                {loadingPlan ? "Thinking with Groq LLM..." : "Generate Plan ✨"}
              </Button>
            )}
          </div>

          {loadingPlan && !studyPlan && (
            <div className="w-full h-32 flex items-center justify-center animate-pulse bg-surface/50 rounded-xl border border-border">
              <div className="flex items-center space-x-3 text-primary-500">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span className="font-medium">
                  Analyzing patterns and crafting your strategy...
                </span>
              </div>
            </div>
          )}

          {studyPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {studyPlan.motivational_note && (
                <div className="p-6 bg-primary-500/10 border-l-4 border-primary-500 rounded-r-xl italic text-lg text-primary-100 leading-relaxed shadow-inner">
                  "{studyPlan.motivational_note}"
                </div>
              )}

              <StudyPlanTimeline plan={studyPlan.study_plan} />
            </motion.div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-center pt-8">
        <Button variant="outline" onClick={onReset} className="px-8 py-4">
          <RefreshCw className="w-5 h-5 mr-2" /> Take Another Test
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ResultsPage;
