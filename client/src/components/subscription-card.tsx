
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coffee } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionCard() {
  const { toast } = useToast();

  const handleDonation = () => {
    try {
      window.location.href = "https://buy.stripe.com/00g14ubYP1EL5YQaEG";
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Failed to redirect to payment page. Please try again later.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Built for my mom, shared to help yours ❤️</CardTitle>
        <CardDescription>This app was created to make managing health easier for my mom—and now it's here to help others too.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <p className="text-muted-foreground">If this app has made a difference for you, a small contribution of $4.99 can help keep it running and growing.</p>
          <p className="text-muted-foreground">Click below to support better features and more families.</p>
          <p className="text-muted-foreground">Thank you for being part of this journey! ❤️</p>
        </div>
        <Button
          onClick={handleDonation}
          className="w-full text-lg p-6 flex items-center justify-center gap-2"
        >
          <Coffee className="h-6 w-6" />
          Buy Me a Coffee ☕
        </Button>
      </CardContent>
    </Card>
  );
}
