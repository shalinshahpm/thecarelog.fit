import type { HealthMetric } from "@db/schema";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";

type Props = {
  data: HealthMetric[];
};

export default function MetricsChart({ data }: Props) {
  const sortedData = data
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {sortedData.map((metric, index) => (
          <Card key={index} className="p-4 border-l-4 border-l-blue-500">
            <div className="text-sm text-muted-foreground">
              {new Date(metric.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Blood Sugar:</span>{' '}
                {metric.bloodSugar ? `${metric.bloodSugar} mg/dL` : 'Not recorded'}
              </div>
              <div>
                <span className="font-medium">Blood Pressure:</span>{' '}
                {metric.bloodPressureSystolic && metric.bloodPressureDiastolic
                  ? `${metric.bloodPressureSystolic}/${metric.bloodPressureDiastolic} mmHg`
                  : 'Not recorded'}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}