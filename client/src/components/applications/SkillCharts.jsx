import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#38bdf8", "#a78bfa", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6"];

export default function SkillCharts({ requiredSkills = [], matchedSkills = [], missingSkills = [] }) {
  const summaryData = [
    { name: "Matched", value: matchedSkills.length },
    { name: "Missing", value: missingSkills.length },
    { name: "Required", value: Math.max(requiredSkills.length - matchedSkills.length - missingSkills.length, 0) },
  ].filter((item) => item.value > 0);

  const missingData = missingSkills.slice(0, 8).map((skill) => ({ skill, count: 1 }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 h-85">
        <h3 className="text-lg font-semibold mb-4">Skill Match Chart</h3>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={summaryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={54}
              paddingAngle={4}
            >
              {summaryData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 h-85">
        <h3 className="text-lg font-semibold mb-4">Missing Skills Chart</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={missingData.length ? missingData : [{ skill: "No gaps", count: 0 }]} layout="vertical" margin={{ left: 16, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="skill"
              type="category"
              width={110}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
              }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
