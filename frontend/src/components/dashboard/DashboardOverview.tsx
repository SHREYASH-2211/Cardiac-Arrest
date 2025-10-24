import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileHeart, TrendingUp, AlertCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const DashboardOverview = () => {
  const user = getCurrentUser();
  const isDoctor = user?.role === 'doctor';

  const stats = [
    {
      title: "Total Predictions",
      value: isDoctor ? "147" : "12",
      change: "+12%",
      icon: Activity,
      color: "text-primary",
    },
    {
      title: "High Risk Cases",
      value: isDoctor ? "8" : "1",
      change: "-2%",
      icon: AlertCircle,
      color: "text-destructive",
    },
    {
      title: "Accuracy Rate",
      value: "94.2%",
      change: "+1.2%",
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      title: isDoctor ? "Active Patients" : "Uploads This Month",
      value: isDoctor ? "42" : "5",
      change: "+8%",
      icon: FileHeart,
      color: "text-primary",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          {isDoctor 
            ? "Monitor patient predictions and review critical cases" 
            : "Track your cardiac health metrics and predictions"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-accent' : 'text-destructive'}>
                    {stat.change}
                  </span>
                  {' '}from last month
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
            {[
              { patient: isDoctor ? "Patient #1032" : "Your Record", risk: "Low", date: "2 hours ago", riskValue: 0.12 },
              { patient: isDoctor ? "Patient #1031" : "Your Record", risk: "High", date: "5 hours ago", riskValue: 0.87 },
              { patient: isDoctor ? "Patient #1030" : "Your Record", risk: "Medium", date: "1 day ago", riskValue: 0.54 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{item.patient}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.risk === 'High'
                        ? 'bg-destructive/10 text-destructive'
                        : item.risk === 'Medium'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                        : 'bg-accent/10 text-accent'
                    }`}
                  >
                    {item.risk} Risk
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Score: {item.riskValue}</p>
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
                <p className="text-sm text-muted-foreground">8 cases require attention</p>
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
