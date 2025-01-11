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
      // Replace this with your Stripe checkout URL from your buy button
      window.location.href = "https://buy.stripe.com/test_yourCheckoutLink";
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Failed to redirect to payment page. Please try again later.",
      });
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