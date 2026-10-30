
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UserRound,
  Mail,
  Footprints,
  Flame,
  GlassWater,
  Dumbbell,
  Pencil,
  Save,
  X,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import API from "../services/api";

export default function Profile() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fitness, setFitness] = useState({
    steps: 0,
    calories: 0,
    water: 0,
    workoutMinutes: 0,
  });

  // Get today's date in local timezone
  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Fetch profile and today's activity
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const profileResponse = await API.get("/auth/profile");
        const user = profileResponse.data.user;

        setName(user.name || "Fitness Member");
        setEditName(user.name || "");
        setEmail(user.email || "");

        // Update localStorage user details for Header
        const savedUser = JSON.parse(
          localStorage.getItem("fittrack-current-user") || "{}"
        );

        localStorage.setItem(
          "fittrack-current-user",
          JSON.stringify({
            ...savedUser,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          })
        );

        // Fetch today's fitness activity
        try {
          const activityResponse = await API.get(
            `/activities/${getToday()}`
          );

          const activity = activityResponse.data.activity || {};

          setFitness({
            steps: Number(activity.steps) || 0,
            calories: Number(activity.calories) || 0,
            water: Number(activity.water) || 0,
            workoutMinutes: Number(activity.workoutMinutes) || 0,
          });
        } catch (activityError) {
          // No activity recorded for today
          if (activityError.response?.status !== 404) {
            console.error("Activity loading error:", activityError);
          }

          setFitness({
            steps: 0,
            calories: 0,
            water: 0,
            workoutMinutes: 0,
          });
        }
      } catch (error) {
        console.error("Profile loading error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("fittrack-token");
          localStorage.removeItem("fittrack-current-user");
          navigate("/login");
        } else {
          setMessage(
            error.response?.data?.message ||
              "Unable to load profile. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Update profile name
  async function handleSaveName(event) {
    event.preventDefault();
    setMessage("");

    const updatedName = editName.trim();

    if (!updatedName) {
      setMessage("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      const response = await API.patch("/auth/profile", {
        name: updatedName,
      });

      const updatedUser = response.data.user;

      setName(updatedUser.name);
      setEditName(updatedUser.name);

      // Keep Header user details updated
      const savedUser = JSON.parse(
        localStorage.getItem("fittrack-current-user") || "{}"
      );

      localStorage.setItem(
        "fittrack-current-user",
        JSON.stringify({
          ...savedUser,
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        })
      );

      setIsEditing(false);
      setMessage("Profile name updated successfully!");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Could not update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem("fittrack-token");
    localStorage.removeItem("fittrack-current-user");
    navigate("/login");
  }

  const stats = [
    {
      label: "Steps",
      value: fitness.steps.toLocaleString(),
      icon: Footprints,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Calories",
      value: fitness.calories.toLocaleString(),
      icon: Flame,
      color: "bg-orange-100 text-orange-700",
    },
    {
      label: "Water",
      value: `${(fitness.water / 1000).toFixed(1)} L`,
      icon: GlassWater,
      color: "bg-cyan-100 text-cyan-700",
    },
    {
      label: "Workout",
      value: `${fitness.workoutMinutes} min`,
      icon: Dumbbell,
      color: "bg-violet-100 text-violet-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-violet-700"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
            Account settings
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your personal details and review your fitness progress.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl bg-violet-50 p-4 text-sm text-violet-700"
          >
            {message}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-violet-600 to-indigo-500 sm:h-36" />

          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-violet-100 text-violet-700 shadow-sm">
              <UserRound size={42} />
            </div>

            <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  FitTrack Member
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditName(name);
                    setIsEditing(true);
                    setMessage("");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <Pencil size={17} />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing && (
              <form
                onSubmit={handleSaveName}
                className="mt-6 rounded-2xl bg-gray-50 p-4 sm:p-5"
              >
                <label
                  htmlFor="profileName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full name
                </label>

                <input
                  id="profileName"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  required
                  maxLength={80}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(name);
                      setMessage("");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <X size={17} />
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="mb-4 font-bold text-gray-900">
                Personal Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                  <UserRound
                    size={20}
                    className="mt-1 text-violet-600"
                  />

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Full Name</p>

                    <p className="mt-1 break-words font-medium text-gray-900">
                      {name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                  <Mail
                    size={20}
                    className="mt-1 text-violet-600"
                  />

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Email Address
                    </p>

                    <p className="mt-1 break-all font-medium text-gray-900">
                      {email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            My Fitness Summary
          </h2>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon size={22} />
                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    {stat.label}
                  </p>

                  <p className="mt-1 break-words text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-red-100 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="font-bold text-gray-900">Logout</h2>

            <p className="mt-1 text-sm text-gray-500">
              Sign out of your current FitTrack account.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 font-semibold text-red-600 hover:bg-red-100"
          >
            <LogOut size={18} />
            Logout
          </button>
        </section>
      </div>
    </div>
  );
}
