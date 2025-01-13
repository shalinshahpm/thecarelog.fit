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
              <MetricsChart data={metrics} />
            </CardContent>
          </Card>
        </div>

        <MedicationTracker />

        <HealthNotes />
        
        <ActivityTracker />

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Export Data</h2>
              <div className="space-x-2">
                <Button onClick={async () => {
                  const response = await fetch('/api/export/csv');
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'health-metrics.csv';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}>Export CSV</Button>
                <Button onClick={async () => {
                  const response = await fetch('/api/export/pdf');
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'health-metrics.pdf';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}>Export PDF</Button>
                <Button onClick={() => {
                  const text = "Check out my health metrics!";
                  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(url, '_blank');
                }}>Share WhatsApp</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {user?.isPremium === false && <SubscriptionCard />}
      </main>
    </div>
  );
}