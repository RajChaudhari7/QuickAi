import { Eraser, Sparkles, Download } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {

  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [slider, setSlider] = useState(50);

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {

    e.preventDefault();

    if (!input) {
      toast.error("Please upload an image");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();
      formData.append("image", input);

      const { data } = await axios.post(
        "/api/ai/remove-image-background",
        formData,
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
            <Sparkles className="w-6 text-orange-500" />
            <h1 className="text-xl font-semibold">
              AI Background Removal
            </h1>
          </div>

          {/* FILE INPUT */}

          <div>

            <label className="text-sm font-medium text-gray-600">
              Upload Image
            </label>

            <div className="mt-3 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition">

              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setInput(e.target.files[0])}
                className="hidden"
                id="upload"
              />

              <label
                htmlFor="upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >

                <Eraser className="w-8 h-8 text-gray-400" />

                {input ? (
                  <>
                    <p className="text-sm font-medium text-green-600">
                      {input.name}
                    </p>
                    <span className="text-xs text-gray-400">
                      Image selected
                    </span>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">
                      Click to upload image
                    </p>
                    <span className="text-xs text-gray-400">
                      JPG, PNG supported
                    </span>
                  </>
                )}

              </label>

            </div>

            {/* IMAGE PREVIEW */}

            {input && (
              <img
                src={URL.createObjectURL(input)}
                alt="preview"
                className="mt-4 rounded-lg max-h-40 mx-auto"
              />
            )}

          </div>

          {/* BUTTON */}

          <button
            disabled={loading}
            className="w-full mt-8 flex items-center justify-center gap-2
            bg-gradient-to-r from-orange-400 to-red-500
            text-white py-3 rounded-lg text-sm font-medium
            hover:opacity-90 transition"
          >

            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Eraser className="w-5 h-5" />
            )}

            Remove Background

          </button>

        </form>


        {/* RIGHT PANEL */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">

          <div className="flex items-center gap-3 mb-6">
            <Eraser className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-semibold">
              Processed Image
            </h1>
          </div>

          {!content ? (

            <div className="flex flex-1 flex-col justify-center items-center text-gray-400 gap-4">

              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                <Eraser className="w-7 h-7" />
              </div>

              <p className="text-sm text-center">
                Upload an image to remove the background
              </p>

            </div>

          ) : (

            <div className="flex flex-col gap-6">

              {/* BEFORE AFTER SLIDER */}

              <div className="relative w-full h-[350px] overflow-hidden rounded-xl border">

                {/* BEFORE IMAGE */}

                <img
                  src={URL.createObjectURL(input)}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />

                {/* AFTER IMAGE */}

                <img
                  src={content}
                  className="absolute top-0 left-0 h-full object-cover"
                  style={{ width: `${slider}%` }}
                />

                {/* SLIDER */}

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={slider}
                  onChange={(e) => setSlider(e.target.value)}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3/4"
                />

              </div>


              {/* DOWNLOAD */}

              <a
                href={content}
                download
                className="flex items-center justify-center gap-2
                bg-gray-900 text-white py-2 rounded-lg text-sm
                hover:opacity-90 transition"
              >

                <Download className="w-4 h-4" />
                Download Image

              </a>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default RemoveBackground;