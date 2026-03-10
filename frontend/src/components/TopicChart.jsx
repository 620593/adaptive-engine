import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-surface border border-border p-3 rounded-lg shadow-xl shrink-0">
        <p className="text-textPrimary font-medium mb-1">{label}</p>
        <p className="text-sm text-textSecondary">
          Accuracy:{" "}
          <span className={value >= 50 ? "text-success" : "text-error"}>
            {value}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const TopicChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;

  const chartData = Object.keys(data).map((key) => ({
    name: key,
    accuracy: Math.round((data[key].accuracy || 0) * 100),
  }));

  return (
    <div className="w-full h-64 mt-4 text-xs font-mono">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            stroke="#475569"
            tick={{ fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#475569"
            tick={{ fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(30, 30, 46, 0.5)" }}
          />
          <Bar
            dataKey="accuracy"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.accuracy >= 50 ? "#22c55e" : "#ef4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicChart;
