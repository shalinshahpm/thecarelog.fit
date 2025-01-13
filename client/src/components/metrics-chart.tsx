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
import type { HealthMetric } from "@db/schema";

type Props = {
  data: HealthMetric[];
};

export default function MetricsChart({ data }: Props) {
  const chartData = [...data].reverse().slice(0, 10).reverse().map((metric) => ({
    date: new Date(metric.date).toLocaleDateString(),
    bloodSugar: metric.bloodSugar,
    systolic: metric.bloodPressureSystolic,
    diastolic: metric.bloodPressureDiastolic,
    cholesterol: metric.cholesterol,
    medications: metric.medications,
  }));

  return (
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
        <Line
          type="monotone"
          dataKey="cholesterol"
          stroke="#ff7300"
          name="Cholesterol"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
