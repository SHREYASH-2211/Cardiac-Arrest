import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Stethoscope, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  login,
  loginDoctor,
  register,
  registerDoctor,
  UserRole,
} from "@/lib/auth";

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 🔹 State
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [hospital, setHospital] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isDoctor = role === "doctor";

  // 🔹 Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        // 🔹 Registration
        const newUser = isDoctor
          ? await registerDoctor({
              fullname,
              username,
              email,
              password,
              specialization,
              licenseNumber,
              hospital,
              phone,
            })
          : await register({
              fullname,
              username,
              email,
              password,
              age: age ? parseInt(age) : undefined,
              gender,
              phone,
            });

        if (newUser) {
          toast({
            title: "Success",
            description: `${isDoctor ? "Doctor" : "User"} registered successfully! Please login.`,
          });
          setIsSignup(false);
          // Reset form
          setFullname("");
          setUsername("");
          setEmail("");
          setPassword("");
          setPhone("");
          setAge("");
          setGender("male");
          setHospital("");
          setLicenseNumber("");
          setSpecialization("");
        } else {
          toast({
            title: "Registration Failed",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // 🔹 Login
        const loggedInUser = isDoctor
          ? await loginDoctor({ email, username, password })
          : await login({ email, username, password });

        if (loggedInUser) {
          toast({
            title: "Login Successful",
            description: `Welcome, ${loggedInUser.fullname || loggedInUser.name}!`,
          });

          // ✅ Redirect by role
          if (loggedInUser.role === "doctor") {
            navigate("/dashboard");
          } else if (loggedInUser.role === "user") {
            navigate("/user-dashboard");
          } else {
            navigate("/");
          }
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid credentials or user not found",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
              {isDoctor ? "Doctor" : "User"} {isSignup ? "Sign Up" : "Login"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignup
                ? `Create your ${isDoctor ? "doctor" : "user"} account`
                : `Enter your credentials to access the platform`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="John Doe"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                  />
                </div>
              )}

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
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={isSignup}
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

              {/* Doctor fields */}
              {isSignup && isDoctor && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      type="text"
                      placeholder="Cardiology"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder="DOC123456"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospital">Hospital</Label>
                    <Input
                      id="hospital"
                      type="text"
                      placeholder="City Hospital"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {/* User fields */}
              {isSignup && !isDoctor && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
              </Button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary hover:underline"
              >
                {isSignup
                  ? "Already have an account? Login"
                  : "Don't have an account? Sign up"}
              </button>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Button type="button" variant="ghost" onClick={() => navigate("/")} className="text-sm">
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
