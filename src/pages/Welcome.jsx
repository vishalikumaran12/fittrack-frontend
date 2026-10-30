
import { Link } from "react-router-dom";
import { Activity, Heart, Target, ArrowRight } from "lucide-react";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-600 p-3 text-white">
            <Activity size={23} />
          </div>
          <span className="text-xl font-bold text-gray-900">
            FitTrack
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
          >
            Login
          </Link>
          <Link
            to="/login?signup=true"
            className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="grid min-h-[75vh] items-center gap-10 px-6 py-12 md:grid-cols-2 md:px-12">
        <section>
          <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
            YOUR JOURNEY, YOUR PACE
          </span>

          <h1 className="mt-7 text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl">
            Build healthier habits,
            <span className="text-violet-600"> one day at a time.</span>
          </h1>

          <p className="mt-5 max-w-xl leading-7 text-gray-500">
            Track your activity, plan workouts, explore nutrition,
            and celebrate every small step towards your wellness goals.
          </p>

          <Link
            to="/login?signup=true"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-4 font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
          >
            Get Started <ArrowRight size={19} />
          </Link>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <div>
              <Activity className="text-violet-600" size={22} />
              <p className="mt-2 text-sm font-semibold">Track Activity</p>
            </div>
            <div>
              <Heart className="text-violet-600" size={22} />
              <p className="mt-2 text-sm font-semibold">Build Habits</p>
            </div>
            <div>
              <Target className="text-violet-600" size={22} />
              <p className="mt-2 text-sm font-semibold">Reach Goals</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 p-8 md:p-12">
          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <p className="text-sm font-medium text-gray-500">
              YOUR DAILY OVERVIEW
            </p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              Every step counts.
            </h2>

            <div className="mt-7 space-y-5">
              <ProgressRow label="Daily steps" value="6,240 / 10,000" percent={62} />
              <ProgressRow label="Water intake" value="1.5 / 2.5 L" percent={60} />
              <ProgressRow label="Weekly activity" value="4 / 5 days" percent={80} />
            </div>

            <p className="mt-7 rounded-xl bg-violet-50 p-4 text-sm text-violet-800">
              Small, consistent habits can make a meaningful difference.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProgressRow({ label, value, percent }) {
  return (
    <div>
      <div className="mb-2 flex justify-between gap-3 text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-violet-600"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
