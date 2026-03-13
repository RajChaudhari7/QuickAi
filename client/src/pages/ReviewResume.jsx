import { FileText, Sparkles, Upload } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {

  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {

    e.preventDefault();

    if (!input) {
      return toast.error("Please upload a resume");
    }

    try {

      setLoading(true);

      const formData = new FormData();
      formData.append("resume", input);

      const { data } = await axios.post(
        "/api/ai/resume-review",
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (data.success) {
        setResult(data.content);
      } else {
        toast.error(data.message);
      }

    } catch (error) {

      toast.error(error.response?.data?.message || error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8 bg-gray-50">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT PANEL */}

        <form
          onSubmit={onSubmitHandler}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
        >

          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 text-emerald-500" />
            <h1 className="text-xl font-semibold">
              AI Resume Reviewer
            </h1>
          </div>

          <label className="text-sm font-medium text-gray-600">
            Upload Resume
          </label>

          <div className="mt-3 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition">

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setInput(e.target.files[0])}
              className="hidden"
              id="resumeUpload"
            />

            <label
              htmlFor="resumeUpload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >

              <Upload className="w-8 h-8 text-gray-400" />

              {!input ? (
                <>
                  <p className="text-sm text-gray-500">
                    Click to upload your resume
                  </p>
                  <span className="text-xs text-gray-400">
                    PDF format only
                  </span>
                </>
              ) : (
                <>
                  <p className="text-sm text-emerald-600 font-semibold">
                    {input.name}
                  </p>

                  <span className="text-xs text-gray-400">
                    {(input.size / 1024).toFixed(1)} KB
                  </span>
                </>
              )}

            </label>

          </div>

          <button
            disabled={loading}
            className="w-full mt-8 flex items-center justify-center gap-2
            bg-gradient-to-r from-emerald-500 to-teal-500
            text-white py-3 rounded-lg text-sm font-medium
            hover:opacity-90 transition"
          >

            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <FileText className="w-5 h-5" />
            )}

            Review Resume

          </button>

        </form>


        {/* RIGHT PANEL */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">

          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-semibold">
              Resume Analysis
            </h1>
          </div>

          {!result ? (

            <div className="flex flex-1 flex-col justify-center items-center text-gray-400 gap-4">

              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>

              <p className="text-sm text-center">
                Upload your resume and get AI-powered feedback
              </p>

            </div>

          ) : (

            <div className="space-y-6 overflow-y-auto">

              {/* SCORE CARDS */}

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Resume Score</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {result.score}%
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500">ATS Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.ats_score}%
                  </p>
                </div>

              </div>

              {/* STRENGTHS */}

              <div>
                <h3 className="font-semibold mb-2">Strengths</h3>

                <ul className="list-disc list-inside text-sm text-gray-600">
                  {result.strengths?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* SUGGESTIONS */}

              <div>
                <h3 className="font-semibold mb-2">Suggestions</h3>

                <ul className="list-disc list-inside text-sm text-gray-600">
                  {result.improvements?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* MISSING KEYWORDS */}

              <div>
                <h3 className="font-semibold mb-2">Missing Keywords</h3>

                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords?.map((k, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-xs px-2 py-1 rounded"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* ANALYSIS */}

              <div className="prose max-w-none text-sm">
                <Markdown>
                  {result.analysis}
                </Markdown>
              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default ReviewResume;