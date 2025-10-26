import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { multiparameterApiService, VitalsInput } from "@/lib/multiparameter-api";
import { useToast } from "@/hooks/use-toast";
import { Activity, CheckCircle2, AlertTriangle } from "lucide-react";

const MultiparameterTest = () => {
  const { toast } = useToast();
  const [patientId, setPatientId] = useState("Patient_001");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Sample vitals data for testing
  const sampleVitals: VitalsInput = {
    'DeltaQTc [msec]': 15.2,
    'HR [bpm]': 85,
    'NBPd [mmHg]': 70,
    'NBPm [mmHg]': 85,
    'NBPs [mmHg]': 100,
    'PVC [/min]': 2.1,
    'Perf [NU]': 0.8,
    'Pulse (NBP) [bpm]': 85,
    'Pulse (SpO2) [bpm]': 85,
    'QT [msec]': 380,
    'QT-HR [bpm]': 85,
    'QTc [msec]': 420,
    'RR [rpm]': 16,
    'ST-III [mm]': 0.1,
    'ST-V [mm]': 0.2,
    'SpO2 [%]': 98,
    'btbHR [bpm]': 85,
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const health = await multiparameterApiService.healthCheck();
      toast({
        title: "Connection Successful",
        description: health.status,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to multiparameter API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPrediction = async () => {
    setIsLoading(true);
    try {
      const prediction = await multiparameterApiService.predictRisk(patientId, sampleVitals);
      setResult(prediction);
      toast({
        title: "Prediction Complete",
        description: `Risk: ${(prediction.risk_probability * 100).toFixed(2)}%`,
      });
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: "Could not generate prediction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Multi-Parameter API Test</h1>
        <p className="text-muted-foreground">
          Test the connection and prediction functionality of the multiparameter API
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Connection Test
            </CardTitle>
            <CardDescription>Test connection to multiparameter API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Testing..." : "Test Connection"}
            </Button>
          </CardContent>
        </Card>

        {/* Prediction Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Prediction Test
            </CardTitle>
            <CardDescription>Test prediction with sample vitals data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-patient-id">Patient ID</Label>
              <Input
                id="test-patient-id"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Patient_001"
              />
            </div>
            <Button
              onClick={handleTestPrediction}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Predicting..." : "Test Prediction"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Prediction Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Patient ID</p>
                <p className="text-lg font-bold text-blue-800">{result.patient_id}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Risk Probability</p>
                <p className="text-lg font-bold text-orange-800">
                  {(result.risk_probability * 100).toFixed(2)}%
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Predicted Class</p>
                <p className="text-lg font-bold text-green-800">
                  {result.predicted_class === 1 ? "High Risk" : "Low Risk"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Status</p>
                <p className="text-lg font-bold text-gray-800">{result.status_message}</p>
              </div>
            </div>

            {result.predicted_class === 1 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-500 h-5 w-5" />
                  <p className="text-red-800 font-semibold">
                    🚨 High Risk Prediction Detected!
                  </p>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  Immediate medical attention may be required for this patient.
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sample Vitals Used:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div>HR: {sampleVitals['HR [bpm]']} bpm</div>
                <div>SpO2: {sampleVitals['SpO2 [%]']}%</div>
                <div>BP: {sampleVitals['NBPs [mmHg]']}/{sampleVitals['NBPd [mmHg]']} mmHg</div>
                <div>RR: {sampleVitals['RR [rpm]']} rpm</div>
                <div>QTc: {sampleVitals['QTc [msec]']} msec</div>
                <div>PVC: {sampleVitals['PVC [/min]']} /min</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiparameterTest;
