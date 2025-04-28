import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const App = () => {
  const [goals, setGoals] = useState(() => {
    const stored = localStorage.getItem("goals");
    return stored ? JSON.parse(stored) : [];
  });
  const [goalText, setGoalText] = useState("");
  const [target, setTarget] = useState(1);
  const [level, setLevel] = useState("beginner");
  const [reward, setReward] = useState("immediate");
  const [filter, setFilter] = useState("all");
  const [editingGoalId, setEditingGoalId] = useState(null);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  const baseIncrement = (level) => {
    return level === "expert" ? 2 : 1;
  };

  const addGoal = () => {
    if (!goalText || target <= 0) return;

    if (editingGoalId !== null) {
      setGoals(
        goals.map((g) =>
          g.id === editingGoalId
            ? {
                ...g,
                text: goalText,
                target: parseInt(target),
                level,
                reward,
                increment: baseIncrement(level),
                clickCount: g.clickCount || 0,
              }
            : g
        )
      );
      setEditingGoalId(null);
    } else {
      setGoals([
        ...goals,
        {
          id: Date.now(),
          text: goalText,
          progress: 0,
          target: parseInt(target),
          level,
          reward,
          increment: baseIncrement(level),
          clickCount: 0,
        },
      ]);
    }

    setGoalText("");
    setTarget(1);
    setLevel("beginner");
    setReward("immediate");
  };

  const startEditing = (goal) => {
    setGoalText(goal.text);
    setTarget(goal.target);
    setLevel(goal.level);
    setReward(goal.reward);
    setEditingGoalId(goal.id);
    goal.clickCount = 0;
  };

  const updateProgress = (id, direction) => {
    setGoals(
      goals.map((g) => {
        if (g.id === id) {
          const newClickCount = (g.clickCount || 0) + 1;
          const delta = direction * (2 * newClickCount - 1); // +1, +3, +5... or -1, -3, -5...
          const newProgress = Math.min(
            Math.max(g.progress + delta, 0),
            g.target
          );
          const completed = g.progress < g.target && newProgress >= g.target;

          if (completed && g.reward === "immediate") {
            confetti();
          }

          return {
            ...g,
            progress: newProgress,
            clickCount: newClickCount,
          };
        }
        return g;
      })
    );
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.progress >= g.target).length;

  let filteredGoals =
    filter === "all"
      ? goals
      : filter === "completed"
      ? goals.filter((g) => g.progress >= g.target)
      : goals.filter((g) => g.progress < g.target);

  // Filter out only "delayed reward" goals
  const delayedGoals = goals.filter((g) => g.reward === "delayed");

  // Data for the chart
  const chartData = delayedGoals.map((g) => ({
    name: g.text,
    Progress: g.progress,
    Target: g.target,
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-4">🎯 Goal Tracker</h1>

        {/* Tabs for filtering and analysis */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded ${
              filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1 rounded ${
              filter === "active" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1 rounded ${
              filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("analysis")}
            className={`px-3 py-1 rounded ${
              filter === "analysis" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Analysis
          </button>
        </div>

        {/* Analysis chart */}
        {filter === "analysis" && delayedGoals.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-2">
              Delayed Reward Progress
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Progress" fill="#4ade80" />
                <Bar dataKey="Target" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Goal input */}
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            className="border rounded p-2"
            placeholder="New goal..."
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <input
              type="number"
              min="1"
              className="w-20 border rounded p-2"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <select
              className="border rounded p-2"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="expert">Expert</option>
            </select>
            <select
              className="border rounded p-2"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
            >
              <option value="immediate">Immediate Reward</option>
              <option value="delayed">Delayed Reward</option>
            </select>
            <button
              className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
              onClick={addGoal}
            >
              {editingGoalId ? "Update" : "Add"}
            </button>
          </div>
        </div>

        <div className="mb-6 text-sm text-gray-600">
          Goals Completed: {completedGoals} / {totalGoals}
        </div>

        {/* Goals list */}
        {filteredGoals.length === 0 ? (
          <p className="text-gray-500">No goals found.</p>
        ) : (
          <div className="space-y-4">
            {filteredGoals.map((g) => (
              <div
                key={g.id}
                className={`p-4 border rounded-xl shadow-sm transition-opacity duration-300 ease-in-out ${
                  g.progress >= g.target ? "bg-green-100" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between mb-1">
                  <div>
                    <h2 className="font-medium">{g.text}</h2>
                    <p className="text-xs text-gray-500">
                      Level: {g.level} | Reward: {g.reward}
                    </p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <button
                      onClick={() => startEditing(g)}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${(g.progress / g.target) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm">
                    {g.progress}/{g.target}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateProgress(g.id, -g.increment)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    -{(g.clickCount * 2 + 1) * baseIncrement(g.level)}
                  </button>
                  <button
                    onClick={() => updateProgress(g.id, g.increment)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    +{(g.clickCount * 2 + 1) * baseIncrement(g.level)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
