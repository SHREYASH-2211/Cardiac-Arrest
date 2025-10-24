import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Watch, FileText, BookOpen, LogOut, Bell, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, logout } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [watchConnected, setWatchConnected] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'reports' | 'education'>('overview');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleConnectWatch = () => {
    setWatchConnected(true);
  };

  const currentRisk = 0.34;
  const isHighRisk = currentRisk > 0.6;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold">CardiacAI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeSection === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className="h-4 w-4 inline-block mr-2" />
              Health Overview
            </button>
            <button
              onClick={() => setActiveSection('reports')}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeSection === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4 inline-block mr-2" />
              Doctor Reports
            </button>
            <button
              onClick={() => setActiveSection('education')}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeSection === 'education'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="h-4 w-4 inline-block mr-2" />
              Heart Health Education
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeSection === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Watch Connection */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Watch className="h-6 w-6 text-primary" />
                  Connect Your Smartwatch
                </CardTitle>
                <CardDescription>
                  Sync your wearable device to monitor real-time cardiac metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!watchConnected ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Connect your Apple Watch, Fitbit, or other compatible devices to enable continuous monitoring
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button onClick={handleConnectWatch} variant="outline" className="h-20">
                        <div className="text-center">
                          <Watch className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-xs">Apple Watch</span>
                        </div>
                      </Button>
                      <Button onClick={handleConnectWatch} variant="outline" className="h-20">
                        <div className="text-center">
                          <Watch className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-xs">Fitbit</span>
                        </div>
                      </Button>
                      <Button onClick={handleConnectWatch} variant="outline" className="h-20">
                        <div className="text-center">
                          <Watch className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-xs">Garmin</span>
                        </div>
                      </Button>
                      <Button onClick={handleConnectWatch} variant="outline" className="h-20">
                        <div className="text-center">
                          <Watch className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-xs">Samsung</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-accent bg-accent/5">
                      <Watch className="h-4 w-4 text-accent" />
                      <AlertTitle>Watch Connected</AlertTitle>
                      <AlertDescription>
                        Apple Watch Series 8 is now syncing your heart data in real-time
                      </AlertDescription>
                    </Alert>
                    
                    {/* Live Metrics */}
                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Heart Rate</p>
                        <p className="text-2xl font-bold">72 bpm</p>
                        <p className="text-xs text-accent">Normal</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">SpO₂</p>
                        <p className="text-2xl font-bold">98%</p>
                        <p className="text-xs text-accent">Excellent</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">HRV</p>
                        <p className="text-2xl font-bold">42 ms</p>
                        <p className="text-xs text-muted-foreground">Average</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Risk Assessment */}
            <Card className={isHighRisk ? 'border-2 border-destructive' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  Your Cardiac Arrest Risk
                </CardTitle>
                <CardDescription>AI-powered continuous risk monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isHighRisk && (
                  <Alert variant="destructive">
                    <Bell className="h-4 w-4" />
                    <AlertTitle>Risk Alert</AlertTitle>
                    <AlertDescription>
                      Your cardiac arrest risk is elevated. Please consult your doctor immediately.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {(currentRisk * 100).toFixed(1)}%
                  </div>
                  <p className="text-muted-foreground">Current Risk Score</p>
                </div>

                <Progress value={currentRisk * 100} className="h-3" />

                <div className="flex justify-between items-center">
                  <Badge variant={isHighRisk ? "destructive" : "secondary"}>
                    {isHighRisk ? "HIGH RISK" : "LOW RISK"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Last updated: 5 min ago</span>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Risk Factors</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Heart Rate Variability</span>
                      <Badge variant="secondary">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Sleep Quality</span>
                      <Badge variant="outline">Fair</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Activity Level</span>
                      <Badge variant="secondary">Good</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { time: "2 hours ago", message: "Elevated heart rate detected during rest", severity: "warning" },
                  { time: "1 day ago", message: "Sleep pattern irregularity noted", severity: "info" },
                  { time: "3 days ago", message: "Risk score improved to 34%", severity: "success" },
                ].map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Bell className={`h-4 w-4 mt-0.5 ${
                      alert.severity === 'warning' ? 'text-orange-500' : 
                      alert.severity === 'success' ? 'text-accent' : 'text-primary'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'reports' && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Reports & Consultations</CardTitle>
                <CardDescription>
                  View reports and recommendations from your healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    doctor: "Dr. Sarah Johnson",
                    specialty: "Cardiologist",
                    date: "Jan 15, 2025",
                    title: "Annual Cardiac Assessment",
                    summary: "Overall heart health is good. Continue current medication and exercise routine."
                  },
                  {
                    doctor: "Dr. Michael Chen",
                    specialty: "Internal Medicine",
                    date: "Dec 8, 2024",
                    title: "ECG Analysis Report",
                    summary: "ECG results show normal sinus rhythm. No immediate concerns detected."
                  },
                  {
                    doctor: "Dr. Emily Rodriguez",
                    specialty: "Sports Medicine",
                    date: "Nov 22, 2024",
                    title: "Exercise Stress Test",
                    summary: "Excellent cardiovascular fitness. Cleared for high-intensity training."
                  },
                ].map((report, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{report.title}</h4>
                          <p className="text-sm text-muted-foreground">{report.doctor} • {report.specialty}</p>
                        </div>
                        <Badge variant="outline">{report.date}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{report.summary}</p>
                      <Button variant="link" className="p-0 h-auto">
                        View Full Report →
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'education' && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Improve Your Heart Health</CardTitle>
                <CardDescription>
                  Evidence-based guidance for a healthier heart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    title: "Exercise & Physical Activity",
                    icon: Activity,
                    tips: [
                      "Aim for 150 minutes of moderate aerobic activity per week",
                      "Include strength training exercises at least twice weekly",
                      "Take breaks from sitting every 30 minutes",
                      "Start slowly and gradually increase intensity"
                    ]
                  },
                  {
                    title: "Nutrition & Diet",
                    icon: Heart,
                    tips: [
                      "Follow a Mediterranean-style diet rich in fruits and vegetables",
                      "Limit saturated fats and avoid trans fats",
                      "Reduce sodium intake to less than 2,300mg daily",
                      "Include omega-3 fatty acids from fish or supplements"
                    ]
                  },
                  {
                    title: "Stress Management",
                    icon: Activity,
                    tips: [
                      "Practice mindfulness or meditation for 10-15 minutes daily",
                      "Maintain a regular sleep schedule (7-9 hours)",
                      "Engage in hobbies and social activities",
                      "Consider professional support if stress becomes overwhelming"
                    ]
                  },
                  {
                    title: "Lifestyle Modifications",
                    icon: Heart,
                    tips: [
                      "Quit smoking and avoid secondhand smoke",
                      "Limit alcohol consumption to moderate levels",
                      "Monitor blood pressure and cholesterol regularly",
                      "Maintain a healthy weight with BMI 18.5-24.9"
                    ]
                  }
                ].map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon className="h-5 w-5 text-primary" />
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {section.tips.map((tip, tipIdx) => (
                            <li key={tipIdx} className="flex items-start gap-2 text-sm">
                              <span className="text-primary mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
