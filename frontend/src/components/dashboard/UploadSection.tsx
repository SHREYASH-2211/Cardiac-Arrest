import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Upload,
  FileImage,
  Activity,
  LineChart,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { multiparameterApiService, PredictionResponse } from "@/lib/multiparameter-api";

/**
 * Safe, minimal UploadSection that preserves your original UI
 * and silently attempts to save results to the backend without
 * crashing the page if the backend is unreachable.
 *
 * If your backend runs on a different host/port change API_BASE.
 */
const API_BASE =
  typeof window !== "undefined" && (window as any).NEXT_PUBLIC_API_BASE
    ? (window as any).NEXT_PUBLIC_API_BASE
    : "http://localhost:8000/api/predictions";

const UploadSection = () => {
  const { toast } = useToast();

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [patientId, setPatientId] = useState<string>("Patient_001");
  const [multiparameterResults, setMultiparameterResults] = useState<{
    predictions: PredictionResponse[];
    summary: {
      total_rows: number;
      predictions_made: number;
      average_risk: number;
      high_risk_count: number;
    };
  } | null>(null);

  // Files
  const [ecgDatFile, setEcgDatFile] = useState<File | null>(null);
  const [ecgHeaFile, setEcgHeaFile] = useState<File | null>(null);
  const [ecgImageFile, setEcgImageFile] = useState<File | null>(null);
  const [vitalsFile, setVitalsFile] = useState<File | null>(null);

  const handleFileUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "ecg-dat") setEcgDatFile(file);
    else if (type === "ecg-hea") setEcgHeaFile(file);
    else if (type === "ecg-image") setEcgImageFile(file);
    else if (type === "vitals") setVitalsFile(file);

    setUploadedFiles((prev) => ({ ...prev, [type]: true }));

    toast({
      title: "File Uploaded",
      description: `${file.name} uploaded successfully`,
    });
  };

  // Defensive backend save — does not throw and logs details
  const safeSave = async (path: string, body: any) => {
    try {
      console.log("[safeSave] POST", `${API_BASE}${path}`, body);
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
        // show friendly toast but do not throw
        toast({
          title: "Save failed",
          description: `Backend ${res.status}: ${
            typeof data === "string" ? data : data?.error || "See console"
          }`,
          variant: "destructive",
        });
        return { ok: false, status: res.status, response: data };
      }

      console.log("[safeSave] saved", data);
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

  // Normalize a risk that might be 0..1 or 0..100 -> percentage 0..100 (defensive)
  const normalizePercent = (value: any) => {
    if (value === null || value === undefined) return null;
    const n = Number(value);
    if (Number.isNaN(n)) return null;
    return n <= 1 ? n * 100 : n;
  };

  // Compute either the most recent prediction's risk (preferred)
  // or the average across predictions. Returns a value in 0..100 or null.
  const computeRecentOrAverageRisk = (results: any): number | null => {
    if (!results) return null;

    const preds: any[] = Array.isArray(results.predictions) ? results.predictions : [];

    // Prefer the last prediction's risk
    if (preds.length > 0) {
      const last = preds[preds.length - 1];
      const candidate =
        last?.risk_probability ??
        last?.prob ??
        last?.probability ??
        last?.risk_score ??
        last?.risk ??
        last?.score ??
        last?.value; // some variants
      const recent = normalizePercent(candidate);
      if (recent !== null) return Math.min(Math.max(recent, 0), 100);
    }

    // Otherwise compute average across all predictions
    const values: number[] = [];
    for (const p of preds) {
      const v =
        p?.risk_probability ??
        p?.prob ??
        p?.probability ??
        p?.risk_score ??
        p?.risk ??
        p?.score ??
        p?.value;
      const n = normalizePercent(v);
      if (n !== null && !Number.isNaN(n)) values.push(n);
    }

    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      return Math.min(Math.max(avg, 0), 100);
    }

    // Last resort: try the summary field if present
    const summaryAvg = normalizePercent(results?.summary?.average_risk ?? null);
    if (summaryAvg !== null) return Math.min(Math.max(summaryAvg, 0), 100);

    return null;
  };

  const handlePredict = async () => {
    // Vitals
    if (vitalsFile) {
      setIsPredicting(true);
      try {
        const csvText = await vitalsFile.text();
        const results = await multiparameterApiService.processCsvData(csvText, patientId);

        // Compute desired average/risk: prefer last recent prediction, else average of predictions
        const computedRisk = computeRecentOrAverageRisk(results);

        // Update results.summary.average_risk so UI reflects the chosen metric
        if (!results.summary) results.summary = {};
        results.summary.average_risk = computedRisk;

        setMultiparameterResults(results);
        setPredictionData({ type: "multiparameter", results });
        setShowResults(true);

        const averageRisk = computedRisk;

        // save but don't allow errors to break the UI
        await safeSave("/vitals", {
          patientId,
          averageRisk,
          summary: results.summary || {},
          rawResult: results || {},
          metadata: { source: "frontend-multiparameter" },
        });

        toast({
          title: "Multi-Parameter Analysis Complete",
          description: `Processed ${results?.summary?.predictions_made ?? "N/A"} — avg ${
            averageRisk !== null ? averageRisk.toFixed(2) + "%" : "N/A"
          }`,
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
      return;
    }

    // ECG Signal
    if (ecgDatFile && ecgHeaFile) {
      setIsPredicting(true);
      try {
        const formData = new FormData();
        formData.append("dat", ecgDatFile);
        formData.append("hea", ecgHeaFile);
        formData.append("patient_id", patientId);

        const response = await fetch(
          "https://cardiac-arrest-ojj9.onrender.com/predict/arrythmia",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          console.warn("ECG signal service returned error", response.status);
          toast({
            title: "Prediction Error",
            description: "ECG service returned an error",
            variant: "destructive",
          });
          setIsPredicting(false);
          return;
        }

        const data = await response.json();
        const rawProb = data?.probability ?? data?.prob ?? data?.risk ?? 0;
        const riskScore = Math.min(Math.max(normalizePercent(rawProb) ?? 0, 0), 100);

        setPredictionData({
          type: "ecg-signal",
          risk_score: riskScore,
          message: data?.message || "AI ECG Signal Analysis Completed",
          patient_id: patientId,
          raw: data,
        });
        setShowResults(true);

        // save but keep UI safe
        await safeSave("/ecg/signal", {
          patientId,
          riskScore,
          message: data?.message ?? "",
          rawResult: data ?? {},
          metadata: { source: "frontend-ecg-signal" },
        });

        toast({ title: "ECG Signal Analysis Complete" });
      } catch (err) {
        console.error("ECG signal error:", err);
        toast({ title: "Error", description: "Failed to generate ECG Signal prediction", variant: "destructive" });
      } finally {
        setIsPredicting(false);
      }
      return;
    }

    // ECG Image
    if (ecgImageFile) {
      setIsPredicting(true);
      try {
        const formData = new FormData();
        formData.append("file", ecgImageFile);
        formData.append("patient_id", patientId);

        const response = await fetch("https://ecg-image-aq2j.onrender.com/predict", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          console.warn("ECG image service returned error", response.status);
          toast({ title: "Prediction Error", description: "ECG image service returned an error", variant: "destructive" });
          setIsPredicting(false);
          return;
        }

        const data = await response.json();
        const predictedClass = data?.predicted_class ?? data?.label ?? null;
        const confidenceScores = data?.confidence_scores ?? data?.scores ?? [];

        setPredictionData({
          type: "ecg-image",
          predicted_class: predictedClass,
          confidence_scores: confidenceScores,
          patient_id: patientId,
          raw: data,
        });
        setShowResults(true);

        await safeSave("/ecg/image", {
          patientId,
          predictedClass,
          confidenceScores,
          rawResult: data ?? {},
          metadata: { source: "frontend-ecg-image" },
        });

        toast({ title: "ECG Image Analysis Complete" });
      } catch (err) {
        console.error("ECG image error:", err);
        toast({ title: "Error", description: "Failed to generate ECG Image prediction", variant: "destructive" });
      } finally {
        setIsPredicting(false);
      }
      return;
    }

    toast({
      title: "No valid files",
      description: "Please upload ECG Signal (.dat + .hea), ECG Image (.jpg/.png), or Vitals CSV",
      variant: "destructive",
    });
  };

  // Render results (unchanged)
  if (showResults && predictionData) {
    return (
      <div className="p-8 space-y-6">
        <Button variant="outline" onClick={() => setShowResults(false)}>
          ← Back
        </Button>
        <Card className="border-primary shadow-lg">
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
            <CardDescription>
              {predictionData.type === "ecg-image"
                ? "AI ECG Image Analysis"
                : predictionData.type === "multiparameter"
                ? "AI Multi-Parameter Vitals Analysis"
                : "AI ECG Signal Risk Score"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {predictionData.type === "ecg-image" && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-500 h-6 w-6" />
                  <p className="text-lg font-semibold">{predictionData.predicted_class}</p>
                </div>
                <p className="text-muted-foreground"><strong>Confidence Scores:</strong></p>
                <ul className="list-disc ml-6 text-sm">
                  {Array.isArray(predictionData.confidence_scores) &&
                    predictionData.confidence_scores.map((score: number, idx: number) => (
                      <li key={idx}>{(score * 100).toFixed(2)}%</li>
                    ))}
                </ul>
              </>
            )}
            {predictionData.type === "ecg-signal" && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-500 h-6 w-6" />
                  <p className="text-lg font-semibold">
                    Risk Score: {predictionData.risk_score?.toFixed?.(2) ?? predictionData.risk_score}%
                  </p>
                </div>
                <p className="text-muted-foreground">{predictionData.message}</p>
              </>
            )}
            {predictionData.type === "multiparameter" && (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Total Rows</p>
                      <p className="text-2xl font-bold text-blue-800">{predictionData.results?.summary?.total_rows}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Predictions Made</p>
                      <p className="text-2xl font-bold text-green-800">{predictionData.results?.summary?.predictions_made}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-orange-600 font-medium">Average Risk</p>
                      <p className="text-2xl font-bold text-orange-800">
                        {(() => {
                          const avg = predictionData.results?.summary?.average_risk;
                          const n = normalizePercent(avg);
                          return n !== null ? `${n.toFixed(1)}%` : "N/A";
                        })()}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">High Risk Alerts</p>
                      <p className="text-2xl font-bold text-red-800">{predictionData.results?.summary?.high_risk_count ?? 0}</p>
                    </div>
                  </div>

                  {predictionData.results?.summary?.high_risk_count > 0 && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="text-red-500 h-5 w-5" />
                        <p className="text-red-800 font-semibold">
                          🚨 {predictionData.results.summary.high_risk_count} High Risk Predictions Detected!
                        </p>
                      </div>
                      <p className="text-red-600 text-sm mt-1">Immediate medical attention may be required for this patient.</p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Recent Predictions</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Array.isArray(predictionData.results?.predictions) &&
                        predictionData.results.predictions.slice(-5).map((pred: PredictionResponse, idx: number) => (
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main UI (unchanged)
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Patient Data</h1>
        <p className="text-muted-foreground">
          Upload ECG Signal (.dat + .hea) or ECG Image (.jpg/.png)
        </p>
      </div>

      <Tabs defaultValue="ecg-image" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ecg-image"><FileImage className="h-4 w-4 mr-2" />ECG Image</TabsTrigger>
          <TabsTrigger value="ecg-signal"><Activity className="h-4 w-4 mr-2" />ECG Signal</TabsTrigger>
          <TabsTrigger value="vitals"><LineChart className="h-4 w-4 mr-2" />Vitals</TabsTrigger>
        </TabsList>

        {/* ECG Image */}
        <TabsContent value="ecg-image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ECG Image Upload</CardTitle>
              <CardDescription>Upload JPG/PNG ECG Image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-id-ecg-image">Patient ID</Label>
                <Input id="patient-id-ecg-image" type="text" placeholder="Patient_001" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="ecg-image" className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                  <Input id="ecg-image" type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileUpload("ecg-image", e)} />
                </Label>
              </div>
              {ecgImageFile && <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-5 w-5" /><span className="text-sm font-medium">{ecgImageFile.name} ready ✅</span></div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ECG Signal */}
        <TabsContent value="ecg-signal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ECG Signal Upload</CardTitle>
              <CardDescription>Upload .dat + .hea files for AI Risk Score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-id-ecg-signal">Patient ID</Label>
                <Input id="patient-id-ecg-signal" type="text" placeholder="Patient_001" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Label htmlFor="ecg-dat" className="cursor-pointer">
                    <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload .dat file</span>
                    <Input id="ecg-dat" type="file" accept=".dat" className="hidden" onChange={(e) => handleFileUpload("ecg-dat", e)} />
                  </Label>
                  {ecgDatFile && <p className="text-xs text-green-600 mt-2">{ecgDatFile.name} ✅</p>}
                </div>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Label htmlFor="ecg-hea" className="cursor-pointer">
                    <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload .hea file</span>
                    <Input id="ecg-hea" type="file" accept=".hea" className="hidden" onChange={(e) => handleFileUpload("ecg-hea", e)} />
                  </Label>
                  {ecgHeaFile && <p className="text-xs text-green-600 mt-2">{ecgHeaFile.name} ✅</p>}
                </div>
              </div>
              {ecgDatFile && ecgHeaFile && <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-5 w-5" /><span className="text-sm font-medium">Files ready for prediction</span></div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vitals */}
        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Parameter Vitals</CardTitle>
              <CardDescription>Upload CSV file with patient vitals for real-time cardiac arrest prediction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-xs text-muted-foreground">
                <strong>Required columns:</strong> Patient_ID, time, HR [bpm], SpO2 [%], NBPs [mmHg], NBPd [mmHg], NBPm [mmHg], RR [rpm], QTc [msec], DeltaQTc [msec], QT [msec], QT-HR [bpm], ST-III [mm], ST-V [mm], PVC [/min], Perf [NU], Pulse (NBP) [bpm], Pulse (SpO2) [bpm], btbHR [bpm]
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-id">Patient ID</Label>
                <Input id="patient-id" type="text" placeholder="Patient_001" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="vitals" className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">Upload CSV file with vitals data</span>
                  <Input id="vitals" type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload("vitals", e)} />
                </Label>
              </div>
              {vitalsFile && <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-5 w-5" /><span className="text-sm font-medium">{vitalsFile.name} uploaded ✅</span></div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <Button onClick={handlePredict} size="lg" className="w-full" disabled={isPredicting || (!ecgDatFile && !ecgHeaFile && !ecgImageFile && !vitalsFile)}>
            {isPredicting ? "Generating Prediction..." : "Generate AI Prediction"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadSection;
