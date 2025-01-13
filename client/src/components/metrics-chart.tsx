
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { HealthMetric } from "@db/schema";
import { useState } from "react";

type Props = {
  data: HealthMetric[];
};

export default function MetricsChart({ data }: Props) {
  const [timeRange, setTimeRange] = useState("week");
  
  const filterData = () => {
    const now = new Date();
    const ranges = {
      day: 1,
      week: 7,
      month: 30,
      year: 365
    };
    const daysAgo = ranges[timeRange as keyof typeof ranges];
    const cutoff = new Date(now.setDate(now.getDate() - daysAgo));
    return data
      .filter(metric => new Date(metric.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = filterData().map((metric) => ({
    date: new Date(metric.date).toLocaleDateString(),
    bloodSugar: metric.bloodSugar !== null ? Number(metric.bloodSugar) : null,
    systolic: metric.bloodPressureSystolic !== null ? Number(metric.bloodPressureSystolic) : null,
    diastolic: metric.bloodPressureDiastolic !== null ? Number(metric.bloodPressureDiastolic) : null
  }));

  console.log('Chart Data:', chartData); // For debugging

  return (
    <div className="space-y-4">
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger>
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Last 24 Hours</SelectItem>
          <SelectItem value="week">Last Week</SelectItem>
          <SelectItem value="month">Last Month</SelectItem>
          <SelectItem value="year">Last Year</SelectItem>
        </SelectContent>
      </Select>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            height={60}
            interval={0}
            angle={-45}
            textAnchor="end"
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="bloodSugar"
            stroke="#ff4d4d"
            name="Blood Sugar"
            strokeWidth={2}
            dot
          />
          <Line
            type="monotone"
            dataKey="systolic"
            stroke="#2563eb"
            name="Systolic BP"
            strokeWidth={2}
            dot
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            stroke="#16a34a"
            name="Diastolic BP"
            strokeWidth={2}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
