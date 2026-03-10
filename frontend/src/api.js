import axios from "axios";

// Backend API runs on http://127.0.0.1:8000
// Note: CORS stands for Cross-Origin Resource Sharing. Backend already has CORS enabled for localhost:5173
const API_BASE_URL = "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const startSession = async (studentName) => {
  const response = await apiClient.post("/session/start", {
    student_name: studentName,
  });
  return response.data;
};

export const getSession = async (sessionId) => {
  const response = await apiClient.get(`/session/${sessionId}`);
  return response.data;
};

export const getNextQuestion = async (sessionId) => {
  const response = await apiClient.get(
    `/test/next-question?session_id=${sessionId}`,
  );
  return response.data;
};

export const submitAnswer = async (sessionId, questionId, selectedAnswer) => {
  const response = await apiClient.post("/test/submit-answer", {
    session_id: sessionId,
    question_id: questionId,
    selected_answer: selectedAnswer,
  });
  return response.data;
};

export const getResult = async (sessionId) => {
  const response = await apiClient.get(`/test/result?session_id=${sessionId}`);
  return response.data;
};

export const getStudyPlan = async (sessionId) => {
  const response = await apiClient.get(
    `/test/study-plan?session_id=${sessionId}`,
  );
  return response.data;
};
