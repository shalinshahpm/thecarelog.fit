
import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { login, register } = useUser();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!username || !password || (!isLogin && !email)) {
        throw new Error("Please fill in all fields");
      }

      if (isLogin) {
        await login({ username, password });
      } else {
        await register({ username, password, email });
      }
      
      setLocation("/dashboard");
    } catch (error: any) {
      const errorMessage = error?.response?.data || error.message || "An unexpected error occurred";
      toast({
        variant: "destructive",
        title: isLogin ? "Login Failed" : "Registration Failed",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center mb-2">
            {isLogin ? "Welcome Back" : "Create New Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Sign in to access your dashboard" : "Register to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-lg font-medium">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-lg p-6"
                required
                minLength={3}
              />
            </div>
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-lg font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-lg p-6"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-lg font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-lg p-6"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full text-lg p-6">
              {isLogin ? "Login" : "Register"}
            </Button>
          </form>
          <Button
            variant="ghost"
            className="w-full mt-4 text-lg"
            onClick={() => {
              setIsLogin(!isLogin);
              setUsername("");
              setPassword("");
              setEmail("");
            }}
          >
            {isLogin ? "Need an account? Register" : "Have an account? Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
