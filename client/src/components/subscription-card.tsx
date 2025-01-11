import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const subscribe = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Success",
        description: "You are now a premium subscriber!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
        <CardDescription className="text-lg">
          Get unlimited access to all features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Premium Features:</h3>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Unlimited health log entries</li>
            <li>Detailed health trend analysis</li>
            <li>Doctor consultation notes</li>
            <li>Export health data</li>
            <li>Priority support</li>
          </ul>
        </div>
        <div className="text-center">
          <span className="text-3xl font-bold">$2.99</span>
          <span className="text-lg">/month</span>
        </div>
        <Button
          onClick={() => subscribe.mutate()}
          className="w-full text-lg p-6"
          disabled={subscribe.isPending}
        >
          {subscribe.isPending ? "Processing..." : "Upgrade Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
