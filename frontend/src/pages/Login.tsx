import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Stethoscope, UserCircle } from "lucide-react";
import { mockLogin, UserRole } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const userRole = role as UserRole;
  const isDoctor = userRole === 'doctor';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = mockLogin(email, password, userRole);
    
    if (user) {
      toast({
        title: "Success",
        description: `Logged in as ${isDoctor ? 'Doctor' : 'User'}`,
      });
      // Redirect based on role
      if (user.role === 'doctor') {
        navigate('/dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials. Password must be at least 6 characters.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Activity className="h-10 w-10 text-primary" />
          <span className="text-2xl font-semibold">CardiacAI</span>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              {isDoctor ? (
                <Stethoscope className="h-12 w-12 text-primary" />
              ) : (
                <UserCircle className="h-12 w-12 text-accent" />
              )}
            </div>
            <CardTitle className="text-2xl text-center">
              {isDoctor ? 'Doctor' : 'User'} {isSignup ? 'Sign Up' : 'Login'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignup 
                ? `Create your ${isDoctor ? 'doctor' : 'user'} account` 
                : `Enter your credentials to access the platform`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={isDoctor ? "doctor@hospital.com" : "user@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                {isSignup ? 'Sign Up' : 'Login'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary hover:underline"
              >
                {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-sm"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-6">
          For research use only — not a medical diagnostic tool
        </p>
      </div>
    </div>
  );
};

export default Login;
