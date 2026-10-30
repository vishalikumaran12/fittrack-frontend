
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  UserRound,
  Target,
  LogOut,
  LayoutDashboard,
  Dumbbell,
  Apple,
  Activity,
} from "lucide-react";

const pages = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Activity", path: "/activity", icon: Activity },
  { name: "Workout", path: "/workout", icon: Dumbbell },
  { name: "Nutrition", path: "/nutrition", icon: Apple },
];

export default function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
  function loadUser() {
    try {
      const current = localStorage.getItem("fittrack-current-user");

      if (!current) {
        setUser(null);
        return;
      }

      // Backend stores the user as a JSON object
      const parsedUser = JSON.parse(current);

      setUser(parsedUser);
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
    }
  }

  loadUser();

  window.addEventListener("storage", loadUser);

  return () => {
    window.removeEventListener("storage", loadUser);
  };
}, []);
  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  function handleLogout() {
  localStorage.removeItem("fittrack-token");
  localStorage.removeItem("fittrack-current-user");

  setUser(null);
  setProfileOpen(false);

  navigate("/login");
}
  function openPage(path) {
    navigate(path);
    setSearch("");
    setSearchOpen(false);
  }

  const displayName = user?.name || "Fitness Member";
  const initial = displayName.charAt(0).toUpperCase();
  const email = user?.email || "";

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <p className="text-sm text-gray-500">
          Your health, your progress
        </p>
        <h2 className="text-xl font-bold text-gray-900">
          Fitness Overview
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Page Search */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearch("");
                  setSearchOpen(false);
                }

                if (e.key === "Enter" && filteredPages.length > 0) {
                  openPage(filteredPages[0].path);
                }
              }}
              placeholder="Search pages..."
              aria-label="Search pages"
              className="w-28 bg-transparent text-sm outline-none sm:w-36"
            />
          </div>

          {searchOpen && search.trim() && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
              {filteredPages.length ? (
                filteredPages.map((page) => {
                  const Icon = page.icon;

                  return (
                    <button
                      key={page.path}
                      type="button"
                      onClick={() => openPage(page.path)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-violet-50"
                    >
                      <Icon size={17} />
                      {page.name}
                    </button>
                  );
                })
              ) : (
                <p className="p-3 text-sm text-gray-500">
                  No matching pages found.
                </p>
              )}

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="mt-1 w-full rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications are not configured yet"
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
        >
          <Bell size={21} />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-label="Open user profile menu"
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
              {initial}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-semibold text-gray-800">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">
                {user ? "Fitness Member" : "Guest"}
              </p>
            </div>

            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
              <div className="border-b border-gray-100 px-3 pb-3">
                <p className="truncate font-semibold text-gray-900">
                  {displayName}
                </p>
                <p className="mt-1 break-all text-xs text-gray-500">
                  {email || "Not logged in"}
                </p>
              </div>

             
<button
  type="button"
  onClick={() => {
    setProfileOpen(false);
    navigate("/profile");
  }}
  className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-violet-50"
>
  <UserRound size={17} />
  My Profile
</button>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/nutrition");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-violet-50"
              >
                <Target size={17} />
                Nutrition Goals
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-3 rounded-lg border-t border-gray-100 px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
