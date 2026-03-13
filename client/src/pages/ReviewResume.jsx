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
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {

      setLoading(true);

      const formData = new FormData();
      formData.append("resume", input);

      const { data } = await axios.post(
        "/api/ai/resume-review",
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`
          }
        }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
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

          {/* UPLOAD */}
          <div>

            <label className="text-sm font-medium text-gray-600">
              Upload Resume
            </label>

            <div className="mt-3 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition">

              <input
                type="file"
                accept="application/pdf"
                required
                onChange={(e) => setInput(e.target.files[0])}
                className="hidden"
                id="resumeUpload"
              />

              <label
                htmlFor="resumeUpload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >

                <Upload className="w-8 h-8 text-gray-400" />

                <p className="text-sm text-gray-500">
                  Click to upload your resume
                </p>

                <span className="text-xs text-gray-400">
                  PDF format only
                </span>

              </label>

            </div>

          </div>

          {/* BUTTON */}
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

          {!content ? (

            <div className="flex flex-1 flex-col justify-center items-center text-gray-400 gap-4">

              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>

              <p className="text-sm text-center">
                Upload your resume and get AI-powered feedback
              </p>

            </div>

          ) : (

            <div className="overflow-y-auto text-sm text-gray-700 leading-relaxed prose max-w-none">

              <Markdown>
                {content}
              </Markdown>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default ReviewResume;