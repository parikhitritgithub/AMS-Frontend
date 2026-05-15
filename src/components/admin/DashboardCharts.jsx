// DashboardCharts.jsx (Updated to accept API data)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function DashboardCharts({ chartsData }) {
  // Transform API data for bar chart
  const barData = (chartsData?.topDisciplines || []).map(item => ({
    discipline: item.discipline,
    projects: item.count,
  }));

  // Calculate total for percentage
  const totalCount = (chartsData?.topDisciplines || []).reduce((sum, item) => sum + item.count, 0);

  // Transform API data for pie chart with colors
  const pieColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#f97316", "#ef4444", "#06b6d4"];
  
  const pieData = (chartsData?.topDisciplines || []).map((item, index) => ({
    name: item.discipline,
    value: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
    color: pieColors[index % pieColors.length],
  }));

  if (!chartsData || barData.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Disciplines by Project Count</h3>
          <div className="flex items-center justify-center h-[210px] text-gray-400">
            No data available
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Discipline Distribution</h3>
          <div className="flex items-center justify-center h-[210px] text-gray-400">
            No data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Bar Chart */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Top Disciplines by Project Count
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={barData}
            margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="discipline"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                fontSize: 12,
                border: "1px solid #e5e7eb",
              }}
              cursor={{ fill: "#eff6ff" }}
            />
            <Bar
              dataKey="projects"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              name="Projects"
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-2 mt-2 justify-center">
          <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
          <span className="text-xs text-gray-500">Projects</span>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Discipline Distribution
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              labelLine={false}
              
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, n, props) => [`${v}%`, props.payload.name]}
              contentStyle={{
                borderRadius: 8,
                fontSize: 12,
                border: "1px solid #e5e7eb",
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={8}
              formatter={(value, entry) => (
                <span style={{ fontSize: 11, color: "#374151" }}>
                  {value}: {entry.payload.value}%
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}