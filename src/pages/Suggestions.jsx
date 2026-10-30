
import { useEffect, useState } from "react";
import {
  Footprints,
  GlassWater,
  Dumbbell,
  Utensils,
  Moon,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import API from "../services/api";
const suggestions = [
  {
    title: "Reach your step goal",
    category: "Daily Activity",
    description:
      "Start with a short 10-minute walk. Add more steps gradually throughout your day.",
    icon: Footprints,
    color: "bg-blue-100 text-blue-700",
    tip: "Take a short walk after meals.",
  },
  {
    title: "Stay hydrated",
    category: "Water Intake",
    description:
      "Keep a water bottle nearby and drink water regularly throughout the day.",
    icon: GlassWater,
    color: "bg-cyan-100 text-cyan-700",
    tip: "Drink a glass of water when you wake up.",
  },
  {
    title: "Keep moving",
    category: "Workout",
    description:
      "Try a beginner-friendly workout with warm-up, simple strength exercises, and stretching.",
    icon: Dumbbell,
    color: "bg-violet-100 text-violet-700",
    tip: "Start with a comfortable 10–15 minute session.",
  },
  {
    title: "Build balanced meals",
    category: "Nutrition",
    description:
      "Include vegetables, protein-rich foods, whole grains, and fruit in your meals.",
    icon: Utensils,
    color: "bg-orange-100 text-orange-700",
    tip: "Try dal, beans, curd, tofu, or eggs for protein.",
  },
  {
    title: "Create a sleep routine",
    category: "Recovery",
    description:
      "Maintain a consistent bedtime and give yourself enough time to rest and recover.",
    icon: Moon,
    color: "bg-indigo-100 text-indigo-700",
    tip: "Reduce screen time before going to bed.",
  },
];

function getPersonalizedTips(fitness) {
  const tips = [];

  if ((Number(fitness.steps) || 0) < 5000) {
    tips.push({
      title: "Take your next walking break",
      text: "Your recorded steps are below 5,000. Try a short walk if it suits your energy level.",
    });
  } else {
    tips.push({
      title: "Keep up your movement",
      text: "You've recorded 5,000 or more steps. Keep building a routine that feels sustainable.",
    });
  }

  if ((Number(fitness.water) || 0) < 1500) {
    tips.push({
      title: "Remember your water breaks",
      text: "Your logged water is below 1.5 litres. Drink regularly and adjust your needs for your activity and climate.",
    });
  } else {
    tips.push({
      title: "Keep tracking hydration",
      text: "You've logged at least 1.5 litres of water. Your hydration needs may vary with heat and activity.",
    });
  }

  if ((Number(fitness.workoutMinutes) || 0) === 0) {
    tips.push({
      title: "Try a little movement today",
      text: "No workout minutes are recorded yet. You can start with gentle stretching or a short walk.",
    });
  } else {
    tips.push({
      title: "Celebrate your workout effort",
      text: `You've recorded ${fitness.workoutMinutes} workout minutes. Allow time for recovery, too.`,
    });
  }

  if ((Number(fitness.sleepHours) || 0) > 0 &&
      Number(fitness.sleepHours) < 7) {
    tips.push({
      title: "Prioritize rest",
      text: "Your logged sleep is under 7 hours. Consider an earlier bedtime if possible.",
    });
  }

  return tips;
}
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
export default function Suggestions() {
  const [fitness, setFitness] = useState({
    steps: 0,
    calories: 0,
    water: 0,
    workoutMinutes: 0,
    sleepHours: 0,
  });

  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDailyProgress = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(
          `/activities/${getTodayDate()}`
        );

        const activity = response.data.activity || {};

        setFitness({
          steps: Number(activity.steps) || 0,
          calories: Number(activity.calories) || 0,
          water: Number(activity.water) || 0,
          workoutMinutes: Number(activity.workoutMinutes) || 0,
          sleepHours: Number(activity.sleep) || 0,
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setFitness({
            steps: 0,
            calories: 0,
            water: 0,
            workoutMinutes: 0,
            sleepHours: 0,
          });
        } else {
          setError("Unable to load today's progress.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDailyProgress();
  }, []);

  const personalizedTips = getPersonalizedTips(fitness);

  function toggleCompleted(title) {
    setCompleted((previous) =>
      previous.includes(title)
        ? previous.filter((item) => item !== title)
        : [...previous, title]
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <Lightbulb size={26} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
            Your wellness guide
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Fitness Suggestions
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500">
            Small, consistent habits can help you build a healthier lifestyle.
            Choose a few suggestions that work for you.
          </p>
        </div>

        <section className="mb-8 rounded-3xl bg-violet-600 p-6 text-white sm:p-8">
          <p className="text-sm font-medium text-violet-100">
            YOUR DAILY PROGRESS
          </p>
{loading && (
  <p className="mt-3 text-sm text-violet-100">
    Updating your daily progress...
  </p>
)}

{error && (
  <p className="mt-3 text-sm text-white">
    {error}
  </p>
)}
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
            <div>
              <p className="text-sm text-violet-100">Steps</p>
              <p className="mt-1 text-2xl font-bold">
                {(Number(fitness.steps) || 0).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-violet-100">Water</p>
              <p className="mt-1 text-2xl font-bold">
                {((Number(fitness.water) || 0) / 1000).toFixed(1)} L
              </p>
            </div>

            <div>
              <p className="text-sm text-violet-100">Workout</p>
              <p className="mt-1 text-2xl font-bold">
                {Number(fitness.workoutMinutes) || 0} min
              </p>
            </div>

            <div>
              <p className="text-sm text-violet-100">Sleep</p>
              <p className="mt-1 text-2xl font-bold">
                {Number(fitness.sleepHours) || 0} hrs
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-5 flex items-center gap-2">
            <RefreshCw className="text-violet-600" size={21} />
            <h2 className="text-xl font-bold text-gray-900">
              Suggestions for you
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {personalizedTips.map((tip) => (
              <article
                key={tip.title}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">
                    {tip.title}
                  </h3>
                  <Lightbulb
                    size={20}
                    className="shrink-0 text-amber-500"
                  />
                </div>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {tip.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            Healthy habits to try
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              const isCompleted = completed.includes(suggestion.title);

              return (
                <article
                  key={suggestion.title}
                  className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${suggestion.color}`}
                    >
                      <Icon size={24} />
                    </div>

                    {isCompleted && (
                      <CheckCircle2
                        size={22}
                        className="text-green-600"
                      />
                    )}
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-violet-600">
                    {suggestion.category}
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-gray-900">
                    {suggestion.title}
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">
                    {suggestion.description}
                  </p>

                  <div className="mt-4 rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-700">
                      QUICK TIP
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {suggestion.tip}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCompleted(suggestion.title)}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isCompleted
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-violet-600 text-white hover:bg-violet-700"
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 size={17} />
                        Done for today
                      </>
                    ) : (
                      "Mark as done"
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <p className="mt-8 text-center text-xs leading-5 text-gray-400">
          These are general wellness suggestions, not personalized medical advice.
          Choose activities and hydration levels suitable for your needs.
        </p>
      </div>
    </div>
  );
  }
