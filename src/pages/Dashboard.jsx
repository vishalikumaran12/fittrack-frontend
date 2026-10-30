
import { useEffect, useState } from "react";
import {
  Footprints,
  Flame,
  Droplets,
  Dumbbell,
  Target,
  Clock,
} from "lucide-react";
import API from "../services/api";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const emptyActivity = {
  steps: 0,
  calories: 0,
  water: 0,
  workoutMinutes: 0,
};

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activity, setActivity] = useState(emptyActivity);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("fittrack-current-user");

      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch {
      setCurrentUser(null);
    }

    const fetchTodayActivity = async () => {
      try {
        setLoading(true);
        setError("");

        const today = getTodayDate();
        const response = await API.get(`/activities/${today}`);

        const todayActivity = response.data.activity;

setActivity({
  steps: todayActivity?.steps ?? 0,
  calories: todayActivity?.calories ?? 0,
  water: todayActivity?.water ?? 0,
  workoutMinutes: todayActivity?.workoutMinutes ?? 0,
});
      } catch (err) {
        if (err.response?.status === 404) {
          setActivity(emptyActivity);
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load today's activity."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTodayActivity();
  }, []);

  const stats = [
    {
      title: "Steps",
      value: activity.steps.toLocaleString(),
      icon: Footprints,
      unit: "steps",
    },
    {
      title: "Calories Burned",
      value: activity.calories.toLocaleString(),
      icon: Flame,
      unit: "kcal",
    },
    {
      title: "Water Intake",
      value: (activity.water / 1000).toFixed(2),
      icon: Droplets,
      unit: "litres",
    },
    {
      title: "Workout Time",
      value: activity.workoutMinutes,
      icon: Dumbbell,
      unit: "minutes",
    },
  ];

  const stepGoal = 10000;
  const stepProgress = Math.min(
    (activity.steps / stepGoal) * 100,
    100
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {currentUser?.name || "User"}!
        </h1>
        <p className="mt-1 text-gray-500">
          Here's your fitness summary for today.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.title}</p>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Icon size={22} />
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  {loading ? "..." : stat.value}
                </h2>
                <span className="text-sm text-gray-400">
                  {stat.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">
                Daily Step Goal
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Keep moving towards your goal!
              </p>
            </div>
            <Target className="text-blue-600" size={26} />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                {loading ? "Loading..." : `${activity.steps.toLocaleString()} steps`}
              </span>
              <span className="text-gray-500">
                {stepGoal.toLocaleString()} steps
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${stepProgress}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-gray-500">
              {loading
                ? "Loading your progress..."
                : `${Math.max(stepGoal - activity.steps, 0).toLocaleString()} steps remaining`}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                Today's Progress
              </h2>
              <p className="text-sm text-gray-500">
                Your activity summary
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">
                Workout duration
              </span>
              <span className="font-semibold text-gray-800">
                {loading ? "..." : `${activity.workoutMinutes} min`}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">
                Water intake
              </span>
              <span className="font-semibold text-gray-800">
                {loading ? "..." : `${(activity.water / 1000).toFixed(2)} L`}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">
                Calories burned
              </span>
              <span className="font-semibold text-gray-800">
                {loading ? "..." : `${activity.calories} kcal`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
