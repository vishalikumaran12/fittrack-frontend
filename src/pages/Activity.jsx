
import { useEffect, useState } from "react";
import {
  Footprints,
  Flame,
  Droplets,
  Moon,
  Plus,
  Minus,
  Target,
  Dumbbell,
} from "lucide-react";

import API from "../services/api";

const emptyFitness = {
  steps: 0,
  calories: 0,
  water: 0,
  workoutMinutes: 0,
  sleepHours: 0,
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Activity() {
  const [fitness, setFitness] = useState(emptyFitness);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const today = getTodayDate();

  // Load today's activity from MongoDB
  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true);
        setMessage("");

        const response = await API.get(`/activities/${today}`);

        const activity = response.data.activity;

        setFitness({
          steps: activity.steps ?? 0,
          calories: activity.calories ?? 0,
          water: activity.water ?? 0,
          workoutMinutes: activity.workoutMinutes ?? 0,
          sleepHours: activity.sleep ?? 0,
        });
      } catch (error) {
        if (error.response?.status === 404) {
          // No activity saved for today yet
          setFitness(emptyFitness);
        } else {
          setMessage(
            error.response?.data?.message ||
              "Unable to load activity. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [today]);

  // Save or update today's activity in MongoDB
  async function saveActivity(updatedFitness) {
    try {
      setSaving(true);
      setMessage("");

      await API.post("/activities", {
        date: today,
        steps: updatedFitness.steps,
        calories: updatedFitness.calories,
        water: updatedFitness.water,
        sleep: updatedFitness.sleepHours,
        workoutMinutes: updatedFitness.workoutMinutes,
      });

      setMessage("Activity saved successfully!");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to save activity. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Update a field and save the complete daily record
  function updateFitness(field, value) {
    const updatedFitness = {
      ...fitness,
      [field]: value,
    };

    setFitness(updatedFitness);
    saveActivity(updatedFitness);
  }

  function addWater() {
    updateFitness("water", Math.min(fitness.water + 250, 5000));
  }

  function removeWater() {
    updateFitness("water", Math.max(fitness.water - 250, 0));
  }

  function handleNumberChange(field, value, max) {
    if (value === "") return;

    const next = Number(value);

    if (
      Number.isFinite(next) &&
      next >= 0 &&
      next <= max
    ) {
      updateFitness(field, next);
    }
  }

  const steps = Number(fitness.steps) || 0;
  const calories = Number(fitness.calories) || 0;
  const water = Number(fitness.water) || 0;
  const sleep = Number(fitness.sleepHours) || 0;
  const workoutMinutes = Number(fitness.workoutMinutes) || 0;

  const stepGoal = 10000;
  const waterGoal = 2500;

  const stepProgress = Math.min((steps / stepGoal) * 100, 100);
  const waterProgress = Math.min((water / waterGoal) * 100, 100);

  const activities = [
    {
      title: "Steps Today",
      value: steps.toLocaleString(),
      unit: "steps",
      goal: "Goal: 10,000",
      icon: <Footprints size={23} />,
      color: "bg-violet-100 text-violet-700",
    },
    {
      title: "Calories Burned",
      value: calories.toLocaleString(),
      unit: "kcal",
      goal: "Today's activity calories",
      icon: <Flame size={23} />,
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "Water Intake",
      value: (water / 1000).toFixed(2),
      unit: "litres",
      goal: "Goal: 2.5 litres",
      icon: <Droplets size={23} />,
      color: "bg-sky-100 text-sky-700",
    },
    {
      title: "Sleep Duration",
      value: sleep.toFixed(1),
      unit: "hours",
      goal: "Your saved sleep record",
      icon: <Moon size={23} />,
      color: "bg-indigo-100 text-indigo-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-medium text-violet-700">
          Loading your daily activity...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* Page heading */}
      <section>
        <p className="text-sm font-semibold text-violet-600">
          YOUR DAILY WELLNESS
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Activity Tracking
        </h1>

        <p className="mt-2 text-gray-500">
          Track your daily movement and healthy habits.
        </p>

        <p className="mt-2 text-sm font-medium text-gray-400">
          Date: {today}
        </p>

        {saving && (
          <p className="mt-2 text-sm text-violet-600">
            Saving your activity...
          </p>
        )}

        {message && (
          <p
            role="status"
            className="mt-3 rounded-xl bg-violet-50 p-3 text-sm text-violet-700"
          >
            {message}
          </p>
        )}
      </section>

      {/* Activity cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {activities.map((activity) => (
          <article
            key={activity.title}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                {activity.title}
              </p>

              <div className={`rounded-xl p-3 ${activity.color}`}>
                {activity.icon}
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {activity.value}
              </h2>

              <span className="text-sm text-gray-500">
                {activity.unit}
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              {activity.goal}
            </p>
          </article>
        ))}
      </section>

      {/* Step progress and water tracker */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Step goal */}
        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
              <Target size={23} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Daily Step Goal
              </h2>

              <p className="text-sm text-gray-500">
                Keep moving towards your goal.
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-900">
              {steps.toLocaleString()}
            </p>

            <p className="text-sm font-semibold text-violet-700">
              {Math.round(stepProgress)}%
            </p>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-violet-600 transition-all"
              style={{ width: `${stepProgress}%` }}
            />
          </div>

          <p className="mt-3 text-sm text-gray-500">
            {Math.max(stepGoal - steps, 0).toLocaleString()} steps remaining
          </p>

          <label
            htmlFor="steps-input"
            className="mt-5 block text-sm font-medium text-gray-700"
          >
            Update your steps
          </label>

          <input
            id="steps-input"
            type="number"
            min="0"
            max="100000"
            step="1"
            value={steps}
            onChange={(event) =>
              handleNumberChange("steps", event.target.value, 100000)
            }
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </article>

        {/* Water tracker */}
        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-100 p-3 text-sky-700">
              <Droplets size={23} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Water Tracker
              </h2>

              <p className="text-sm text-gray-500">
                Add or remove a 250 ml serving.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {(water / 1000).toFixed(2)} L
            </p>

            <p className="text-sm text-gray-500">
              of {(waterGoal / 1000).toFixed(1)} L
            </p>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-sky-100">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${waterProgress}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-gray-500">
            {Math.round(waterProgress)}% of daily goal
          </p>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={removeWater}
              disabled={water === 0 || saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <Minus size={18} />
              Remove
            </button>

            <button
              type="button"
              onClick={addWater}
              disabled={water >= 5000 || saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-40"
            >
              <Plus size={18} />
              Add 250 ml
            </button>
          </div>
        </article>
      </section>

      {/* Calories and workout tracker */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">

        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-700">
              <Flame size={23} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Calories Burned
              </h2>

              <p className="text-sm text-gray-500">
                Enter your activity calories.
              </p>
            </div>
          </div>

          <label
            htmlFor="calories-input"
            className="mt-5 block text-sm font-medium text-gray-700"
          >
            Calories (kcal)
          </label>

          <input
            id="calories-input"
            type="number"
            min="0"
            max="10000"
            value={calories}
            onChange={(event) =>
              handleNumberChange("calories", event.target.value, 10000)
            }
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <Dumbbell size={23} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Workout Duration
              </h2>

              <p className="text-sm text-gray-500">
                Enter your total workout time.
              </p>
            </div>
          </div>

          <label
            htmlFor="workout-input"
            className="mt-5 block text-sm font-medium text-gray-700"
          >
            Workout minutes
          </label>

          <input
            id="workout-input"
            type="number"
            min="0"
            max="1440"
            value={workoutMinutes}
            onChange={(event) =>
              handleNumberChange("workoutMinutes", event.target.value, 1440)
            }
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </article>
      </section>

      {/* Sleep entry */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
            <Moon size={23} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Sleep Tracker
            </h2>

            <p className="text-sm text-gray-500">
              Enter the number of hours you slept.
            </p>
          </div>
        </div>

        <label
          htmlFor="sleep-input"
          className="mt-5 block text-sm font-medium text-gray-700"
        >
          Sleep duration (hours)
        </label>

        <input
          id="sleep-input"
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={sleep}
          onChange={(event) =>
            handleNumberChange("sleepHours", event.target.value, 24)
          }
          className="mt-2 w-full max-w-xs rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </section>

      <p className="text-xs text-gray-400">
        Your activity is saved to your FitTrack account in MongoDB.
        Steps and calories must be entered manually; they are not
        automatically measured by your device.
      </p>
    </div>
  );
}
    