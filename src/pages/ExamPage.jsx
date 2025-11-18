import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAxiosAuth from "./axios";

export default function ExamPage() {
  const [examStatus, setExamStatus] = useState("ready");
  const [arrExam, setArrExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;  
  const navigate = useNavigate();
  useAxiosAuth();

  const fetchExam = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/exam/detail`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setArrExam(response.data.data[0]);
      localStorage.setItem("exam_duration", response.data.data[0].duration);
    } catch (error) {
      console.error("Fetching exam data failed:", error);

      // Token invalid → force logout
      if (error.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };


  // Fetch Exam API
  useEffect(() => {
    fetchExam();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.post(
        `${API_BASE_URL}/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      localStorage.removeItem("authToken");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // 🔄 Loading screen
  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg text-gray-500">Loading exam details...</div>;
  }

  // ❌ If no data
  if (!arrExam) {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-6 text-center">
      <p className="text-red-500 text-lg font-semibold">
        Exam data not found.
      </p>

      <button 
          onClick={handleLogout}
          class="bg-red-500 hover:bg-red-700 font-bold text-white py-2 px-4 rounded inline-flex items-center">
      <span className="material-symbols-outlined">logout</span>
      <span>Logout</span>
    </button>
    </div>
  );
}


  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#dbe0e6] dark:border-gray-700 px-10 py-4 bg-white dark:bg-background-dark">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Vibtech Genesis Examination Portal</h2>

        <button onClick={handleLogout} className="rounded-full h-10 w-10 bg-red-500 text-white flex justify-center items-center hover:bg-red-600">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex justify-center py-10">
        <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl w-full max-w-2xl">

          <h1 className="text-3xl font-bold text-primary dark:text-blue-300 mb-6">{arrExam.exam_title}</h1>
          <div class="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md" role="alert">
  <div class="flex">
    <div class="py-1"><svg class="fill-current h-6 w-6 text-teal-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
    <div>
      <p class="text-sm">{arrExam.description}</p>
    </div>
  </div>
</div>

          {/* Exam Details */}
          <div className="mt-4 p-4 border-l-4 border-primary/30 bg-primary/10 rounded-lg mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-x-6 gap-y-4">

              <Detail label="Total Questions" value={arrExam.questions} />
              <Detail label="Time Allotment" value={`${arrExam.duration} Minutes`} />
              <Detail label="Passing Rate" value={`${arrExam.pass_mark} %`} />
              <Detail label="Attempts Used" value={`${arrExam.attempt_used} of 3`} />
            </div>
          </div>

          {/* Button based on examStatus */}
          {examStatus === "ready" && (
            <button 
              onClick={() => setShowModal(true)}
              className="w-full bg-primary text-white p-4 rounded-lg font-bold"
            >
              Start Exam
          </button>

          )}
        </div>
        {showModal && (
          <div 
            id="confirmationModal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60"
          >
            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
              
              {/* Header */}
              <div className="p-4 text-center border-b border-gray-200">
                <span className="material-symbols-outlined text-primary text-5xl">task_alt</span>
                <h1 className="text-3xl font-black text-[#111418] mt-4">Exam Rules & Instructions</h1>
                <p className="text-[#617589] text-base mt-2">Please read the rules carefully before starting.</p>
              </div>

              {/* Scrollable Body */}
              <div className="p-4 space-y-2 overflow-y-auto flex-1"
                dangerouslySetInnerHTML={{ __html: arrExam.instruction }}
              />

              {/* Footer */}
              <div className="p-4 border-t flex justify-end gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer rounded-lg h-10 px-4 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button 
                  onClick={() => {
                    setShowModal(false);
                    setExamStatus("started");
                    navigate(`/exam/${arrExam.user_exam_id}/questions`);
                  }}
                  className="cursor-pointer rounded-lg h-10 px-4 bg-primary text-white font-semibold hover:bg-blue-800 shadow-md"
                >
                  Yes, Start Now
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="col-span-2 sm:grid sm:grid-cols-subgrid border-b border-gray-300 py-4">
      <p className="text-gray-500 text-sm font-normal">{label}</p>
      <p className="text-gray-900 text-base font-semibold">{value}</p>
    </div>
  );
}
