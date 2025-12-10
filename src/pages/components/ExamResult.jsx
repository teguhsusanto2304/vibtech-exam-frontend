import { useNavigate } from "react-router-dom";

export default function ExamResult({ logoUrl, appName, status, userExam, user, correctCount }) {
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

  const getStatusColor = () => {
    if (status === "passed") return "green";
    if (status === "pending") return "blue";
    return "red";
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#dbe0e6] dark:border-gray-700 px-10 py-4 bg-white dark:bg-background-dark">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="App Logo" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {appName || "Genesis Examination Portal"}
          </h2>
        </div>
      </header>

      <main className="flex flex-col items-center p-6 sm:p-10 flex-1">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 sm:p-12 max-w-3xl w-full">
          
          {/* Result Icon & Title */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <div
              className={`flex h-28 w-28 items-center justify-center rounded-full shadow-lg ${
                status === "passed"
                  ? "bg-green-100 dark:bg-green-500/20"
                  : status === "pending"
                  ? "bg-blue-100 dark:bg-blue-500/20"
                  : "bg-red-100 dark:bg-red-500/20"
              }`}
            >
              <span
                className={`material-symbols-outlined text-6xl font-bold ${
                  status === "passed"
                    ? "text-green-600 dark:text-green-400"
                    : status === "pending"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {status === "passed" ? "check_circle" : status === "pending" ? "schedule" : "cancel"}
              </span>
            </div>

            <div className="text-center space-y-3">
              <h1 className="text-4xl sm:text-5xl font-black dark:text-white">
                Exam Results
              </h1>
              <h2 className="text-2xl font-bold text-primary dark:text-blue-300">
                {userExam.title}
              </h2>
            </div>
          </div>

          {/* Status Message */}
          <div className="mb-8 p-4 rounded-lg border-l-4 text-center space-y-2"
            style={{
              borderLeftColor: status === "passed" ? "#10b981" : status === "pending" ? "#3b82f6" : "#ef4444",
              backgroundColor: status === "passed" ? "#f0fdf4" : status === "pending" ? "#f0f9ff" : "#fef2f2"
            }}
          >
            {status === "passed" ? (
              <p className="text-green-700 dark:text-green-400 text-lg font-bold">
                🎉 You have passed the examination. Your result will be sent to your email. You may logout 
now!
              </p>
            ) : status === "failed" ? (
              <p className="text-blue-700 dark:text-blue-400 text-lg font-bold">
                ⏳ Your exam is pending review. Please wait for results.
              </p>
            ) : status === "cancel" ? (
              <p className="text-red-700 dark:text-red-400 text-lg font-bold">
                ❌ You failed all 3 attempts of the examination. Your result will be sent to your email. You 
may logout now.
              </p>
            ) : (
              <p className="text-red-700 dark:text-red-400 text-lg font-bold">
                You scored <span className="text-2xl">{userExam.scores}%</span>
              </p>
            )}
            {status === "pending" && (
              <p className="text-red-600 dark:text-red-300 text-sm">
                You failed. Please retake the examination.
              </p>
            )}
          </div>

          {/* Candidate Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Candidate Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Name" value={user.name} />
              <StatCard label="Company" value={user.company} />
              <StatCard label="Email" value={user.email} />
            </div>
          </div>

          {/* Exam Performance */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Exam Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard label="Total Questions" value={userExam.total_questions} highlight />
              <StatCard label="Correct Answers" value={correctCount} highlight />
              <StatCard label="Score" value={`${userExam.scores}%`} highlight />
              <StatCard label="Passing Rate" value={`${userExam.pass_mark}%`} />
              <StatCard label="Attempts Used" value={`${userExam.attempts_used} of 3`} />
              <StatCard label="Duration" value={userExam.duration ? `${userExam.duration} min` : "N/A"} />
            </div>
          </div>

          {/* Progress Bar */}
          {status == "pending" && (
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium dark:text-gray-300">Progress</p>
                <p className="text-sm font-bold dark:text-white">{userExam.scores}%</p>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    status === "passed" ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${userExam.scores}%` }}
                />
              </div>
            </div>
          )}

          {/* Message */}
          {status === "passed" && (
            <Message text="You have successfully completed your certification. Please log out to secure your session." />
          )}

          {status === "cancel" && (
            <Message text="You have reached the maximum of 3 exam attempts. Your account is temporarily locked." danger />
          )}

          {status === "failed" && (
            <Message text="You did not pass this time. Review materials and try again or log out." danger />
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            {status !== "passed" && status !== "cancel" && status == "pending" && (
              <button
                onClick={handleRetake}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-12 px-8 font-bold transition shadow-md"
              >
                Retake Exam
              </button>
            )}

            <button
              onClick={handleLogout}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg h-12 px-8 font-bold transition shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Stat Card Component */
function StatCard({ label, value, highlight = false }) {
  return (
    <div
      className={`flex flex-col gap-2 p-4 rounded-lg border dark:border-gray-600 ${
        highlight
          ? "bg-white dark:bg-gray-800 border-primary/30"
          : "bg-white dark:bg-gray-800"
      }`}
    >
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
        {label}
      </p>
      <p className={`font-bold ${highlight ? "text-lg text-primary dark:text-blue-300" : "dark:text-white"}`}>
        {value}
      </p>
    </div>
  );
}

/* Message section */
function Message({ text, danger = false }) {
  return (
    <div
      className={`text-center text-sm px-4 py-3 rounded-lg border-l-4 ${
        danger
          ? "bg-red-50 dark:bg-red-500/10 border-red-500 text-red-700 dark:text-red-400"
          : "bg-green-50 dark:bg-green-500/10 border-green-500 text-green-700 dark:text-green-400"
      }`}
    >
      {text}
    </div>
  );
}