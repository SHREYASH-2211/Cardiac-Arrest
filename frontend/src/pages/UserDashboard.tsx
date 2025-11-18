import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Watch, FileText, BookOpen, LogOut, Bell, Heart, LineChart, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, logout } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { multiparameterApiService, PredictionResponse } from "@/lib/multiparameter-api";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const [watchConnected, setWatchConnected] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'reports' | 'education' | 'multiparameter'>('overview');

  // Multiparameter state
  const [vitalsFile, setVitalsFile] = useState<File | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [multiparameterResults, setMultiparameterResults] = useState<{
    predictions: PredictionResponse[];
    summary: {
      total_rows: number;
      predictions_made: number;
      average_risk: number;
      high_risk_count: number;
    };
  } | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleConnectWatch = () => {
    setWatchConnected(true);
  };

  const currentRisk = 0.34;
  const isHighRisk = currentRisk > 0.6;

  // Multiparameter functions
  const API_BASE = "http://localhost:8000/api/predictions";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setVitalsFile(file);
    toast({
      title: "File Uploaded",
      description: `${file.name} uploaded successfully`,
    });
  };

  const normalizePercent = (value: any) => {
    if (value === null || value === undefined) return null;
    const n = Number(value);
    if (Number.isNaN(n)) return null;
    return n <= 1 ? n * 100 : n;
  };

  const computeRecentOrAverageRisk = (results: any): number | null => {
    if (!results) return null;

    const preds: any[] = Array.isArray(results.predictions) ? results.predictions : [];

    if (preds.length > 0) {
      const last = preds[preds.length - 1];
      const candidate = last?.risk_probability ?? last?.prob ?? last?.probability ?? last?.risk_score ?? last?.risk ?? last?.score ?? last?.value;
      const recent = normalizePercent(candidate);
      if (recent !== null) return Math.min(Math.max(recent, 0), 100);
    }

    const values: number[] = [];
    for (const p of preds) {
      const v = p?.risk_probability ?? p?.prob ?? p?.probability ?? p?.risk_score ?? p?.risk ?? p?.score ?? p?.value;
      const n = normalizePercent(v);
      if (n !== null && !Number.isNaN(n)) values.push(n);
    }

    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      return Math.min(Math.max(avg, 0), 100);
    }

    const summaryAvg = normalizePercent(results?.summary?.average_risk ?? null);
    if (summaryAvg !== null) return Math.min(Math.max(summaryAvg, 0), 100);

    return null;
  };

  const safeSave = async (path: string, body: any) => {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text().catch(() => "");
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        console.warn("[safeSave] backend returned error", res.status, data);
        toast({
          title: "Save failed",
          description: `Backend ${res.status}: ${typeof data === "string" ? data : data?.error || "See console"}`,
          variant: "destructive",
        });
        return { ok: false, status: res.status, response: data };
      }

      toast({ title: "Stored", description: "Result saved to backend" });
      return { ok: true, status: res.status, response: data };
    } catch (err: any) {
      console.error("[safeSave] network error", err);
      toast({
        title: "Save failed",
        description: `Network error while saving result: ${err?.message || err}`,
        variant: "destructive",
      });
      return { ok: false, error: err };
    }
  };

  const handleMultiparameterPredict = async () => {
    if (!vitalsFile) {
      toast({
        title: "No file selected",
        description: "Please upload a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setIsPredicting(true);
    try {
      const csvText = await vitalsFile.text();
      const results = await multiparameterApiService.processCsvData(csvText, user?.id || 'unknown');

      const computedRisk = computeRecentOrAverageRisk(results);
      if (!results.summary) results.summary = {};
      results.summary.average_risk = computedRisk;

      setMultiparameterResults(results);
      setShowResults(true);

      const averageRisk = computedRisk;

      await safeSave("/vitals", {
        patientId: user?.id || 'unknown',
        averageRisk,
        summary: results.summary || {},
        rawResult: results || {},
        metadata: { source: "user-dashboard-multiparameter" },
      });

      toast({
        title: "Multi-Parameter Analysis Complete",
        description: `Processed ${results?.summary?.predictions_made ?? "N/A"} rows — average risk: ${averageRisk !== null ? averageRisk.toFixed(2) + "%" : "N/A"}`,
      });
    } catch (err) {
      console.error("Multi-parameter prediction error:", err);
      toast({
        title: "Error",
        description: "Failed to process multi-parameter vitals data",
        variant: "destructive",
      });
    } finally {
      setIsPredicting(false);
    }
  };

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
            <button
              onClick={() => setActiveSection('multiparameter')}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeSection === 'multiparameter'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <LineChart className="h-4 w-4 inline-block mr-2" />
              Risk Analysis
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

        {activeSection === 'multiparameter' && (
          <div className="space-y-6 animate-fade-in">
            {showResults && multiparameterResults ? (
              <div className="space-y-6">
                <Button variant="outline" onClick={() => setShowResults(false)}>
                  ← Back to Upload
                </Button>
                <Card className="border-primary shadow-lg">
                  <CardHeader>
                    <CardTitle>Multi-Parameter Analysis Results</CardTitle>
                    <CardDescription>
                      AI analysis of your vital signs data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Total Rows</p>
                          <p className="text-2xl font-bold text-blue-800">{multiparameterResults?.summary?.total_rows}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Predictions Made</p>
                          <p className="text-2xl font-bold text-green-800">{multiparameterResults?.summary?.predictions_made}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-sm text-orange-600 font-medium">Average Risk</p>
                          <p className="text-2xl font-bold text-orange-800">
                            {(() => {
                              const avg = multiparameterResults?.summary?.average_risk;
                              const n = normalizePercent(avg);
                              return n !== null ? `${n.toFixed(1)}%` : "N/A";
                            })()}
                          </p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-sm text-red-600 font-medium">High Risk Alerts</p>
                          <p className="text-2xl font-bold text-red-800">{multiparameterResults?.summary?.high_risk_count ?? 0}</p>
                        </div>
                      </div>

                      {multiparameterResults?.summary?.high_risk_count > 0 && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="text-red-500 h-5 w-5" />
                            <p className="text-red-800 font-semibold">
                              🚨 {multiparameterResults.summary.high_risk_count} High Risk Predictions Detected!
                            </p>
                          </div>
                          <p className="text-red-600 text-sm mt-1">Immediate medical attention may be required.</p>
                        </div>
                      )}

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Recent Predictions</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {Array.isArray(multiparameterResults?.predictions) &&
                            multiparameterResults.predictions.slice(-5).map((pred: PredictionResponse, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span>{new Date(pred.timestamp).toLocaleTimeString()}</span>
                                <span className={`px-2 py-1 rounded text-xs ${pred.predicted_class === 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                  {(pred.risk_probability * 100).toFixed(1)}% Risk
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-6 w-6 text-primary" />
                    Multi-Parameter Risk Analysis
                  </CardTitle>
                  <CardDescription>
                    Upload your vital signs CSV file for AI-powered cardiac arrest risk prediction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                    <strong>Required columns:</strong> Patient_ID, time, HR [bpm], SpO2 [%], NBPs [mmHg], NBPd [mmHg], NBPm [mmHg], RR [rpm], QTc [msec], DeltaQTc [msec], QT [msec], QT-HR [bpm], ST-III [mm], ST-V [mm], PVC [/min], Perf [NU], Pulse (NBP) [bpm], Pulse (SpO2) [bpm], btbHR [bpm]
                  </div>

                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <Label htmlFor="vitals-csv" className="cursor-pointer">
                      <span className="text-sm text-muted-foreground">Click to upload or drag and drop CSV file</span>
                      <Input 
                        id="vitals-csv" 
                        type="file" 
                        accept=".csv" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">Supports .csv files only</p>
                  </div>

                  {vitalsFile && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">{vitalsFile.name} uploaded ✅</span>
                    </div>
                  )}

                  <Button 
                    onClick={handleMultiparameterPredict} 
                    size="lg" 
                    className="w-full" 
                    disabled={isPredicting || !vitalsFile}
                  >
                    {isPredicting ? "Analyzing Your Data..." : "Generate AI Risk Analysis"}
                  </Button>

                  <div className="text-center text-xs text-muted-foreground">
                    Your data will be securely processed and stored for future reference
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;