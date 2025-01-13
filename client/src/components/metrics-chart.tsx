
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
      month: 30
    };
    const daysAgo = ranges[timeRange as keyof typeof ranges];
    const cutoff = new Date(now.setDate(now.getDate() - daysAgo));
    return data.filter(metric => new Date(metric.date) >= cutoff);
  };

  const chartData = filterData().map((metric) => ({
    date: new Date(metric.date).toLocaleDateString(),
    bloodSugar: metric.bloodSugar,
    systolic: metric.bloodPressureSystolic,
    diastolic: metric.bloodPressureDiastolic
  }));

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
        </SelectContent>
      </Select>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 14 }}
            height={60}
            interval={0}
            angle={-45}
            textAnchor="end"
          />
          <YAxis tick={{ fontSize: 14 }} />
          <Tooltip contentStyle={{ fontSize: 14 }} />
          <Legend wrapperStyle={{ fontSize: 14 }} />
          <Line
            type="monotone"
            dataKey="bloodSugar"
            stroke="#8884d8"
            name="Blood Sugar"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="systolic"
            stroke="#82ca9d"
            name="Systolic BP"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            stroke="#ffc658"
            name="Diastolic BP"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
