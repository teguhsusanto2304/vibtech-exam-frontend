import { useEffect, useState,useRef  } from "react";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";

export default function ExamPage() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const MAX_WARNINGS = 3;
  const navigate = useNavigate();
  const [allowNavigation, setAllowNavigation] = useState(false);
  const { examId } = useParams();
  const fetchedRef = useRef(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 


  const reportCheat = async (eventType) => {
  try {
    const token = localStorage.getItem("authToken");

    await axios.post(
      `${API_BASE_URL}/exam/${examId}/cheat`,
      { event: eventType },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.warn("⚠ Cheat attempt submitted:", eventType);
  } catch (error) {
    console.error("Failed to report cheat.", error);
  }
};

useEffect(() => {
  // Leaving fullscreen
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      reportCheat("Exited Fullscreen Mode");
    }
  });

  // Switching Tabs
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      reportCheat("Switched Tab / Minimized Window");
    }
  });

  // Copy attempt
  const handleCopy = (e) => {
    e.preventDefault();
    reportCheat("Copy Attempt Detected");
  };

  document.addEventListener("copy", handleCopy);

  return () => {
    document.removeEventListener("visibilitychange", () => {});
    //document.removeEventListener("fullscreenchange", () => {});
    document.removeEventListener("copy", handleCopy);
  };
}, []);


  /**useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const preventBack = () => {
        if (!allowNavigation) {
        window.history.pushState(null, "", window.location.href);
        }
    };

    const preventReload = (e) => {
        if (["F5", "r"].includes(e.key) && e.ctrlKey) e.preventDefault();
    };

    const showWarning = (e) => {
        if (!allowNavigation) {
        e.preventDefault();
        e.returnValue = "Leaving will end the exam.";
        }
    };

    document.addEventListener("keydown", preventReload);
    window.addEventListener("beforeunload", showWarning);
    window.onpopstate = preventBack;

    return () => {
        document.removeEventListener("keydown", preventReload);
        window.removeEventListener("beforeunload", showWarning);
        window.onpopstate = null;
    };
}, [allowNavigation]);



    // =============================
  // Anti Cheating
  // =============================
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const handleBlur = () => {
        setWarnings(prev => {
        const updated = prev + 1;
        localStorage.setItem("cheat_warnings", updated);

        alert(`⚠ Warning ${updated}/${MAX_WARNINGS}: You switched tabs or minimized the window!`);

        if (updated >= MAX_WARNINGS) {
            alert("❌ Exam terminated due to multiple violations.");
            submitExam();
        } else {
            // Optional: Log cheat attempt via API
            axios.post(`${API_BASE_URL}/exam/${examId}/cheat`, {}, {
            headers: { Authorization: `Bearer ${token}` }
            });
        }

        return updated;
        });
    };

    window.addEventListener("blur", handleBlur);

    return () => {
        window.removeEventListener("blur", handleBlur);
    };
    }, []);
**/

  // =============================
  // Fetch Question Data
  // =============================
  const fetchQuestions = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const res = await axios.get(
      `${API_BASE_URL}/exam/${examId}/question`,
      { 
        headers: { Authorization: `Bearer ${token}`,
        Accept: "application/json",
     } }
    );

    if (!res.data.success || !res.data.data.length) {
      return alert("⚠ No questions found.");
    }

    const removeDuplicates = (arr) => {
    const seen = new Set();
    return arr.filter(q => {
        if (seen.has(q.question)) return false;
        seen.add(q.question);
        return true;
    });
    };

    // Format API response to match expected structure
    const formatted = res.data.data.map(item => {
      const q = item.question;

      const options = {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d,
      };

      return {
        id: item.id,
        question: q.question_stem,
        options,
        correct: item.correct,
        explanation: q.explanation,
      };
    });

    // Shuffle questions + options
    const uniqueQuestions = removeDuplicates(formatted);
    const shuffled = uniqueQuestions
      .sort(() => Math.random() - 0.5)
      .map(q => ({
        ...q,
        options: Object.fromEntries(
          Object.entries(q.options).sort(() => Math.random() - 0.5)
        )
      }));

    setQuestions(shuffled);

  } catch (error) {
    console.error(error);
    alert("⚠ Unauthorized. Please login again.");
    localStorage.removeItem("authToken");
    navigate("/");
  }
};


  // =============================
  // Initialize Timer
  // =============================
  const initializeTimer = () => {
    const duration = Number(localStorage.getItem("exam_duration"));
    const savedTime = Number(localStorage.getItem("remaining_time"));

    if (savedTime && savedTime > 0) {
      setTimeLeft(savedTime);
    } else if (duration) {
      const totalSeconds = duration * 60;
      setTimeLeft(totalSeconds);
      localStorage.setItem("remaining_time", totalSeconds);
    }
  };

  // =============================
  // Timer Countdown
  // =============================
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const updated = prev - 1;
        localStorage.setItem("remaining_time", updated);

        if (updated <= 0) {
          clearInterval(timer);
          alert("⏳ Time is up!");
          submitExam();
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // =============================
  // Prevent Reload / Back
  // =============================
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    const preventReload = e => {
      if (["F5", "r"].includes(e.key) && e.ctrlKey) e.preventDefault();
    };

    const showWarning = e => {
      e.preventDefault();
      e.returnValue = "Leaving will end the exam.";
    };

    document.addEventListener("keydown", preventReload);
    window.addEventListener("beforeunload", showWarning);
    window.onpopstate = preventBack;

    return () => {
      document.removeEventListener("keydown", preventReload);
      window.removeEventListener("beforeunload", showWarning);
      window.onpopstate = null;
    };
  }, []);

  // =============================
  // Auto Init
  // =============================
  useEffect(() => {
  if (!fetchedRef.current) {
    fetchQuestions();
    initializeTimer();
    fetchedRef.current = true; // 👈 prevents second call
  }
}, []);

  // =============================
  // Submit Answer
  // =============================
  const handleSubmitAnswer = async () => {
    if (!selected) return alert("Please select an option.");

    const token = localStorage.getItem("authToken");
    const q = questions[current];

    try {
      const res = await axios.post(
        `${API_BASE_URL}/exams/${examId}/answers`,
        { question_id: q.id, selected_option: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback(res.data.is_correct ? "correct" : "incorrect");
      setExplanation(q.explanation ?? "No explanation available.");

    } catch (error) {
      if (error.response?.status === 401) {
        alert("Session expired — login again.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("exam_duration");
        localStorage.removeItem("remaining_time");
        navigate("/");
      }
    }
  };

  // =============================
  // Next Question or Submit Exam
  // =============================
  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected("");
      setFeedback(null);
      setExplanation(null);
    } else {
      submitExam();
    }
  };

  const submitExam = () => {
    alert("🎉 Exam Finished!");
    setAllowNavigation(true);
    //window.location.href = `/exam/${examId}/complete`;
    navigate(`/exam/${examId}/results`);
  };

  // =============================
  // UI
  // =============================
  if (!questions.length) return <div className="p-6 text-center">Loading...</div>;

  const q = questions[current];
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      
      <div className="flex justify-between border-b pb-3">
        <h2 className="font-bold">Q {current + 1} of {questions.length}</h2>
        <div className="text-right">
          <p className="text-sm">⏳ Time Remaining</p>
          <div className="font-bold">
            {String(hours).padStart(2,"0")}:
            {String(minutes).padStart(2,"0")}:
            {String(seconds).padStart(2,"0")}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-3">{q.question}</h3>
        {Object.entries(q.options).map(([key,value]) => (
          <label key={key} className="flex gap-2 cursor-pointer py-1">
            <input
              type="radio"
              name="option"
              value={value}
              checked={selected === value}
              onChange={() => setSelected(value)}
              disabled={feedback}
            />
            {value}
          </label>
        ))}
      </div>

      {feedback && (
        <div className={`mt-4 p-3 rounded-md ${
          feedback === "correct"
            ? "bg-green-100 text-green-700 border border-green-300"
            : "bg-red-100 text-red-700 border border-red-300"
        }`}>
          {feedback === "correct" 
            ? "✅ Correct!"
            : <>❌ Incorrect — Answer: <strong>{q.correct}. {q.options[q.correct]}</strong></>
          }
        </div>
      )}

      {explanation && (
        <div className="mt-3 border bg-blue-50 border-blue-300 p-3 rounded">
          💡 {explanation}
        </div>
      )}

      <div className="flex justify-end mt-6 gap-3">
        {!feedback ? (
          <button onClick={handleSubmitAnswer} className="bg-green-600 text-white px-6 py-2 rounded">
            Submit
          </button>
        ) : (
          <button onClick={handleNext} className="bg-indigo-900 text-white px-6 py-2 rounded">
            Next
          </button>
        )}
      </div>

    </div>
  );
}
