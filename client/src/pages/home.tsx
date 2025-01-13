import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  TrendingUp,
  LineChart,
  Activity,
  Users,
  FolderHeart
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
              <h3 className="text-2xl font-semibold">Stay in Control of Your Health</h3>
              <p className="text-lg">
                Easily keep track of your blood sugar and blood pressure with clear, easy-to-read displays that simplify your daily routine.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Bell className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Never Forget a Dose</h3>
              <p className="text-lg">
                Get peace of mind knowing you'll always take your medications on time with helpful reminders.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <TrendingUp className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Understand Your Progress</h3>
              <p className="text-lg">
                See how your health is improving over time with simple, clear visuals that make trends easy to understand.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Activity className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Feel More Active Every Day</h3>
              <p className="text-lg">
                Stay motivated to move more by tracking your daily activities and exercises effortlessly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Users className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Support Your Care Team</h3>
              <p className="text-lg">
                Share updates and reports with family or your healthcare provider, so everyone stays on the same page.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <FolderHeart className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Keep Everything in One Place</h3>
              <p className="text-lg">
                Have important notes and doctor's recommendations at your fingertips whenever you need them.
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