import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Bell,
  TrendingUp,
  LineChart,
  Clock,
  Share2
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Senior Health Manager
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Simple health tracking for you and your loved ones
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link href="/login">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        <section className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <LineChart className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Track Health Metrics</h3>
              <p className="text-lg">
                Monitor blood sugar and blood pressure with large, easy-to-read displays
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Bell className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Medication Reminders</h3>
              <p className="text-lg">
                Never miss important medications with timely reminders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <TrendingUp className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Health Insights</h3>
              <p className="text-lg">
                View your health trends with simple, clear charts
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Clock className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Activity Tracking</h3>
              <p className="text-lg">
                Keep track of daily activities and exercises
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Share2 className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Easy Sharing</h3>
              <p className="text-lg">
                Share health reports with family and healthcare providers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Heart className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Health Notes</h3>
              <p className="text-lg">
                Store important health notes and doctor's recommendations
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t p-8 mt-12">
        <div className="max-w-7xl mx-auto text-center text-lg text-muted-foreground">
          <p>© 2024 Senior Health Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}