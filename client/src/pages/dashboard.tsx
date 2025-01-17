import { useUser } from "@/hooks/use-user";
import { useHealthMetrics } from "@/hooks/use-health-metrics";
import HealthForm from "@/components/health-form";
import MetricsChart from "@/components/metrics-chart";
import MedicationTracker from "@/components/medication-tracker";
import HealthNotes from "@/components/health-notes";
import SubscriptionCard from "@/components/subscription-card";
import ActivityTracker from "@/components/activity-tracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flame } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useUser();
  const { metrics, isLoading } = useHealthMetrics();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Health Manager</h1>
            {user?.currentStreak > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-medium">{user.currentStreak} Day Streak!</span>
              </div>
            )}
          </div>
          <Button onClick={() => logout()} className="text-lg">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-8">
        {metrics && metrics.length > 0 && (
          <MetricsChart data={metrics} />
        )}

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Add New Entry</h2>
            <HealthForm />
          </CardContent>
        </Card>

        <MedicationTracker />
        <HealthNotes />
        <ActivityTracker />

        {user?.isPremium === false && <SubscriptionCard />}
      </main>
    </div>
  );
}