import { Protect, useClerk, useUser } from "@clerk/clerk-react";
import {
  Eraser,
  FileText,
  House,
  Image,
  LogOut,
  SquarePen,
  Users,
} from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: Users },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  return (
    <div
      className={`w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200
      flex flex-col justify-between h-screen
      ${sidebar ? "translate-x-0" : "max-sm:-translate-x-full"}
      transition-all duration-300`}
    >
      {/* TOP SECTION */}
      <div className="px-6 py-6">

        {/* LOGO */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            AI
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Quick.ai
          </h1>
        </div>

        {/* USER PROFILE */}
        <div
          onClick={openUserProfile}
          className="flex flex-col items-center gap-2 mb-8 cursor-pointer"
        >
          <img
            src={user.imageUrl}
            alt="user"
            className="w-14 h-14 rounded-full ring-2 ring-indigo-500"
          />
          <h2 className="font-medium">{user.fullName}</h2>

          <p className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full">
            <Protect plan="premium" fallback="Free">
              Premium
            </Protect>
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="space-y-2">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/ai"}
              onClick={() => setSidebar(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition
                ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="border-t border-gray-200 p-5 flex items-center justify-between">
        <div
          onClick={openUserProfile}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src={user.imageUrl}
            className="w-9 h-9 rounded-full"
          />

          <div className="leading-tight">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-gray-500">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>{" "}
              Plan
            </p>
          </div>
        </div>

        <LogOut
          className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition"
          onClick={() => signOut()}
        />
      </div>
    </div>
  );
};

export default Sidebar;