import { useEffect, useState } from "react";
import {
  Apple,
  Flame,
  Beef,
  Calculator,
  Utensils,
  Trash2,
  Search,
  Plus,
} from "lucide-react";
import foodDatabase from "../data/foodDatabase";
import NutritionGoalCalculator from "../components/NutritionGoalCalculator";
import API from "../services/api";

const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFoodLogs(responseData) {
  const foods = Array.isArray(responseData?.foods) ? responseData.foods : [];
  return foods.map((entry) => ({
    ...entry,
    logId: entry._id || entry.id,
    name: entry.foodName || entry.name || "Food",
    // The current FoodLog schema stores nutrients already scaled to quantity,
    // but does not persist quantity. Use 100g as a display fallback.
    quantity: entry.quantity || 100,
  }));
}

export default function Nutrition() {
  const [height, setHeight] = useState("165");
  const [weight, setWeight] = useState("65");
  const [bmi, setBmi] = useState(null);

  const [foodQuery, setFoodQuery] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [mealType, setMealType] = useState("breakfast");
  const [foodLog, setFoodLog] = useState([]);
  const [foodMessage, setFoodMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const [customFood, setCustomFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  useEffect(() => {
    fetchFoodLogs();
  }, []);

  async function fetchFoodLogs() {
    try {
      setLoading(true);
      const response = await API.get("/food-logs");
      setFoodLog(formatFoodLogs(response.data));
    } catch (error) {
      setFoodMessage(
        error.response?.data?.message || "Unable to load your food logs."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredFoods = foodDatabase.filter((food) =>
    food.name.toLowerCase().includes(foodQuery.trim().toLowerCase())
  );

  // The backend stores nutrient totals scaled to the selected quantity.
  const totalNutrition = foodLog.reduce(
    (total, entry) => ({
      calories: total.calories + Number(entry.calories || 0),
      protein: total.protein + Number(entry.protein || 0),
      carbs: total.carbs + Number(entry.carbs || 0),
      fat: total.fat + Number(entry.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  async function addFood(food) {
    const grams = Number(quantity);
    if (!Number.isFinite(grams) || grams <= 0 || grams > 5000) {
      setFoodMessage("Enter a quantity between 1 and 5000 grams.");
      return false;
    }

    try {
      setSaving(true);
      setFoodMessage("");
      const factor = grams / 100;
      const foodData = {
        foodName: food.name,
        mealType,
        calories: Number((Number(food.calories) * factor).toFixed(2)),
        protein: Number((Number(food.protein) * factor).toFixed(2)),
        carbs: Number((Number(food.carbs) * factor).toFixed(2)),
        fat: Number((Number(food.fat) * factor).toFixed(2)),
        date: getTodayDate(),
      };

      await API.post("/food-logs", foodData);
      const refreshed = await API.get("/food-logs");
      setFoodLog(formatFoodLogs(refreshed.data));
      setFoodMessage(`${food.name} added successfully!`);
      return true;
    } catch (error) {
      setFoodMessage(
        error.response?.data?.message || "Unable to add food. Please try again."
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function removeFood(logId) {
    if (!logId) {
      setFoodMessage("This food entry has no valid ID. Refresh the page and try again.");
      return;
    }
    try {
      setFoodMessage("");
      await API.delete(`/food-logs/${logId}`);
      setFoodLog((previous) => previous.filter((entry) => entry.logId !== logId));
      setFoodMessage("Food removed from your log.");
    } catch (error) {
      setFoodMessage(error.response?.data?.message || "Unable to remove food.");
    }
  }

  async function addCustomFood(event) {
    event.preventDefault();
    const name = customFood.name.trim();
    const fields = [customFood.calories, customFood.protein, customFood.carbs, customFood.fat];

    if (!name || fields.some((value) => value.trim() === "")) {
      setFoodMessage("Please complete all food details.");
      return;
    }

    const values = fields.map(Number);
    if (values.some((value) => !Number.isFinite(value) || value < 0 || value > 1000)) {
      setFoodMessage("Enter valid nutrition values between 0 and 1000.");
      return;
    }

    const [calories, protein, carbs, fat] = values;
    const added = await addFood({ name, calories, protein, carbs, fat });
    if (added) {
      setCustomFood({ name: "", calories: "", protein: "", carbs: "", fat: "" });
      setShowCustomForm(false);
    }
  }

  function calculateBMI(event) {
    event.preventDefault();
    const heightInMetres = Number(height) / 100;
    const weightInKg = Number(weight);

    if (!Number.isFinite(heightInMetres) || !Number.isFinite(weightInKg) || heightInMetres <= 0 || weightInKg <= 0) {
      setBmi(null);
      return;
    }

    const value = weightInKg / (heightInMetres * heightInMetres);
    let category = "Obesity range";
    if (value < 18.5) category = "Underweight range";
    else if (value < 25) category = "Healthy weight range";
    else if (value < 30) category = "Overweight range";

    setBmi({ value: value.toFixed(1), category });
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <section>
        <p className="text-sm font-semibold text-violet-600">
          EAT WELL, FEEL WELL
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Nutrition Tracker
        </h1>

        <p className="mt-2 text-gray-500">
          Search foods, track your nutrients and monitor your BMI.
        </p>
      </section>

      {/* Dynamic nutrition summary */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <SummaryCard
          title="Calories"
          value={Math.round(totalNutrition.calories).toLocaleString()}
          unit="kcal"
          description="Calories from logged foods"
          icon={<Flame size={22} />}
          color="bg-orange-100 text-orange-700"
        />

        <SummaryCard
          title="Protein"
          value={totalNutrition.protein.toFixed(1)}
          unit="g"
          description="Protein from logged foods"
          icon={<Beef size={22} />}
          color="bg-violet-100 text-violet-700"
        />

        <SummaryCard
          title="Foods Logged"
          value={foodLog.length}
          unit="items"
          description="Your current food log"
          icon={<Apple size={22} />}
          color="bg-emerald-100 text-emerald-700"
        />
      </section>

      {/* Food search */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <Search size={23} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Food Tracker
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Search food, enter its weight and add it to your daily log.
            </p>
          </div>
        </div>

        <label
          htmlFor="food-search"
          className="mt-5 block text-sm font-medium text-gray-700"
        >
          Search food
        </label>

        <input
          id="food-search"
          value={foodQuery}
          onChange={(event) => setFoodQuery(event.target.value)}
          placeholder="Search rice, chicken, banana..."
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />

        <label
          htmlFor="food-quantity"
          className="mt-4 block text-sm font-medium text-gray-700"
        >
          Quantity (grams)
        </label>

        <input
          id="food-quantity"
          type="number"
          min="1"
          max="5000"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />

        <label htmlFor="meal-type" className="mt-4 block text-sm font-medium text-gray-700">
          Meal type
        </label>
        <select
          id="meal-type"
          value={mealType}
          onChange={(event) => setMealType(event.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500"
        >
          {mealTypes.map((meal) => (
            <option key={meal} value={meal}>
              {meal.charAt(0).toUpperCase() + meal.slice(1)}
            </option>
          ))}
        </select>

        {foodMessage && (
          <p
            role="status"
            className="mt-3 rounded-lg bg-violet-50 p-3 text-sm text-violet-700"
          >
            {foodMessage}
          </p>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {filteredFoods.map((food) => (
            <article
              key={food.id}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <h3 className="font-semibold text-gray-900">
                {food.name}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Per 100 g
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <p>Calories: {food.calories} kcal</p>
                <p>Protein: {food.protein} g</p>
                <p>Carbs: {food.carbs} g</p>
                <p>Fat: {food.fat} g</p>
              </div>

              <button
                type="button"
                onClick={() => addFood(food)}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus size={16} />
                Add Food
              </button>
            </article>
          ))}

          {filteredFoods.length === 0 && (
            <p className="text-sm text-gray-500">
              No matching food found. You can add a custom food below.
            </p>
          )}
        </div>

        {/* Custom food form */}
        <div className="mt-6 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={() => setShowCustomForm((previous) => !previous)}
            className="rounded-xl border border-violet-200 px-4 py-3 font-semibold text-violet-700 hover:bg-violet-50"
          >
            {showCustomForm ? "Cancel" : "+ Add Custom Food"}
          </button>

          {showCustomForm && (
            <form
              onSubmit={addCustomFood}
              className="mt-5 space-y-4 rounded-xl bg-gray-50 p-4"
            >
              <h3 className="font-semibold text-gray-900">
                Enter custom food details
              </h3>

              <p className="text-sm text-gray-500">
                Enter all nutrition values per 100 g.
              </p>

              <label className="block text-sm font-medium text-gray-700">
                Food name
                <input
                  required
                  value={customFood.name}
                  onChange={(event) =>
                    setCustomFood({
                      ...customFood,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Homemade vegetable upma"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3"
                />
              </label>

              {[
                ["calories", "Calories (kcal)"],
                ["protein", "Protein (g)"],
                ["carbs", "Carbohydrates (g)"],
                ["fat", "Fat (g)"],
              ].map(([field, label]) => (
                <label
                  key={field}
                  className="block text-sm font-medium text-gray-700"
                >
                  {label}

                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="any"
                    required
                    value={customFood[field]}
                    onChange={(event) =>
                      setCustomFood({
                        ...customFood,
                        [field]: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3"
                  />
                </label>
              ))}

              <button
                type="submit"
                className="w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700"
              >
                Save and Add Food
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Today's food log */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
            <Utensils size={23} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Today's Food Log
            </h2>

            <p className="text-sm text-gray-500">
              Your saved foods and calculated nutrient totals.
            </p>
          </div>
        </div>

        {/* Total calories, protein, carbs and fat */}
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

        {loading ? (
          <p className="mt-5 text-sm text-gray-500">Loading your food logs...</p>
        ) : foodLog.length === 0 ? (
          <div className="mt-5 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <Apple size={30} className="mx-auto text-gray-400" />

            <p className="mt-3 font-medium text-gray-700">
              No foods added yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Search for a food above and click Add Food.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {foodLog.map((entry) => {
              const factor = Number(entry.quantity) / 100;

              return (
                <article
                  key={entry.logId}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gray-50 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {entry.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {entry.quantity} g ·{" "}
                      {(entry.calories * factor).toFixed(1)} kcal
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>
                        Protein: {(entry.protein * factor).toFixed(1)} g
                      </span>

                      <span>
                        Carbs: {(entry.carbs * factor).toFixed(1)} g
                      </span>

                      <span>
                        Fat: {(entry.fat * factor).toFixed(1)} g
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFood(entry.logId)}
                    aria-label={`Remove ${entry.name}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
<NutritionGoalCalculator
  height={height}
  weight={weight}
  totalNutrition={totalNutrition}
/>
      {/* BMI calculator */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
              <Calculator size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                BMI Calculator
              </h2>

              <p className="text-sm text-gray-500">
                Enter your height and weight.
              </p>
            </div>
          </div>

          <form onSubmit={calculateBMI} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="height"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Height (cm)
              </label>

              <input
                id="height"
                type="number"
                min="1"
                max="250"
                step="any"
                required
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                placeholder="e.g. 165"
              />
            </div>

            <div>
              <label
                htmlFor="weight"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Weight (kg)
              </label>

              <input
                id="weight"
                type="number"
                min="1"
                max="500"
                step="any"
                required
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                placeholder="e.g. 65"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700"
            >
              Calculate BMI
            </button>
          </form>
        </div>

        <div className="flex flex-col justify-center rounded-2xl bg-violet-600 p-7 text-white">
          <p className="text-sm font-medium text-violet-100">
            YOUR BODY MASS INDEX
          </p>

          {bmi ? (
            <>
              <h2 className="mt-4 text-5xl font-bold">{bmi.value}</h2>

              <p className="mt-3 text-lg font-semibold">
                {bmi.category}
              </p>

              <p className="mt-3 text-sm leading-6 text-violet-100">
                BMI is a screening measure, not a diagnosis. Interpret it
                alongside other health factors.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-4 text-2xl font-bold">
                Your result appears here
              </h2>

              <p className="mt-3 text-sm leading-6 text-violet-100">
                Enter your height and weight, then select Calculate BMI.
              </p>
            </>
          )}

          <div className="mt-6 rounded-xl bg-white/10 p-4">
            <p className="text-sm font-semibold">Adult BMI reference</p>

            <p className="mt-2 text-sm text-violet-100">
              Below 18.5: Underweight
              <br />
              18.5–24.9: Healthy weight range
              <br />
              25–29.9: Overweight range
              <br />
              30 and above: Obesity range
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  unit,
  description,
  icon,
  color,
}) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <div className={`rounded-xl p-3 ${color}`}>{icon}</div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>

        <span className="text-sm text-gray-500">{unit}</span>
      </div>

      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </article>
  );
}