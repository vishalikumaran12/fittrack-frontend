
import { useState } from "react";
import { Flame, Beef, Wheat, Target } from "lucide-react";

export default function NutritionGoalCalculator({
  height,
  weight,
  totalNutrition,
}) {
  const [age, setAge] = useState("22");
  const [sex, setSex] = useState("female");
  const [activity, setActivity] = useState("1.375");
  const [goal, setGoal] = useState("lose");

  const heightCm = Number(height);
  const weightKg = Number(weight);
  const ageYears = Number(age);

  const valid =
    heightCm > 0 &&
    weightKg > 0 &&
    ageYears >= 18 &&
    ageYears <= 100;

  let targets = null;

  if (valid) {
    const bmr =
      10 * weightKg +
      6.25 * heightCm -
      5 * ageYears +
      (sex === "male" ? 5 : -161);

    const maintenance = Math.round(bmr * Number(activity));

    const calories =
      goal === "lose" ? maintenance - 400 : maintenance;

    // Use current weight unless BMI-based reference weight is lower.
    const heightM = heightCm / 100;
    const referenceWeight = 25 * heightM * heightM;
    const proteinWeight = Math.min(weightKg, referenceWeight);

    const protein = Math.round(proteinWeight * 1.6);
    const fat = Math.round((calories * 0.25) / 9);
    const carbs = Math.max(
      0,
      Math.round((calories - protein * 4 - fat * 9) / 4)
    );

    targets = { calories, maintenance, protein, carbs, fat };
  }

  const items = targets
    ? [
        {
          label: "Daily calories",
          target: targets.calories,
          consumed: totalNutrition.calories,
          unit: "kcal",
          icon: Flame,
          color: "text-orange-600",
        },
        {
          label: "Protein",
          target: targets.protein,
          consumed: totalNutrition.protein,
          unit: "g",
          icon: Beef,
          color: "text-green-600",
        },
        {
          label: "Carbohydrates",
          target: targets.carbs,
          consumed: totalNutrition.carbs,
          unit: "g",
          icon: Wheat,
          color: "text-yellow-600",
        },
      ]
    : [];

  return (
    <section className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <Target className="text-violet-600" size={25} />
          <h2 className="text-xl font-bold text-gray-900">
            Daily Nutrition Goals
          </h2>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Estimate your daily calorie and macronutrient needs.
          Update your height and weight in the BMI calculator.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">
          Age
          <input
            type="number"
            min="18"
            max="100"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
          />
        </label>

        <label className="text-sm font-medium text-gray-700">
          Sex used for calorie estimate
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </label>

        <label className="text-sm font-medium text-gray-700">
          Activity level
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
          >
            <option value="1.2">Sedentary — little exercise</option>
            <option value="1.375">Light — 1–3 days/week</option>
            <option value="1.55">Moderate — 3–5 days/week</option>
            <option value="1.725">Very active — 6–7 days/week</option>
          </select>
        </label>

        <label className="text-sm font-medium text-gray-700">
          Your goal
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
          >
            <option value="maintain">Maintain weight</option>
            <option value="lose">Lose weight gradually</option>
          </select>
        </label>
      </div>

      {!valid ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Enter a valid height, weight and age (18–100) in the fields.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-violet-50 p-4">
              <p className="text-sm text-gray-600">
                Estimated maintenance calories
              </p>
              <p className="mt-2 text-2xl font-bold text-violet-700">
                {targets.maintenance.toLocaleString()} kcal
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-gray-600">
                Your daily calorie target
              </p>
              <p className="mt-2 text-2xl font-bold text-green-700">
                {targets.calories.toLocaleString()} kcal
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {items.map((item) => {
              const Icon = item.icon;
              const percent =
                item.target > 0
                  ? Math.min(
                      100,
                      (item.consumed / item.target) * 100
                    )
                  : 0;

              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-gray-100 p-4"
                >
                  <Icon className={item.color} size={23} />
                  <p className="mt-3 text-sm text-gray-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {Math.round(item.consumed)} / {item.target}{" "}
                    {item.unit}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {Math.round(percent)}% of target
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">
              Estimated daily macro targets
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <p>Protein: <strong>{targets.protein} g</strong></p>
              <p>Carbs: <strong>{targets.carbs} g</strong></p>
              <p>Fat: <strong>{targets.fat} g</strong></p>
            </div>
          </div>

          <p className="text-xs leading-5 text-gray-500">
            Estimates only, based on a standard calorie equation.
            Actual needs vary. The calculator is designed for adults;
            calorie and macro targets should be reviewed with a qualified
            professional, especially if pregnant, breastfeeding, or managing
            a medical condition. Do not follow a very low calorie target
            without professional guidance.
          </p>
        </>
      )}
    </section>
  );
}
