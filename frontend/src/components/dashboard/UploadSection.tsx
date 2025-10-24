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

  const handleFileUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock validation
      const isValid = type === 'vitals' ? file.name.endsWith('.csv') : true;
      
      setUploadedFiles(prev => ({ ...prev, [type]: true }));
      
      if (type === 'vitals' && isValid) {
        setCsvValidated(true);
      }

      toast({
        title: "File Uploaded",
        description: `${file.name} uploaded successfully`,
      });
    }
  };

  const handlePredict = () => {
    if (Object.keys(uploadedFiles).length === 0) {
      toast({
        title: "No Data",
        description: "Please upload at least one data type",
        variant: "destructive",
      });
      return;
    }
    
    setShowResults(true);
    toast({
      title: "Analysis Complete",
      description: "AI prediction generated successfully",
    });
  };

  if (showResults) {
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
                    onChange={(e) => handleFileUpload('ecg-image', e)}
                  />
                </Label>
              </div>
              {uploadedFiles['ecg-image'] && (
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">ECG image uploaded successfully</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ecg-signal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ECG Signal Upload</CardTitle>
              <CardDescription>
                Upload ECG signal data (CSV format with time vs amplitude) or enter manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="ecg-signal" className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">
                    Upload CSV file (time, amplitude)
                  </span>
                  <Input
                    id="ecg-signal"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload('ecg-signal', e)}
                  />
                </Label>
              </div>
              {uploadedFiles['ecg-signal'] && (
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">ECG signal uploaded successfully</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                  <span className="text-sm text-muted-foreground">
                    Upload multi-parameter CSV file
                  </span>
                  <Input
                    id="vitals"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload('vitals', e)}
                  />
                </Label>
              </div>

              {uploadedFiles['vitals'] && (
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
            disabled={Object.keys(uploadedFiles).length === 0}
          >
            Generate AI Prediction
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadSection;
