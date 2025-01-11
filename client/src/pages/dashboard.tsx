import { useUser } from "@/hooks/use-user";
import { useHealthMetrics } from "@/hooks/use-health-metrics";
import HealthForm from "@/components/health-form";
import MetricsChart from "@/components/metrics-chart";
import SubscriptionCard from "@/components/subscription-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  const { user, logout } = useUser();
  const { metrics, isLoading } = useHealthMetrics();

  const recentMetrics = metrics.slice(-7);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Health Manager</h1>
          <Button onClick={() => logout()} className="text-lg">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Add New Entry</h2>
              <HealthForm />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Recent Trends</h2>
              <MetricsChart data={recentMetrics} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Recent Entries</h2>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {recentMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <p className="text-lg">
                      Date: {new Date(metric.date).toLocaleDateString()}
                    </p>
                    <p className="text-lg">
                      Blood Sugar: {metric.bloodSugar} mg/dL
                    </p>
                    <p className="text-lg">
                      Blood Pressure: {metric.bloodPressureSystolic}/
                      {metric.bloodPressureDiastolic} mmHg
                    </p>
                    <p className="text-lg">
                      Cholesterol: {metric.cholesterol} mg/dL
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {!user.isPremium && <SubscriptionCard />}
      </main>
    </div>
  );
}
