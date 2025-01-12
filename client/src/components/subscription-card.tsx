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
        <CardTitle>Support Development</CardTitle>
        <CardDescription>Help us keep improving the app</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <ul className="list-disc pl-4 space-y-2">
            <li>Access to upcoming features</li>
            <li>Support independent development</li>
            <li>Help us maintain and improve the app for the community</li>
          </ul>
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