import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, AlertTriangle, CheckCircle, TrendingUp, Activity } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PredictionResultsProps {
  onBack: () => void;
}

const PredictionResults = ({ onBack }: PredictionResultsProps) => {
  const ensembleRisk = 0.82;
  const isHighRisk = ensembleRisk > 0.8;

  const modelPredictions = [
    { name: "ECG Image Model", risk: 0.78, confidence: 0.91 },
    { name: "ECG Signal Model", risk: 0.85, confidence: 0.88 },
    { name: "Multi-Parameter Model", risk: 0.84, confidence: 0.93 },
  ];

  const topFeatures = [
    { name: "QTc [msec]", importance: 0.34, value: "478 ms", status: "critical" },
    { name: "HR [bpm]", importance: 0.28, value: "112 bpm", status: "elevated" },
    { name: "ST-V [mm]", importance: 0.18, value: "2.3 mm", status: "abnormal" },
    { name: "SpO2 [%]", importance: 0.12, value: "94%", status: "low" },
    { name: "NBPs [mmHg]", importance: 0.08, value: "155 mmHg", status: "high" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Prediction Results</h1>
          <p className="text-muted-foreground">AI-powered cardiac arrest risk assessment</p>
        </div>
      </div>

      {isHighRisk && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Risk Detected</AlertTitle>
          <AlertDescription>
            The ensemble model indicates elevated cardiac arrest risk. Immediate clinical review recommended.
          </AlertDescription>
        </Alert>
      )}

      {/* Ensemble Result */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Ensemble Fusion Result
          </CardTitle>
          <CardDescription>Combined prediction from all three AI models</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4">
            <div className="text-6xl font-bold text-destructive mb-2">
              {(ensembleRisk * 100).toFixed(1)}%
            </div>
            <p className="text-lg text-muted-foreground">Cardiac Arrest Risk Score</p>
          </div>
          <Progress value={ensembleRisk * 100} className="h-3" />
          <div className="flex justify-between items-center">
            <Badge variant={isHighRisk ? "destructive" : "secondary"} className="text-sm">
              {isHighRisk ? "HIGH RISK" : "MODERATE RISK"}
            </Badge>
            <span className="text-sm text-muted-foreground">Confidence: 91%</span>
          </div>
        </CardContent>
      </Card>

      {/* Individual Models */}
      <div className="grid md:grid-cols-3 gap-6">
        {modelPredictions.map((model) => (
          <Card key={model.name}>
            <CardHeader>
              <CardTitle className="text-base">{model.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {(model.risk * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Risk Score</p>
              </div>
              <Progress value={model.risk * 100} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span>{(model.confidence * 100).toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Importance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SHAP Feature Importance
          </CardTitle>
          <CardDescription>
            Key factors contributing to the prediction (Multi-Parameter Model)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topFeatures.map((feature) => (
            <div key={feature.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{feature.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">{feature.value}</span>
                </div>
                <Badge variant={feature.status === 'critical' ? 'destructive' : 'outline'}>
                  {feature.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={feature.importance * 100} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {(feature.importance * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Timeline</CardTitle>
          <CardDescription>Predicted risk progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "Current", risk: 82, status: "high" },
              { time: "+1 hour", risk: 85, status: "high" },
              { time: "+2 hours", risk: 88, status: "critical" },
              { time: "+4 hours", risk: 91, status: "critical" },
            ].map((point) => (
              <div key={point.time} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium">{point.time}</div>
                <Progress value={point.risk} className="flex-1 h-3" />
                <div className="w-16 text-right text-sm">{point.risk}%</div>
                {point.status === 'critical' ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Upload New Data
        </Button>
        <Button className="flex-1">Download Full Report</Button>
      </div>
    </div>
  );
};

export default PredictionResults;
