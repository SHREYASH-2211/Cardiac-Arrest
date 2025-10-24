import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, UserCircle, Stethoscope } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";
import doctorIcon from "@/assets/doctor-icon.jpg";
import userIcon from "@/assets/user-icon.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-foreground">CardiacAI</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#documentation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Medical AI Technology" 
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl font-bold text-foreground leading-tight">
              AI-Driven Predictive System for Early Detection of Cardiac Arrest
            </h1>
            <p className="text-xl text-muted-foreground">
              A secure, explainable AI platform combining ECG and multi-parameter data for early warning of cardiac arrest
            </p>
            
            {/* Login Options */}
            <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
              {/* Doctor Login */}
              <div className="bg-card border rounded-lg p-8 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  <img src={doctorIcon} alt="Doctor" className="w-24 h-24 rounded-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Doctor Login
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Access patient records, review predictions, and validate AI diagnostics
                </p>
                <Button 
                  onClick={() => navigate('/login/doctor')} 
                  className="w-full"
                  size="lg"
                >
                  Login as Doctor
                </Button>
              </div>

              {/* User Login */}
              <div className="bg-card border rounded-lg p-8 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  <img src={userIcon} alt="User" className="w-24 h-24 rounded-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                  <UserCircle className="h-5 w-5 text-accent" />
                  User Login
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload your data, view personal results, and track health metrics
                </p>
                <Button 
                  onClick={() => navigate('/login/user')} 
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  Login as User
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">ECG Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced image and signal processing for comprehensive ECG interpretation
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Multi-Parameter Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Real-time analysis of vital signs including HR, SpO₂, blood pressure, and QTc
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Explainable AI</h3>
              <p className="text-sm text-muted-foreground">
                Clinically interpretable predictions with SHAP analysis and visual explanations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground font-semibold">
              For research use only — not a medical diagnostic tool
            </p>
            <p className="text-sm text-muted-foreground">
              Contact: research@cardiacai.example.com
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 CardiacAI Research Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
