
import { FileText, Sparkles, UploadCloud } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", input);

      const { data } = await axios.post("/api/ai/resume-review", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

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
    <div className="h-full overflow-y-auto p-8 bg-gray-50 flex flex-wrap gap-6">

      {/* LEFT CARD */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
      >

        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 text-emerald-500" />
          <h1 className="text-xl font-semibold text-gray-800">
            AI Resume Reviewer
          </h1>
        </div>

        <p className="text-sm font-medium text-gray-600">
          Upload your resume
        </p>

        {/* Upload Box */}
        <label
          className="mt-3 border-2 border-dashed border-gray-300 rounded-xl p-8
          flex flex-col items-center justify-center gap-3 cursor-pointer
          hover:border-emerald-400 transition"
        >

          <UploadCloud className="w-10 h-10 text-gray-400" />

          <p className="text-sm text-gray-500">
            Click to upload your resume
          </p>

          <span className="text-xs text-gray-400">
            PDF format only
          </span>

          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setInput(e.target.files[0])}
            required
          />
        </label>

        {/* Selected file */}
        {input && (
          <p className="mt-3 text-xs text-gray-500">
            Selected file: <span className="font-medium">{input.name}</span>
          </p>
        )}

        {/* Button */}
        <button
          disabled={loading}
          className="w-full mt-6 flex items-center justify-center gap-2
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

      {/* RIGHT CARD */}
      <div
        className="w-full max-w-xl bg-white border border-gray-200
        rounded-2xl shadow-sm p-6 flex flex-col min-h-[420px]"
      >

        <div className="flex items-center gap-3 mb-5">
          <FileText className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-semibold text-gray-800">
            Resume Analysis
          </h1>
        </div>

        {!content ? (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <div className="flex flex-col items-center gap-4 text-center">
              <FileText className="w-10 h-10" />
              <p className="text-sm">
                Upload a resume and click
                <span className="font-medium"> "Review Resume"</span>
                to see AI feedback
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto text-sm text-gray-700 pr-2">
            <div className="prose max-w-none">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewResume;