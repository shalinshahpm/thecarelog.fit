import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type AuthPageProps = {
  isLogin?: boolean;
};

export default function AuthPage({ isLogin: defaultIsLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin ?? true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useUser();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    setIsLogin(defaultIsLogin ?? true);
  }, [defaultIsLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Basic validation
      if (!username || !password || (!isLogin && !email)) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      if (isLogin) {
        const result = await login({ username, password });
        if (result.ok) {
          setLocation("/");
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: result.message || "Invalid credentials. Please try again or register for a new account.",
          });
        }
      } else {
        const result = await register({ username, password, email });
        if (result.ok) {
          setLocation("/");
          toast({
            title: "Registration Successful",
            description: "Your account has been created and you're now logged in.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: result.message || "Failed to create account. Please try again.",
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isLogin ? "Login Failed" : "Registration Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
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
                placeholder="Enter your username"
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
                  placeholder="Enter your email"
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
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full text-lg p-6">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
          <Button
            variant="ghost"
            className="w-full mt-4 text-lg"
            onClick={() => {
              setIsLogin(!isLogin);
              setLocation(isLogin ? "/register" : "/");
              setUsername("");
              setPassword("");
              setEmail("");
            }}
          >
            {isLogin ? "Need an account? Register" : "Have an account? Sign In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}