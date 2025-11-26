import { useNavigate } from "react-router-dom";

export default function ExamResult({ status, userExam, correctCount }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("authToken");
      navigate("/");
    }
  };

  const handleRetake = () => {
    if (window.confirm("Do you want to retake the exam?")) {
      navigate("/exam");
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-10 py-3">
        <div className="flex items-center gap-4 text-gray-900 dark:text-white">
          <div className="size-6 text-primary">
            <svg fill="currentColor" viewBox="0 0 48 48">
              <path d="M24 4H6V17.333V30.667H24V44H42V30.667V17.333H24V4Z" />
            </svg>
          </div>
          <h2 className="font-bold text-lg">Vibtech Genesis Examination Portal</h2>
        </div>
      </header>

      <main className="flex flex-col items-center p-10">
        <div className="bg-white dark:bg-background-dark/50 shadow-lg rounded-xl p-8 max-w-2xl w-full space-y-8">
          {/* Result Icon */}
          <div className="flex flex-col items-center gap-4">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full ${
                status === "passed"
                  ? "bg-green-100 dark:bg-green-500/20"
                  : "bg-red-100 dark:bg-red-500/20"
              }`}
            >
              <span
                className={`material-symbols-outlined text-5xl ${
                  status === "passed"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {status === "passed" ? "check" : "cancel"}
              </span>
            </div>

            <div className="text-center">
              <p className="text-4xl font-black dark:text-white">Exam Results</p>

              {status === "passed" ? (
                <p className="text-green-600 dark:text-green-400 mt-2 text-lg font-medium">
                  🎉 Congratulations, you have passed!
                </p>
              ) : (
                <p className="text-red-600 dark:text-red-400 mt-2 text-lg font-medium">
                  ❌ You scored <strong>{userExam.scores}</strong>%. Required Passing: <strong>{userExam.pass_mark}%</strong>
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Stat label="Total Questions" value={userExam.total_questions} />
            <Stat label="Correct Answers" value={correctCount} />
            <Stat label="Score" value={`${userExam.scores}%`} />

            <Stat
              label="Attempts Used"
              value={`${userExam.attempts_used} of 3`}
              full
            />
          </div>

          {/* Message */}
          {status === "passed" && (
            <Message text="You have successfully completed your certification. Please log out to secure your session." />
          )}

          {status === "cancel" && (
            <Message text="❌ You have reached the maximum of 3 exam attempts and did not pass. Your account is temporarily locked." danger />
          )}

          {status === "failed" && (
            <Message text="You did not pass this time. Review materials and try again or log out." danger />
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {status !== "passed" && status !== "cancel" && (
              <button
                onClick={handleRetake}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-12 px-8 font-bold transition"
              >
                Retake Exam
              </button>
            )}

            <button
              onClick={handleLogout}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg h-12 px-8 font-bold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Reusable sub-component for stat cards */
function Stat({ label, value, full = false }) {
  return (
    <div
      className={`flex flex-col gap-2 p-6 border rounded-lg dark:border-white/10 bg-background-light dark:bg-background-dark ${
        full ? "col-span-1 sm:col-span-2 md:col-span-3" : ""
      }`}
    >
      <p className="text-gray-500 dark:text-gray-400 text-base font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold dark:text-white">{value}</p>
    </div>
  );
}

/* Message section */
function Message({ text, danger = false }) {
  return (
    <p
      className={`text-center text-base px-4 ${
        danger
          ? "text-red-600 dark:text-red-400"
          : "text-gray-700 dark:text-gray-300"
      }`}
    >
      {text}
    </p>
  );
}
