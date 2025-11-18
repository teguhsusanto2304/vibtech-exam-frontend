import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ExamResult from "./components/ExamResult"
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 

export default function ExamResultPage() {
  const { userExamId } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      const token = localStorage.getItem("authToken");

      try {
        const res = await axios.get(
          `${API_BASE_URL}/exam/${userExamId}/result`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setResult(res.data);
      } catch (error) {
        console.error("Failed to load exam results", error);
      }

      setLoading(false);
    };

    fetchResult();
  }, [userExamId]);

  if (loading) return <div className="p-6 text-center">Loading results...</div>;

  return (
    <ExamResult
      status={result.status}
      userExam={result.exam}
      correctCount={result.correctCount}
    />
  );
}
