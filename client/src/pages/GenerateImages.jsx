import { Image, Sparkles } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {

  const imageStyle = [
    "Realistic",
    "Ghibli style",
    "Anime style",
    "Cartoon style",
    "Fantasy style",
    "3D style",
    "Portrait style",
  ];

  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const prompt = `Generate an image of ${input} in the style ${selectedStyle}`;

      const { data } = await axios.post(
        "/api/ai/generate-image",
        { prompt, publish },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
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
            <Sparkles className="w-6 text-green-500" />
            <h1 className="text-xl font-semibold">
              AI Image Generator
            </h1>
          </div>

          {/* PROMPT */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Describe your Image
            </label>

            <textarea
              rows={4}
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you want to see..."
              className="w-full mt-2 p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          {/* STYLE */}
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-600">
              Style
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {imageStyle.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setSelectedStyle(item)}
                  className={`px-4 py-1.5 text-xs rounded-full border transition
                    ${
                      selectedStyle === item
                        ? "bg-green-100 text-green-700 border-green-400"
                        : "text-gray-500 border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* PUBLIC SWITCH */}
          <div className="mt-6 flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
                className="sr-only peer"
              />

              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition"></div>

              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
            </label>

            <span className="text-sm text-gray-600">
              Make this image public
            </span>
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full mt-8 flex items-center justify-center gap-2
            bg-gradient-to-r from-green-500 to-emerald-500
            text-white py-3 rounded-lg text-sm font-medium
            hover:opacity-90 transition"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Image className="w-5 h-5" />
            )}

            Generate Image
          </button>
        </form>

        {/* RIGHT PANEL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">

          <div className="flex items-center gap-3 mb-6">
            <Image className="w-5 h-5 text-green-500" />
            <h1 className="text-xl font-semibold">
              Generated Images
            </h1>
          </div>

          {!content ? (
            <div className="flex flex-1 flex-col justify-center items-center text-gray-400 gap-4">

              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                <Image className="w-7 h-7" />
              </div>

              <p className="text-sm">
                Enter a prompt and generate your AI image
              </p>

            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-gray-200">

              <img
                src={content}
                alt="generated"
                className="w-full object-cover"
              />

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default GenerateImages;