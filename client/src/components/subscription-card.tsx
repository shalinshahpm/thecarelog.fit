
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coffee } from "lucide-react";
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
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-8">
        <CardTitle className="text-2xl md:text-3xl text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          Built for my parents, shared to help yours ❤️
        </CardTitle>
        <CardDescription className="text-center text-base">
          This app was created to make managing health easier for my parents—and now it's here to help others too.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 mb-6">
          <p className="text-muted-foreground text-center">
            If this app has made a difference for you, a small contribution of $4.99 can help keep it running and growing.
          </p>
          <div className="flex justify-center">
            <Coffee className="h-16 w-16 text-primary animate-bounce" />
          </div>
          <p className="text-muted-foreground text-center">
            Click below to support better features and more families.
          </p>
          <p className="text-muted-foreground text-center font-medium">
            Thank you for being part of this journey! ❤️
          </p>
        </div>
        <Button
          onClick={handleDonation}
          className="w-full text-lg p-6 flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-md hover:shadow-xl"
        >
          <Coffee className="h-6 w-6" />
          Buy Me a Coffee ☕
        </Button>
      </CardContent>
    </Card>
  );
}
