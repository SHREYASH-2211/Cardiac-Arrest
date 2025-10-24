import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle, CheckCircle } from "lucide-react";

const PatientsSection = () => {
  const patients = [
    { id: "1032", name: "John D.", age: 62, risk: 0.12, status: "low", lastPrediction: "2 hours ago" },
    { id: "1031", name: "Sarah M.", age: 58, risk: 0.87, status: "high", lastPrediction: "5 hours ago" },
    { id: "1030", name: "Robert K.", age: 71, risk: 0.54, status: "medium", lastPrediction: "1 day ago" },
    { id: "1029", name: "Emily R.", age: 45, risk: 0.23, status: "low", lastPrediction: "1 day ago" },
    { id: "1028", name: "Michael B.", age: 66, risk: 0.78, status: "high", lastPrediction: "2 days ago" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Patient Records</h1>
        <p className="text-muted-foreground">
          Monitor and review cardiac arrest risk predictions across your patient cohort
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by patient ID or name..." className="pl-10" />
      </div>

      {/* Patients List */}
      <div className="grid gap-4">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">Patient #{patient.id}</h3>
                      <span className="text-sm text-muted-foreground">{patient.name}</span>
                      <span className="text-sm text-muted-foreground">Age {patient.age}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last prediction: {patient.lastPrediction}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {(patient.risk * 100).toFixed(0)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {patient.status === 'high' ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    )}
                    <Badge
                      variant={
                        patient.status === 'high'
                          ? 'destructive'
                          : patient.status === 'medium'
                          ? 'outline'
                          : 'secondary'
                      }
                    >
                      {patient.status.toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatientsSection;
