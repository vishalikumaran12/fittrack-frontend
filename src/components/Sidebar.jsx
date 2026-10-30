import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Utensils,
  Dumbbell,
  Lightbulb,
  HeartPulse,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Activity", path: "/activity", icon: Activity },
  { name: "Nutrition", path: "/nutrition", icon: Utensils },
  { name: "Workout", path: "/workout", icon: Dumbbell },
  { name: "Suggestions", path: "/suggestions", icon: Lightbulb },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col border-r border-gray-200 bg-white p-2 sm:w-64 sm:p-5">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3">
        <div className="rounded-xl bg-violet-600 p-2 text-white">
          <HeartPulse size={25} />
        </div>

        <div>
          <h1 className="text-lg font-bold text-gray-900">
            FitTrack
          </h1>
          <p className="text-xs text-gray-500">
            Your wellness journey
          </p>
        </div>
      </div>

      {/* Navigation */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Menu
      </p>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto rounded-2xl bg-violet-50 p-4">
        <p className="font-semibold text-violet-900">
          Keep moving!
        </p>
        <p className="mt-1 text-sm text-violet-700">
          Small steps create big changes.
        </p>
      </div>
    </aside>
  );
}