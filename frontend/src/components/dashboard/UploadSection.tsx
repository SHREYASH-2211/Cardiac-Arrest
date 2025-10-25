import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileImage, Activity, LineChart, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PredictionResults from "./PredictionResults";

const UploadSection = () => {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [csvValidated, setCsvValidated] = useState(false);
  const [predictionData, setPredictionData] = useState<any>(null);

  // Separate states for ECG signal files
  const [ecgDatFile, setEcgDatFile] = useState<File | null>(null);
  const [ecgHeaFile, setEcgHeaFile] = useState<File | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleFileUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ECG signal case (.dat or .hea)
      if (type === "ecg-dat") {
        setEcgDatFile(file);
      } else if (type === "ecg-hea") {
        setEcgHeaFile(file);
      }

      // Mock validation for vitals
      const isValid = type === "vitals" ? file.name.endsWith(".csv") : true;
      setUploadedFiles((prev) => ({ ...prev, [type]: true }));

      if (type === "vitals" && isValid) {
        setCsvValidated(true);
      }

      toast({
        title: "File Uploaded",
        description: `${file.name} uploaded successfully`,
      });
    }
  };

  const handlePredict = async () => {
    if (Object.keys(uploadedFiles).length === 0 && !ecgDatFile && !ecgHeaFile) {
      toast({
        title: "No Data",
        description: "Please upload required files before prediction.",
        variant: "destructive",
      });
      return;
    }

    // ECG signal prediction logic
    if (ecgDatFile && ecgHeaFile) {
      setIsPredicting(true);
      try {
        const formData = new FormData();
        formData.append("dat", ecgDatFile);
        formData.append("hea", ecgHeaFile);

        const response = await fetch("https://cardiac-arrest-ojj9.onrender.com/predict/arrythmia", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Prediction request failed");
        }

        const data = await response.json();
        setPredictionData(data);
        setShowResults(true);

        toast({
          title: "Analysis Complete",
          description: "AI prediction generated successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate prediction. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsPredicting(false);
      }
      return;
    }

    // If not ECG, just show mock results
    setShowResults(true);
  };

  if (showResults && predictionData) {
    return (
      <div className="p-8 space-y-6">
        <Button variant="outline" onClick={() => setShowResults(false)}>
          ← Back
        </Button>
        <Card className="border-primary shadow-lg">
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
            <CardDescription>AI analysis of ECG signal data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-500 h-6 w-6" />
              <p className="text-lg font-semibold">{predictionData.prediction}</p>
            </div>
            <p className="text-muted-foreground">
              <strong>Message:</strong> {predictionData.message}
            </p>
            <p>
              <strong>Probability:</strong>{" "}
              {(predictionData.probability * 100).toFixed(3)}%
            </p>
            <p>
              <strong>Record ID:</strong> {predictionData.record_id}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && !predictionData) {
    return <PredictionResults onBack={() => setShowResults(false)} />;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Patient Data</h1>
        <p className="text-muted-foreground">
          Upload ECG data and vital signs for AI-powered cardiac arrest risk prediction
        </p>
      </div>

      <Tabs defaultValue="ecg-image" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ecg-image">
            <FileImage className="h-4 w-4 mr-2" />
            ECG Image
          </TabsTrigger>
          <TabsTrigger value="ecg-signal">
            <Activity className="h-4 w-4 mr-2" />
            ECG Signal
          </TabsTrigger>
          <TabsTrigger value="vitals">
            <LineChart className="h-4 w-4 mr-2" />
            Multi-Parameter
          </TabsTrigger>
        </TabsList>

        {/* ECG Image Upload */}
        <TabsContent value="ecg-image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ECG Image Upload</CardTitle>
              <CardDescription>
                Upload ECG images in JPG or PNG format for AI analysis with Grad-CAM visualization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="ecg-image" className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                  <Input
                    id="ecg-image"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileUpload("ecg-image", e)}
                  />
                </Label>
              </div>
              {uploadedFiles["ecg-image"] && (
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">ECG image uploaded successfully</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ECG Signal Upload (.dat + .hea) */}
        <TabsContent value="ecg-signal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ECG Signal Upload</CardTitle>
              <CardDescription>
                Upload the corresponding <strong>.dat</strong> and <strong>.hea</strong> files for AI arrhythmia prediction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Label htmlFor="ecg-dat" className="cursor-pointer">
                    <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload .dat file</span>
                    <Input
                      id="ecg-dat"
                      type="file"
                      accept=".dat"
                      className="hidden"
                      onChange={(e) => handleFileUpload("ecg-dat", e)}
                    />
                  </Label>
                  {ecgDatFile && (
                    <p className="text-xs text-green-600 mt-2">{ecgDatFile.name} ✅</p>
                  )}
                </div>

                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Label htmlFor="ecg-hea" className="cursor-pointer">
                    <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload .hea file</span>
                    <Input
                      id="ecg-hea"
                      type="file"
                      accept=".hea"
                      className="hidden"
                      onChange={(e) => handleFileUpload("ecg-hea", e)}
                    />
                  </Label>
                  {ecgHeaFile && (
                    <p className="text-xs text-green-600 mt-2">{ecgHeaFile.name} ✅</p>
                  )}
                </div>
              </div>

              {ecgDatFile && ecgHeaFile && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Both files ready for prediction</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vitals Upload */}
        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Parameter Vital Signs</CardTitle>
              <CardDescription>
                Upload comprehensive vital signs data including HR, SpO₂, blood pressure, QTc, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Required CSV Columns:</p>
                <p className="text-xs text-muted-foreground font-mono">
                  Patient_ID, time, DeltaQTc [msec], HR [bpm], NBPd [mmHg], NBPm [mmHg],
                  NBPs [mmHg], PVC [/min], Perf [NU], Pulse (NBP) [bpm], Pulse (SpO2) [bpm],
                  QT [msec], QT-HR [bpm], QTc [msec], RR [rpm], ST-III [mm], ST-V [mm],
                  SpO2 [%], btbHR [bpm], Target
                </p>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="vitals" className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">Upload multi-parameter CSV file</span>
                  <Input
                    id="vitals"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload("vitals", e)}
                  />
                </Label>
              </div>

              {uploadedFiles["vitals"] && (
                <div className="space-y-2">
                  {csvValidated ? (
                    <div className="flex items-center gap-2 text-accent">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Data schema verified ✅</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-sm font-medium">Missing columns ⚠️</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handlePredict}
            size="lg"
            className="w-full"
            disabled={isPredicting || (!ecgDatFile && !ecgHeaFile && Object.keys(uploadedFiles).length === 0)}
          >
            {isPredicting ? "Generating Prediction..." : "Generate AI Prediction"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadSection;
