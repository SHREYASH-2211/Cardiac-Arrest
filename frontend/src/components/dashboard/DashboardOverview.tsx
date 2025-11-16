import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileHeart, TrendingUp, AlertCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

/**
 * Live DashboardOverview
 *
 * Endpoints:
 *  - GET http://localhost:8000/api/predictions/patients   (required)
 *  - GET http://localhost:8000/api/predictions/count      (optional)
 *  - GET http://localhost:8000/api/analytics              (optional)
 *
 * Defensive: falls back to the original hardcoded values if endpoints aren't available.
 */

const PATIENTS_API = "http://localhost:8000/api/predictions/patients";
const PRED_COUNT_API = "http://localhost:8000/api/predictions/count";
const ANALYTICS_API = "http://localhost:8000/api/analytics";

const isWithinLastDays = (iso: string | null | undefined, days = 30) => {
  if (!iso) return false;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

const normalizeRiskValue = (v: any) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return n <= 1 ? n * 100 : n; // convert 0..1 to 0..100
};

const DashboardOverview = () => {
  const user = getCurrentUser();
  const isDoctor = user?.role === "doctor";

  const [patients, setPatients] = useState<any[] | null>(null);
  const [patientsError, setPatientsError] = useState<string | null>(null);

  const [totalPredictionsApi, setTotalPredictionsApi] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);

  // Fetch patients feed
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(PATIENTS_API, { signal: controller.signal });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.error("Failed to fetch patients:", res.status, txt);
          if (mounted) {
            setPatients([]);
            setPatientsError(`Server ${res.status}`);
          }
          return;
        }
        const json = await res.json().catch(() => null);
        const arr: any[] = Array.isArray(json) ? json : json?.patients ?? [];
        if (!Array.isArray(arr)) {
          console.warn("Unexpected patients payload:", json);
          if (mounted) {
            setPatients([]);
            setPatientsError("Invalid patients response");
          }
          return;
        }
        if (mounted) {
          setPatients(arr);
          setPatientsError(null);
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Network error fetching patients:", err);
        if (mounted) {
          setPatients([]);
          setPatientsError(String(err ?? "Network error"));
        }
      }
    };

    load();
    return () => {
      mounted = false;
      try { controller.abort(); } catch {}
    };
  }, []);

  // Try optional endpoints (non-critical)
  useEffect(() => {
    let mounted = true;
    const c1 = new AbortController();
    (async () => {
      try {
        const res = await fetch(PRED_COUNT_API, { signal: c1.signal });
        if (res.ok) {
          const j = await res.json().catch(() => null);
          const n = j?.total_predictions ?? j?.count ?? null;
          if (mounted && typeof n === "number") setTotalPredictionsApi(n);
        }
      } catch (e) {
        // ignore—optional endpoint
      }
    })();
    return () => { mounted = false; try { c1.abort(); } catch {} };
  }, []);

  useEffect(() => {
    let mounted = true;
    const c2 = new AbortController();
    (async () => {
      try {
        const res = await fetch(ANALYTICS_API, { signal: c2.signal });
        if (res.ok) {
          const j = await res.json().catch(() => null);
          if (mounted && j) setAnalytics(j);
        }
      } catch (e) {
        // ignore—optional
      }
    })();
    return () => { mounted = false; try { c2.abort(); } catch {} };
  }, []);

  // Derived metrics from patients feed
  const derived = useMemo(() => {
    const arr = patients ?? [];

    // high risk count
    const highCount = arr.reduce((acc, p) => {
      try {
        const status = (p?.status ?? "").toString().toLowerCase();
        if (status === "high") return acc + 1;
        const rp = p?.riskPercent ?? p?.risk ?? p?.risk_percent ?? null;
        const norm = normalizeRiskValue(rp);
        if (norm !== null && norm >= 80) return acc + 1;
      } catch {}
      return acc;
    }, 0);

    // active patients
    const activePatients = arr.length;

    // uploads this month (patients with lastPredictionAt within last 30 days)
    const uploadsThisMonth = arr.reduce((acc, p) => {
      const last = p?.lastPredictionAt ?? p?.last_prediction_at ?? p?.timestamp ?? null;
      if (isWithinLastDays(last, 30)) return acc + 1;
      return acc;
    }, 0);

    // fallback "total predictions" estimate: sum of predictions_made if present else number of patients
    const totalPredFallback = arr.reduce((acc, p) => {
      const pm = p?.predictions_made ?? p?.predictions ?? p?.count ?? null;
      if (typeof pm === "number") return acc + pm;
      return acc + 1;
    }, 0);

    // recent predictions: pick up to 3 most-recent items by timestamp-like fields
    const recent = [...arr]
      .sort((a, b) => {
        const ta = (a?.lastPredictionAt ?? a?.last_prediction_at ?? a?.timestamp ?? "") || "";
        const tb = (b?.lastPredictionAt ?? b?.last_prediction_at ?? b?.timestamp ?? "") || "";
        return (tb as string).localeCompare(ta as string);
      })
      .slice(0, 3)
      .map((p) => {
        const status = (p?.status ?? "").toString().toLowerCase();
        let riskLabel = "Low";
        if (status === "high") riskLabel = "High";
        else if (status === "medium") riskLabel = "Medium";
        else {
          const rp = p?.riskPercent ?? p?.risk ?? p?.risk_percent ?? null;
          const n = normalizeRiskValue(rp);
          if (n !== null) {
            if (n >= 80) riskLabel = "High";
            else if (n >= 40) riskLabel = "Medium";
            else riskLabel = "Low";
          }
        }
        const last = p?.lastPredictionAt ?? p?.last_prediction_at ?? p?.timestamp ?? null;
        let dateStr = "Unknown";
        if (last) {
          try { dateStr = new Date(last).toLocaleString(); } catch { dateStr = String(last); }
        }
        const rpRaw = p?.riskPercent ?? p?.risk ?? p?.risk_percent ?? null;
        const rpNorm = normalizeRiskValue(rpRaw);
        return {
          patient: isDoctor ? `Patient #${p?.patientId ?? p?.patient_id ?? "?"}` : "Your Record",
          risk: riskLabel,
          date: dateStr,
          riskValue: rpNorm !== null ? (rpNorm / 100).toFixed(2) : null, // display as 0..1 like original sample (0.12 etc.)
        };
      });

    return { highCount, activePatients, uploadsThisMonth, totalPredFallback, recent };
  }, [patients, isDoctor]);

  // Build stats grid using live values with fallbacks to your original hardcoded values
  const stats = useMemo(() => {
    // Accuracy from analytics if present (0..1 or 0..100)
    let accuracyDisplay = "94.2%";
    let accuracyChangeDisplay = "+1.2%";
    try {
      const g = analytics?.global ?? analytics?.summary ?? analytics;
      if (g) {
        const raw = g?.model_accuracy ?? g?.accuracy ?? null;
        if (raw !== null && raw !== undefined) {
          const n = Number(raw);
          const pct = n <= 1 ? n * 100 : n;
          accuracyDisplay = `${pct.toFixed(1)}%`;
        }
        const delta = g?.accuracy_delta ?? g?.delta ?? null;
        if (delta !== null && delta !== undefined) {
          const d = Number(delta);
          const dpct = Math.abs(d) <= 1 ? d * 100 : d;
          const sign = d >= 0 ? "+" : "-";
          accuracyChangeDisplay = `${sign}${Math.abs(dpct).toFixed(1)}%`;
        }
      }
    } catch {
      /* ignore */
    }

    const totalPred = typeof totalPredictionsApi === "number" ? String(totalPredictionsApi) : String(derived.totalPredFallback ?? (isDoctor ? 147 : 12));
    const highRisk = String(derived.highCount ?? (isDoctor ? 8 : 1));
    const active = String(isDoctor ? derived.activePatients ?? 42 : derived.uploadsThisMonth ?? 5);

    return [
      {
        title: "Total Predictions",
        value: totalPred,
        change: "+12%", // keep original change indicator (no backend provided)
        icon: Activity,
        color: "text-primary",
      },
      {
        title: "High Risk Cases",
        value: highRisk,
        change: "-2%",
        icon: AlertCircle,
        color: "text-destructive",
      },
      {
        title: "Accuracy Rate",
        value: accuracyDisplay,
        change: accuracyChangeDisplay,
        icon: TrendingUp,
        color: "text-accent",
      },
      {
        title: isDoctor ? "Active Patients" : "Uploads This Month",
        value: active,
        change: "+8%",
        icon: FileHeart,
        color: "text-primary",
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derived, analytics, totalPredictionsApi, isDoctor]);

  // Recent activity list (fallback to original sample if none)
  const recentActivity = (derived.recent && derived.recent.length > 0)
    ? derived.recent
    : [
        { patient: isDoctor ? "Patient #1032" : "Your Record", risk: "Low", date: "2 hours ago", riskValue: 0.12 },
        { patient: isDoctor ? "Patient #1031" : "Your Record", risk: "High", date: "5 hours ago", riskValue: 0.87 },
        { patient: isDoctor ? "Patient #1030" : "Your Record", risk: "Medium", date: "1 day ago", riskValue: 0.54 },
      ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">
          {isDoctor ? "Monitor patient predictions and review critical cases" : "Track your cardiac health metrics and predictions"}
        </p>
        {patientsError ? <p className="text-xs text-destructive mt-1">Patients feed error: {patientsError}</p> : null}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.change && stat.change.startsWith("+") ? "text-accent" : "text-destructive"}>
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Predictions</CardTitle>
            <CardDescription>Latest cardiac arrest risk assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{item.patient}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.risk === "High"
                        ? "bg-destructive/10 text-destructive"
                        : item.risk === "Medium"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {item.risk} Risk
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Score: {item.riskValue ?? "N/A"}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-4 text-left border rounded-lg hover:bg-accent/50 transition-colors">
              <p className="font-medium">Upload New ECG Data</p>
              <p className="text-sm text-muted-foreground">Process ECG images or signals</p>
            </button>
            <button className="w-full p-4 text-left border rounded-lg hover:bg-accent/50 transition-colors">
              <p className="font-medium">Upload Vital Signs</p>
              <p className="text-sm text-muted-foreground">Multi-parameter data analysis</p>
            </button>
            {isDoctor && (
              <button className="w-full p-4 text-left border rounded-lg hover:bg-accent/50 transition-colors">
                <p className="font-medium">Review High Risk Patients</p>
                <p className="text-sm text-muted-foreground">{derived.highCount ?? 8} cases require attention</p>
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
