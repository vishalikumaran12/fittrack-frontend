
import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [activities, setActivities] = useState([]);
  const [foods, setFoods] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  const [error, setError] = useState("");

  // Fetch all registered users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await API.get("/admin/users");
        const userList = response.data.users || [];

        setUsers(userList);

        if (userList.length > 0) {
          setSelectedUser(userList[0]._id);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load users."
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch selected user's activities
  useEffect(() => {
    if (!selectedUser) {
      setActivities([]);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);

        const response = await API.get(
          `/admin/users/${selectedUser}/activities`
        );

        setActivities(response.data.activities || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load activities."
        );
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [selectedUser]);

  // Fetch selected user's food logs
  useEffect(() => {
    if (!selectedUser) {
      setFoods([]);
      return;
    }

    const fetchFoods = async () => {
      try {
        setLoadingFoods(true);

        const response = await API.get(
          `/admin/users/${selectedUser}/food-logs`
        );

        setFoods(response.data.foods || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load food history."
        );
        setFoods([]);
      } finally {
        setLoadingFoods(false);
      }
    };

    fetchFoods();
  }, [selectedUser]);

  // Fetch selected user's workout history
  useEffect(() => {
    if (!selectedUser) {
      setWorkouts([]);
      return;
    }

    const fetchWorkouts = async () => {
      try {
        setLoadingWorkouts(true);

        const response = await API.get(
          `/admin/users/${selectedUser}/workouts`
        );

        setWorkouts(response.data.workouts || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load workout history."
        );
        setWorkouts([]);
      } finally {
        setLoadingWorkouts(false);
      }
    };

    fetchWorkouts();
  }, [selectedUser]);

  const selectedUserDetails = users.find(
    (user) => user._id === selectedUser
  );

  // Apply common date filter
  const filteredActivities = selectedDate
    ? activities.filter((item) => item.date === selectedDate)
    : activities;

  const filteredFoods = selectedDate
    ? foods.filter((item) => item.date === selectedDate)
    : foods;

  const filteredWorkouts = selectedDate
    ? workouts.filter((item) => item.date === selectedDate)
    : workouts;

  // Calculate nutrition totals
  const totalNutrition = filteredFoods.reduce(
    (total, food) => ({
      calories: total.calories + Number(food.calories || 0),
      protein: total.protein + Number(food.protein || 0),
      carbs: total.carbs + Number(food.carbs || 0),
      fat: total.fat + Number(food.fat || 0),
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  );

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6">
      {/* Heading */}
      <section>
        <p className="text-sm font-semibold text-violet-600">
          FITTRACK ADMIN PANEL
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Monitor registered users, daily activities, workouts and nutrition.
        </p>
      </section>

      {/* Error message */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Overview cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Registered Users
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {loadingUsers ? "..." : users.length}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Activity Records</p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {activities.length}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Food Records</p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {foods.length}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Workout Records</p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {workouts.length}
          </h2>
        </div>
      </section>

      {/* Registered users */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Registered Users
        </h2>

        {loadingUsers ? (
          <p className="mt-4 text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="mt-4 text-gray-500">
            No registered users found.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b last:border-0">
                    <td className="p-3 font-medium text-gray-900">
                      {user.name}
                    </td>

                    <td className="p-3 text-gray-600">
                      {user.email}
                    </td>

                    <td className="p-3 capitalize text-gray-600">
                      {user.role}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user._id);
                          setSelectedDate("");
                          setError("");
                        }}
                        className="rounded-lg bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-200"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Date filter */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            User Report
          </h2>

          {selectedUserDetails && (
            <p className="mt-1 text-sm text-gray-500">
              {selectedUserDetails.name} · {selectedUserDetails.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="report-date"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Filter all reports by date
          </label>

          <div className="flex gap-2">
            <input
              id="report-date"
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
              className="rounded-lg border border-gray-300 px-3 py-2"
            />

            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* Daily activity */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          User Daily Activity
        </h2>

        {loadingActivities ? (
          <p className="mt-5 text-gray-500">
            Loading activity records...
          </p>
        ) : !selectedUser ? (
          <p className="mt-5 text-gray-500">
            Select a user to view activity.
          </p>
        ) : filteredActivities.length === 0 ? (
          <p className="mt-5 rounded-xl bg-gray-50 p-5 text-center text-gray-500">
            No activity records found for this date.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="p-3">Date</th>
                  <th className="p-3">Steps</th>
                  <th className="p-3">Calories</th>
                  <th className="p-3">Water (ml)</th>
                  <th className="p-3">Sleep (hrs)</th>
                  <th className="p-3">Workout (mins)</th>
                </tr>
              </thead>

              <tbody>
                {filteredActivities.map((activity) => (
                  <tr
                    key={activity._id}
                    className="border-b last:border-0"
                  >
                    <td className="p-3">{activity.date}</td>
                    <td className="p-3">{activity.steps ?? 0}</td>
                    <td className="p-3">{activity.calories ?? 0}</td>
                    <td className="p-3">{activity.water ?? 0}</td>
                    <td className="p-3">{activity.sleep ?? 0}</td>
                    <td className="p-3">
                      {activity.workoutMinutes ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Workout history */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            FITNESS REPORT
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900">
            User Workout History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Workout details and performance for the selected user.
          </p>
        </div>

        {loadingWorkouts ? (
          <p className="mt-5 text-gray-500">
            Loading workout history...
          </p>
        ) : !selectedUser ? (
          <p className="mt-5 text-gray-500">
            Select a user to view workout history.
          </p>
        ) : filteredWorkouts.length === 0 ? (
          <p className="mt-5 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-500">
            No workout records found for this selection.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="p-3">Date</th>
                  <th className="p-3">Workout Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Calories Burned</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredWorkouts.map((workout) => (
                  <tr
                    key={workout._id}
                    className="border-b last:border-0"
                  >
                    <td className="p-3">{workout.date}</td>

                    <td className="p-3 font-medium text-gray-900">
                      {workout.workoutName}
                    </td>

                    <td className="p-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                        {workout.category || "General"}
                      </span>
                    </td>

                    <td className="p-3">
                      {workout.duration ?? 0} mins
                    </td>

                    <td className="p-3">
                      {workout.caloriesBurned ?? 0} kcal
                    </td>

                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          workout.completed
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {workout.completed ? "Completed" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Food history */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            NUTRITION REPORT
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900">
            User Food History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Food records and nutrient details for the selected user.
          </p>
        </div>

        {/* Nutrition summary */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Calories", totalNutrition.calories, "kcal"],
            ["Protein", totalNutrition.protein, "g"],
            ["Carbs", totalNutrition.carbs, "g"],
            ["Fat", totalNutrition.fat, "g"],
          ].map(([label, value, unit]) => (
            <div key={label} className="rounded-xl bg-violet-50 p-4">
              <p className="text-sm text-gray-500">{label}</p>

              <p className="mt-2 text-xl font-bold text-gray-900">
                {value.toFixed(1)} {unit}
              </p>
            </div>
          ))}
        </div>

        {loadingFoods ? (
          <p className="mt-5 text-gray-500">
            Loading food history...
          </p>
        ) : !selectedUser ? (
          <p className="mt-5 text-gray-500">
            Select a user to view food history.
          </p>
        ) : filteredFoods.length === 0 ? (
          <p className="mt-5 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-500">
            No food records found for this selection.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="p-3">Date</th>
                  <th className="p-3">Food Name</th>
                  <th className="p-3">Meal Type</th>
                  <th className="p-3">Calories</th>
                  <th className="p-3">Protein</th>
                  <th className="p-3">Carbs</th>
                  <th className="p-3">Fat</th>
                </tr>
              </thead>

              <tbody>
                {filteredFoods.map((food) => (
                  <tr
                    key={food._id}
                    className="border-b last:border-0"
                  >
                    <td className="p-3">{food.date}</td>

                    <td className="p-3 font-medium text-gray-900">
                      {food.foodName}
                    </td>

                    <td className="p-3">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                        {food.mealType}
                      </span>
                    </td>

                    <td className="p-3">
                      {Number(food.calories || 0).toFixed(1)} kcal
                    </td>

                    <td className="p-3">
                      {Number(food.protein || 0).toFixed(1)} g
                    </td>

                    <td className="p-3">
                      {Number(food.carbs || 0).toFixed(1)} g
                    </td>

                    <td className="p-3">
                      {Number(food.fat || 0).toFixed(1)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
