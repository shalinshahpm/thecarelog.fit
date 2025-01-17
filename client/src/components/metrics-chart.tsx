import type { HealthMetric } from "@db/schema";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

type Props = {
  data: HealthMetric[];
};

export default function MetricsChart({ data }: Props) {
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(metric => ({
      date: new Date(metric.date).toLocaleDateString(),
      bloodSugar: metric.bloodSugar,
      systolic: metric.bloodPressureSystolic,
      diastolic: metric.bloodPressureDiastolic
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Metrics Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="bloodSugar"
                name="Blood Sugar (mg/dL)"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="systolic"
                name="Blood Pressure (Systolic)"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="diastolic"
                name="Blood Pressure (Diastolic)"
                stroke="#ffc658"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}