
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Dumbbell,
  Clock,
  Play,
  CheckCircle,
} from "lucide-react";
import API from "../services/api";

const exercises = [
  {
    id: 1,
    name: "Full Body Workout",
    category: "Strength",
    duration: 25,
    difficulty: "Beginner",
    description: "A simple full-body strength session.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&auto=format&fit=crop",
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: 2,
    name: "Brisk Walking",
    category: "Cardio",
    duration: 30,
    difficulty: "Easy",
    description: "Improve endurance with a brisk walk.",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=700&auto=format&fit=crop",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: 3,
    name: "Morning Yoga",
    category: "Yoga",
    duration: 15,
    difficulty: "Beginner",
    description: "Gentle movement and stretching.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&auto=format&fit=crop",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 4,
    name: "Jumping Jacks",
    category: "Cardio",
    duration: 10,
    difficulty: "Intermediate",
    description: "A quick cardio exercise.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&auto=format&fit=crop",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: 5,
    name: "Dumbbell Workout",
    category: "Strength",
    duration: 20,
    difficulty: "Intermediate",
    description: "Build strength with dumbbell exercises.",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&auto=format&fit=crop",
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: 6,
    name: "Relaxing Stretch",
    category: "Yoga",
    duration: 12,
    difficulty: "Easy",
    description: "Stretch and relax after activity.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=700&auto=format&fit=crop",
    color: "bg-emerald-100 text-emerald-700",
  },
];  

const categories = ["All", "Cardio", "Strength", "Yoga"];

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeWorkout = (workout) => ({
  ...workout,
  id: workout._id || workout.id,
  name: workout.workoutName || workout.name,
  duration: Number(workout.duration) || 0,
  category: workout.category || "Other",
});

export default function Workout() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [routine, setRoutine] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch saved workouts from MongoDB
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);

        const response = await API.get("/workouts");

        const workouts =
          response.data.workouts ||
          response.data.data ||
          [];

        setRoutine(workouts.map(normalizeWorkout));
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Unable to load your workouts."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const filteredExercises =
    selectedCategory === "All"
      ? exercises
      : exercises.filter(
          (exercise) => exercise.category === selectedCategory
        );

  // Add workout to MongoDB
  async function addToRoutine(exercise) {
    const alreadyAdded = routine.some(
      (item) => item.name === exercise.name
    );

    if (alreadyAdded) {
      setMessage("This workout is already in your routine.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await API.post("/workouts", {
        workoutName: exercise.name,
        category: exercise.category,
        duration: exercise.duration,
        caloriesBurned: 0,
        date: getTodayDate(),
        completed: false,
      });

      const savedWorkout =
        response.data.workout ||
        response.data.data;

      if (savedWorkout) {
        setRoutine((previous) => [
          ...previous,
          normalizeWorkout(savedWorkout),
        ]);
      } else {
        // If the API returns only a success message,
        // refresh the workout list from the database.
        const refreshed = await API.get("/workouts");
        const workouts =
          refreshed.data.workouts ||
          refreshed.data.data ||
          [];

        setRoutine(workouts.map(normalizeWorkout));
      }

      setMessage(`${exercise.name} added to your routine!`);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to add workout. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete workout from MongoDB
  async function removeFromRoutine(id) {
    try {
      setMessage("");

      await API.delete(`/workouts/${id}`);

      setRoutine((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (activeWorkout?.id === id) {
        setActiveWorkout(null);
      }

      setMessage("Workout removed successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to remove workout."
      );
    }
  }

  // Mark workout as completed in MongoDB
  async function completeWorkout() {
    if (!activeWorkout) return;

    try {
      setSaving(true);
      setMessage("");

      await API.patch(`/workouts/${activeWorkout.id}`, {
        completed: true,
      });

      setRoutine((previous) =>
        previous.map((item) =>
          item.id === activeWorkout.id
            ? { ...item, completed: true }
            : item
        )
      );

      setMessage(
        `${activeWorkout.name} completed successfully!`
      );

      setActiveWorkout(null);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to update workout status."
      );
    } finally {
      setSaving(false);
    }
  }

  const totalMinutes = routine.reduce(
    (total, item) => total + item.duration,
    0
  );

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <section>
        <p className="text-sm font-semibold text-violet-600">
          MOVE YOUR WAY
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Workout Library
        </h1>

        <p className="mt-2 text-gray-500">
          Choose activities and build a routine that suits you.
        </p>
      </section>

      {/* Success or error message */}
      {message && (
        <div
          role="status"
          className="rounded-xl bg-violet-50 p-4 text-sm text-violet-700"
        >
          {message}
        </div>
      )}

      {/* Category filters */}
      <section className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              selectedCategory === category
                ? "bg-violet-600 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-violet-50"
            }`}
          >
            {category}
          </button>
        ))}
      </section>

      {/* Exercise cards */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Explore Workouts
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredExercises.map((exercise) => {
            const isAdded = routine.some(
              (item) => item.name === exercise.name
            );

            return (
              <article
                key={exercise.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
               <img
  src={exercise.image}
  alt={exercise.name}
  className="mb-4 h-44 w-full rounded-xl object-cover"
  loading="lazy"
/>

<div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-xl p-3 ${exercise.color}`}>
                    <Dumbbell size={24} />
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {exercise.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">
                  {exercise.name}
                </h3>

                <p className="mt-2 min-h-10 text-sm text-gray-500">
                  {exercise.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{exercise.category}</span>

                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {exercise.duration} min
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => addToRoutine(exercise)}
                  disabled={isAdded || saving}
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isAdded
                      ? "cursor-not-allowed bg-emerald-50 text-emerald-700"
                      : "bg-violet-600 text-white hover:bg-violet-700"
                  }`}
                >
                  <Plus size={18} />
                  {isAdded ? "Added to Routine" : "Add to Routine"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* My Routine */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              My Routine
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {routine.length} workout(s) selected · {totalMinutes} minutes planned
            </p>
          </div>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-gray-500">
            Loading your workouts...
          </p>
        ) : routine.length === 0 ? (
          <div className="mt-5 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <Dumbbell size={32} className="mx-auto text-gray-400" />

            <p className="mt-3 font-medium text-gray-700">
              Your routine is empty
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Add workouts from the library above.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {routine.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.duration} minutes · {item.category}
                  </p>

                  {item.completed && (
                    <span className="mt-2 inline-block text-xs font-medium text-emerald-700">
                      Completed
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {!item.completed && (
                    <button
                      type="button"
                      onClick={() => {
                        setMessage("");
                        setActiveWorkout(item);
                      }}
                      className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
                    >
                      <Play size={16} />
                      Start
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeFromRoutine(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Start / complete workout dialog */}
      {activeWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Dumbbell size={24} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Ready to get moving?
            </h2>

            <p className="mt-3 text-gray-600">
              {activeWorkout.name} · {activeWorkout.duration} minutes
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Complete this session to update its status in your workout history.
            </p>

            <button
              type="button"
              onClick={completeWorkout}
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <CheckCircle size={18} />
              {saving ? "Saving..." : "Complete Workout"}
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkout(null)}
              disabled={saving}
              className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
