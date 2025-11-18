import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ExamPage from "./pages/ExamPage";
import ExamQuestionsPage from "./pages/ExamQuestionsPage";
import ExamResultPage from "./pages/ExamResultPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/exam/:examId/questions" element={<ExamQuestionsPage />} />
        <Route path="/exam/:userExamId/results" element={<ExamResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;

