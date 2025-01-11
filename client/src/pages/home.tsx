import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  Heart,
  Clipboard,
  Bell,
  Lock,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Senior Health Manager
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Your simple companion for tracking health metrics
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <img
            src="https://images.unsplash.com/photo-1484788984921-03950022c9ef"
            alt="Senior using computer"
            className="rounded-lg mx-auto max-w-2xl w-full object-cover h-[300px]"
          />
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Easy Health Tracking for Seniors
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Monitor your blood sugar, blood pressure, and cholesterol with our
              easy-to-use interface designed specifically for seniors.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Activity className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Easy Tracking</h3>
              <p className="text-lg">
                Simple forms to log your daily health metrics with large, readable
                text
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Heart className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Health Insights</h3>
              <p className="text-lg">
                View your health trends with clear, easy-to-understand charts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Bell className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Daily Reminders</h3>
              <p className="text-lg">
                Optional email reminders to help you stay on track
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Premium Features */}
        <section className="text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Premium Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <Lock className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-2xl font-semibold">Unlimited Logs</h3>
                <p className="text-lg">
                  Keep track of your health data without any limits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <Clipboard className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-2xl font-semibold">Doctor Notes</h3>
                <p className="text-lg">
                  Store and review notes from your doctor visits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <TrendingUp className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-2xl font-semibold">Advanced Analytics</h3>
                <p className="text-lg">
                  Detailed analysis of your health trends over time
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trust Section */}
        <section className="text-center space-y-6">
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f"
            alt="Medical dashboard"
            className="rounded-lg mx-auto max-w-2xl w-full object-cover h-[300px]"
          />
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Trusted by Seniors
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of seniors who trust our platform to manage their
              health metrics daily. Start your health journey today.
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/login">Join Now</Link>
            </Button>
          </div>
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
