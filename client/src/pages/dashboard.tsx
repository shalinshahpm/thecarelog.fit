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
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <span>Export Health Data</span>
              </h2>
              <div className="flex gap-4">
                <Button 
                  onClick={async () => {
                    const response = await fetch('/api/export/csv');
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'health-data.csv';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Export CSV
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/export/pdf');
                      if (!response.ok) throw new Error('Failed to generate PDF');
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'health-data.pdf';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('PDF export failed:', error);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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