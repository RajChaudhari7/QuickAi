import React, { useEffect, useState } from "react";
import { Gem, Sparkles } from "lucide-react";
import { Protect, useAuth } from "@clerk/clerk-react";
import CreationItem from "../components/CreationItem";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/user/get-user-creations", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className="h-full overflow-y-auto p-8 bg-gray-50">

      {/* PAGE TITLE */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          Manage and track your AI creations
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* TOTAL CREATIONS */}
        <div className="flex items-center justify-between p-6 rounded-2xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition">

          <div>
            <p className="text-gray-500 text-sm">
              Total Creations
            </p>

            <h2 className="text-3xl font-semibold mt-1">
              {creations.length}
            </h2>
          </div>

          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* ACTIVE PLAN */}
        <div className="flex items-center justify-between p-6 rounded-2xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition">

          <div>
            <p className="text-gray-500 text-sm">
              Active Plan
            </p>

            <h2 className="text-3xl font-semibold mt-1">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
            </h2>
          </div>

          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white">
            <Gem className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* RECENT CREATIONS */}
      <div className="mt-10">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">
            Recent Creations
          </h2>

          <span className="text-sm text-gray-400">
            {creations.length} items
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : creations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
            No creations yet 🚀
          </div>
        ) : (
          <div className="space-y-4">
            {creations.map((item) => (
              <CreationItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;