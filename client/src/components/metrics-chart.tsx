
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  const [chartType, setChartType] = useState("line");
  
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((metric) => ({
      date: new Date(metric.date).toLocaleDateString(),
      bloodSugar: metric.bloodSugar !== null ? Number(metric.bloodSugar) : null,
      systolic: metric.bloodPressureSystolic !== null ? Number(metric.bloodPressureSystolic) : null,
      diastolic: metric.bloodPressureDiastolic !== null ? Number(metric.bloodPressureDiastolic) : null
    }));

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 80 },
    };

    if (chartType === "bar") {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            height={60}
            angle={-45}
            textAnchor="end"
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="bloodSugar" fill="#ff4d4d" name="Blood Sugar" />
          <Bar dataKey="systolic" fill="#2563eb" name="Systolic BP" />
          <Bar dataKey="diastolic" fill="#16a34a" name="Diastolic BP" />
        </BarChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          height={60}
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
    );
  };

  return (
    <div className="space-y-4">
      <Select value={chartType} onValueChange={setChartType}>
        <SelectTrigger>
          <SelectValue placeholder="Select chart type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="line">Line Chart</SelectItem>
          <SelectItem value="bar">Bar Chart</SelectItem>
        </SelectContent>
      </Select>

      <ResponsiveContainer width="100%" height={400}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
