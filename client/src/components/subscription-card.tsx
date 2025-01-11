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

  const handleDonation = async () => {
    try {
      // Get the Stripe public key from environment variables
      const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      console.log("Stripe public key:", publicKey ? "Found" : "Missing");

      if (!publicKey || publicKey === "pk_test_your_publishable_key") {
        console.error("Invalid Stripe public key configuration");
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Payment system is temporarily unavailable. Please try again later.",
        });
        return;
      }

      const stripe = await loadStripe(publicKey);
      if (!stripe) {
        throw new Error("Failed to initialize payment system");
      }

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Payment request failed");
      }

      const { clientSecret } = await response.json();
      if (!clientSecret) {
        throw new Error("Invalid payment session");
      }

      const result = await stripe.redirectToCheckout({
        sessionId: clientSecret
      });
      
      if (result.error) {
        throw result.error;
      }

      if (stripeError) {
        throw stripeError;
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again later.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2 justify-center">
          Support the App <span className="text-red-500">❤️</span>
        </CardTitle>
        <CardDescription className="text-lg text-center">
          If you find this health tracker helpful, consider supporting its development.
          Your contributions help keep the app running and improve features for everyone!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-center">How You Can Support:</h3>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Donate any amount you like</li>
            <li>Your generosity fuels better updates and support for more users</li>
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