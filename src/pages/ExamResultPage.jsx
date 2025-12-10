import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ExamResult from "./components/ExamResult"
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 

export default function ExamResultPage() {
  const { userExamId } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [appName, setAppName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const fetchedRef = useRef(false);

  useEffect(() => {
    const storedLogoUrl = localStorage.getItem("logoUrl");
    const storedAppName = localStorage.getItem("appName");
    if (storedAppName) {
      setAppName(storedAppName);
      document.title = storedAppName || "Genesis Examination Portal";
    }
    if (storedLogoUrl) {
      setLogoUrl(storedLogoUrl);
    }
  }, []);

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
        localStorage.removeItem("remaining_time");
      } catch (error) {
        console.error("Failed to load exam results", error);
      }

      setLoading(false);
    };
    if (!fetchedRef.current) {
      fetchResult();
      fetchedRef.current = true;
    }
  }, [userExamId]);

  if (loading) return <div className="p-6 text-center">Loading results...</div>;

  return (
    <ExamResult
      logoUrl={logoUrl}
      appName={appName}
      status={result.status}
      userExam={result.exam}
      user={result.user}
      correctCount={result.correctCount}
    />
  );
}
