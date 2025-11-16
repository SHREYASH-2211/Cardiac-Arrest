// PatientsSection.tsx  (defensive, zero external deps for dates)
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle, CheckCircle } from "lucide-react";

/**
 * Defensive PatientsSection
 * - No date-fns
 * - Safe guards for null/undefined fields
 * - Logs fetch errors to console
 */

const API_BASE = "http://localhost:8000/api/predictions";


type PatientSummary = {
  patientId: string;
  name?: string | null;
  age?: number | null;
  lastPredictionAt?: string | null;
  riskPercent?: number | null; // 0..100
  status?: "low" | "medium" | "high" | null;
};

const safeRelativeTime = (iso?: string | null) => {
  try {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    const now = Date.now();
    const diff = Math.abs(now - d.getTime());
    const mins = Math.round(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } catch (e) {
    console.warn("safeRelativeTime error", e);
    return null;
  }
};

const PatientsSection = () => {
  const [patients, setPatients] = useState<PatientSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/patients`);
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.error("Failed to fetch patients:", res.status, txt);
          if (mounted) setPatients([]);
          return;
        }
        const json = await res.json();
        const arr: PatientSummary[] = Array.isArray(json) ? json : json?.patients ?? [];
        if (mounted) setPatients(arr);
      } catch (err) {
        console.error("Network error fetching patients:", err);
        if (mounted) setPatients([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // filter
  const filtered = (patients ?? []).filter((p) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (p.patientId && p.patientId.toLowerCase().includes(q)) ||
      (p.name && p.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Patient Records</h1>
        <p className="text-muted-foreground">
          Monitor and review cardiac arrest risk predictions across your patient cohort
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient ID or name..."
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading patients…</div>
      ) : patients === null ? (
        <div className="text-sm text-muted-foreground">Initializing…</div>
      ) : patients.length === 0 ? (
        <div className="text-sm text-muted-foreground">No patient records found.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((patient) => {
            const riskPercent = patient?.riskPercent ?? null;
            const riskText = (riskPercent !== null && riskPercent !== undefined) ? `${Math.round(riskPercent)}%` : null;
            const lastPrediction = safeRelativeTime(patient?.lastPredictionAt ?? null);

            return (
              <Card key={patient.patientId} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">{patient.patientId}</h3>

                          {patient.name ? (
                            <span className="text-sm text-muted-foreground">{patient.name}</span>
                          ) : null}

                          {patient.age !== undefined && patient.age !== null ? (
                            <span className="text-sm text-muted-foreground">Age {patient.age}</span>
                          ) : null}
                        </div>

                        {lastPrediction ? (
                          <p className="text-sm text-muted-foreground">Last prediction: {lastPrediction}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        {riskText ? (
                          <>
                            <div className="text-2xl font-bold">{riskText}</div>
                            <p className="text-xs text-muted-foreground">Risk Score</p>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">No risk data</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {patient.status === "high" ? (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-accent" />
                        )}

                        {patient.status ? (
                          <Badge
                            variant={
                              patient.status === "high" ? "destructive" :
                              patient.status === "medium" ? "outline" : "secondary"
                            }
                          >
                            {patient.status.toUpperCase()} RISK
                          </Badge>
                        ) : (
                          <Badge variant="secondary">NO DATA</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientsSection;
