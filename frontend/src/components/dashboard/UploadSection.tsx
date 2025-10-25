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
import PredictionResults from "./PredictionResults";

const UploadSection = () => {
  const { toast } = useToast();

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);

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

  const handlePredict = async () => {
    // 🔹 ECG Signal Prediction
    if (ecgDatFile && ecgHeaFile) {
      setIsPredicting(true);
      try {
        const formData = new FormData();
        formData.append("dat", ecgDatFile);
        formData.append("hea", ecgHeaFile);

        const response = await fetch(
          "https://cardiac-arrest-ojj9.onrender.com/predict/arrythmia",
          { method: "POST", body: formData }
        );

        if (!response.ok) throw new Error("ECG Signal prediction failed");

        const data = await response.json();

        // Risk score as percentage
        const riskPercentage = Math.min(Math.max(data.probability * 100, 0), 100);

        setPredictionData({
          type: "ecg-signal",
          risk_score: riskPercentage,
          message: data.message || "AI ECG Signal Analysis Completed",
        });

        setShowResults(true);
        toast({ title: "ECG Signal Analysis Complete" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate ECG Signal prediction",
          variant: "destructive",
        });
      } finally {
        setIsPredicting(false);
      }
      return;
    }

    // 🔹 ECG Image Prediction
    if (ecgImageFile) {
      setIsPredicting(true);
      try {
        const formData = new FormData();
        formData.append("file", ecgImageFile);

        const response = await fetch("https://ecg-image-aq2j.onrender.com/predict", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("ECG Image prediction failed");

        const data = await response.json();

        setPredictionData({
          type: "ecg-image",
          predicted_class: data.predicted_class,
          confidence_scores: data.confidence_scores,
        });

        setShowResults(true);
        toast({ title: "ECG Image Analysis Complete" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate ECG Image prediction",
          variant: "destructive",
        });
      } finally {
        setIsPredicting(false);
      }
      return;
    }

    toast({
      title: "No valid files",
      description: "Please upload ECG Signal (.dat + .hea) or ECG Image (.jpg/.png)",
      variant: "destructive",
    });
  };

  // 🔹 Render Results
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
                  {predictionData.confidence_scores.map((score: number, idx: number) => (
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
                    Risk Score: {predictionData.risk_score.toFixed(2)}%
                  </p>
                </div>
                <p className="text-muted-foreground">{predictionData.message}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🔹 Main Upload UI
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
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="ecg-image" className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                  <Input id="ecg-image" type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileUpload("ecg-image", e)} />
                </Label>
              </div>
              {ecgImageFile && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">{ecgImageFile.name} ready ✅</span>
                </div>
              )}
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
              {ecgDatFile && ecgHeaFile && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Files ready for prediction</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vitals */}
        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Parameter Vitals</CardTitle>
              <CardDescription>Upload CSV file with patient vitals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-xs text-muted-foreground">
                Required columns: Patient_ID, HR, SpO₂, BP, QTc, etc.
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="vitals" className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">Upload CSV file</span>
                  <Input id="vitals" type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload("vitals", e)} />
                </Label>
              </div>
              {vitalsFile && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">{vitalsFile.name} uploaded ✅</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Predict Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handlePredict}
            size="lg"
            className="w-full"
            disabled={
              isPredicting ||
              (!ecgDatFile && !ecgHeaFile && !ecgImageFile && !vitalsFile)
            }
          >
            {isPredicting ? "Generating Prediction..." : "Generate AI Prediction"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadSection;
