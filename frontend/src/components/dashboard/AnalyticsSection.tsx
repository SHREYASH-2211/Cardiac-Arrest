import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const AnalyticsSection = () => {
  const user = getCurrentUser();
  const isDoctor = user?.role === 'doctor';

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          {isDoctor 
            ? "Population-level insights and model performance metrics" 
            : "Your personal health trends and prediction history"}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Model Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">94.2%</div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span className="text-accent">+1.2%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              False Alarm Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">5.8%</div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <TrendingDown className="h-3 w-3 text-accent" />
              <span className="text-accent">-0.8%</span>
              <span className="text-muted-foreground">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sensitivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">92.1%</div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span className="text-accent">+2.1%</span>
              <span className="text-muted-foreground">improved</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Specificity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">96.3%</div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <CheckCircle className="h-3 w-3 text-accent" />
              <span className="text-muted-foreground">stable</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>
            {isDoctor ? "Distribution of risk scores across patient population" : "Your risk score history"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">High Risk (≥80%)</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {isDoctor ? "8 patients" : "1 instance"}
              </span>
            </div>
            <Progress value={isDoctor ? 19 : 8} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Medium Risk (40-79%)</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {isDoctor ? "12 patients" : "4 instances"}
              </span>
            </div>
            <Progress value={isDoctor ? 29 : 33} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Low Risk (&lt;40%)</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {isDoctor ? "22 patients" : "7 instances"}
              </span>
            </div>
            <Progress value={isDoctor ? 52 : 59} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ECG Image Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-medium">93.5%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precision</span>
              <span className="font-medium">91.2%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recall</span>
              <span className="font-medium">89.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ECG Signal Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-medium">92.8%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precision</span>
              <span className="font-medium">90.5%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recall</span>
              <span className="font-medium">91.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Multi-Parameter Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-medium">95.1%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precision</span>
              <span className="font-medium">94.3%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recall</span>
              <span className="font-medium">93.7%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSection;
