import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw, Pause, Play } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

/**
 * Live Risk Distribution using patients feed.
 * Keeps all hardcoded metrics and model performance EXACTLY as requested.
 *
 * Features added:
 *  - Manual Refresh button
 *  - Auto-refresh (polling) toggle (30s)
 *  - Last refreshed timestamp display
 *
 * Patients endpoint (same used in PatientsSection):
 *   GET http://localhost:8000/api/predictions/patients
 *
 * Expected patient object fields used:
 *   - patientId
 *   - status (optional): "high" | "medium" | "low"
 *   - riskPercent (optional): number 0..100
 *
 * If status is absent, riskPercent will be used to derive buckets.
 */

const PATIENTS_API = "http://localhost:8000/api/predictions/patients";
const POLL_INTERVAL_MS = 30_000;

const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

const AnalyticsSection = () => {
  const user = getCurrentUser();
  const isDoctor = user?.role === "doctor";

  // Distribution state
  const [loadingDist, setLoadingDist] = useState<boolean>(true);
  const [distError, setDistError] = useState<string | null>(null);
  const [highCount, setHighCount] = useState<number>(8); // default fallback (kept visually if fetch fails)
  const [medCount, setMedCount] = useState<number>(12);
  const [lowCount, setLowCount] = useState<number>(22);
  const [highPct, setHighPct] = useState<number>(19);
  const [medPct, setMedPct] = useState<number>(29);
  const [lowPct, setLowPct] = useState<number>(52);

  // refresh / polling
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true); // default: auto-refresh enabled
  const pollRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const computeDistributionFromArray = (arr: any[]) => {
    let high = 0;
    let med = 0;
    let low = 0;

    for (const p of arr) {
      const status = (p?.status ?? null) ? String(p.status).toLowerCase() : null;
      if (status === "high") {
        high += 1;
        continue;
      }
      if (status === "medium") {
        med += 1;
        continue;
      }
      if (status === "low") {
        low += 1;
        continue;
      }

      const rpRaw = p?.riskPercent ?? p?.risk ?? p?.risk_percent ?? null;
      const rp = rpRaw === null || rpRaw === undefined ? null : Number(rpRaw);
      if (!Number.isNaN(rp) && rp !== null) {
        if (rp >= 80) high += 1;
        else if (rp >= 40) med += 1;
        else low += 1;
      } else {
        // missing data — count as low by default (non-alarm)
        low += 1;
      }
    }

    const total = high + med + low || 1;
    const hp = Math.round((high / total) * 100);
    const mp = Math.round((med / total) * 100);
    const lp = Math.round((low / total) * 100);

    return { high, med, low, hp, mp, lp };
  };

  const fetchDistribution = async (signal?: AbortSignal) => {
    setLoadingDist(true);
    setDistError(null);

    // Cancel any previous inflight fetch
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch {}
      abortRef.current = null;
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(PATIENTS_API, { method: "GET", signal: signal ?? controller.signal });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("Failed to fetch patients for analytics:", res.status, txt);
        setDistError(`Server returned ${res.status}`);
        // keep fallback values unchanged
        return;
      }
      const json = await res.json().catch(() => null);
      const arr: any[] = Array.isArray(json) ? json : json?.patients ?? [];
      if (!Array.isArray(arr)) {
        console.warn("Unexpected patients payload", json);
        setDistError("Invalid patients response");
        return;
      }

      const { high, med, low, hp, mp, lp } = computeDistributionFromArray(arr);

      setHighCount(high);
      setMedCount(med);
      setLowCount(low);
      setHighPct(hp);
      setMedPct(mp);
      setLowPct(lp);
      setLastUpdated(new Date().toISOString());
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // ignore abort
      } else {
        console.error("Network error fetching patients for analytics:", err);
        setDistError(String(err ?? "Network error"));
      }
    } finally {
      setLoadingDist(false);
    }
  };

  // initial load + manage auto-refresh interval
  useEffect(() => {
    let mounted = true;

    // initial fetch
    fetchDistribution();

    // setup polling
    if (autoRefresh) {
      // setInterval returns number in browsers
      pollRef.current = window.setInterval(() => {
        if (!mounted) return;
        fetchDistribution();
      }, POLL_INTERVAL_MS);
    }

    return () => {
      mounted = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch {}
        abortRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // toggle auto-refresh effect (start/stop interval)
  useEffect(() => {
    // stop any existing interval
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (autoRefresh) {
      // immediate fetch then schedule
      fetchDistribution();
      pollRef.current = window.setInterval(() => {
        fetchDistribution();
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    fetchDistribution();
  };

  const showTimestamp = (iso: string | null) => {
    if (!iso) return "Never";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            {isDoctor
              ? "Population-level insights and model performance metrics"
              : "Your personal health trends and prediction history"}
          </p>
          <div className="text-xs text-muted-foreground mt-1">
            <span className="mr-2">Distribution last refreshed: {lastUpdated ? showTimestamp(lastUpdated) : "Never"}</span>
            {loadingDist ? <span>Loading…</span> : distError ? <span className="text-destructive">Error loading live data</span> : <span>Live</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleManualRefresh} title="Refresh">
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2 text-xs">Refresh</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoRefresh((s) => !s)}
            title={autoRefresh ? "Stop auto refresh" : "Start auto refresh"}
          >
            {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="ml-2 text-xs">{autoRefresh ? "Auto: On" : "Auto: Off"}</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics (HARD-CODED — unchanged) */}
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

      {/* Risk Distribution (LIVE) */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>
            {isDoctor ? "Distribution of risk scores across patient population" : "Your risk score history"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {distError ? (
            <div className="text-sm text-destructive">Unable to load live distribution: {distError}. Showing last-known values.</div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">High Risk (≥80%)</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {isDoctor ? `${highCount} patients` : `${highCount} instance${highCount !== 1 ? "s" : ""}`}
              </span>
            </div>
            <Progress value={loadingDist ? 19 : clamp(highPct)} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Medium Risk (40-79%)</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {isDoctor ? `${medCount} patients` : `${medCount} instance${medCount !== 1 ? "s" : ""}`}
              </span>
            </div>
            <Progress value={loadingDist ? 29 : clamp(medPct)} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Low Risk (&lt;40%)</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {isDoctor ? `${lowCount} patients` : `${lowCount} instance${lowCount !== 1 ? "s" : ""}`}
              </span>
            </div>
            <Progress value={loadingDist ? 52 : clamp(lowPct)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Model Performance (HARD-CODED — unchanged) */}
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
