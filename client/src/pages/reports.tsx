import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Briefcase,
  Download,
  FileText
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import type { Case, Client, TimeEntry, Invoice } from "@shared/schema";

// Safe date parsing helper to prevent Invalid Date issues
function safeDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function Reports() {
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("overview");

  const { data: cases = [] } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: timeEntries = [] } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: dashboardMetrics } = useQuery<{ activeCases?: number }>({
    queryKey: ["/api/dashboard/metrics"],
  });

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    const start = dateRange === "30" ? subDays(end, 30) : 
                  dateRange === "90" ? subDays(end, 90) :
                  dateRange === "month" ? startOfMonth(end) :
                  subDays(end, 365);
    return { start, end };
  };

  const { start: startDate, end: endDate } = getDateRange();

  // Filter data by date range
  const filteredTimeEntries = timeEntries.filter((entry: TimeEntry) => {
    const entryDate = safeDate(entry.startTime);
    if (!entryDate) return false;
    return entryDate >= startDate && entryDate <= endDate;
  });

  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    const invoiceDate = safeDate(invoice.issueDate);
    if (!invoiceDate) return false;
    return invoiceDate >= startDate && invoiceDate <= endDate;
  });

  // Calculate metrics
  const totalBillableHours = filteredTimeEntries
    .filter((entry: TimeEntry) => entry.isBillable && entry.duration)
    .reduce((sum: number, entry: TimeEntry) => sum + (entry.duration || 0), 0);

  const totalRevenue = filteredInvoices
    .filter((invoice: Invoice) => invoice.status === "paid")
    .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.total.toString()), 0);

  const pendingRevenue = filteredInvoices
    .filter((invoice: Invoice) => invoice.status === "sent")
    .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.total.toString()), 0);

  const overdueRevenue = filteredInvoices
    .filter((invoice: Invoice) => invoice.status === "overdue")
    .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.total.toString()), 0);

  const averageHourlyRate = filteredTimeEntries
    .filter((entry: TimeEntry) => entry.hourlyRate && entry.duration)
    .reduce((sum: number, entry: TimeEntry, _: number, arr: TimeEntry[]) => sum + parseFloat(entry.hourlyRate?.toString() || "0"), 0) / 
    filteredTimeEntries.filter((entry: TimeEntry) => entry.hourlyRate).length || 0;

  // Case type distribution
  const caseTypeStats = cases.reduce((acc: Record<string, number>, caseItem: Case) => {
    const type = caseItem.caseType || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Client acquisition by month
  const clientsByMonth = clients.reduce((acc: Record<string, number>, client: Client) => {
    const createdDate = safeDate(client.createdAt);
    if (!createdDate) return acc;
    const month = format(createdDate, "MMM yyyy");
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const exportReport = () => {
    // Implementation for exporting reports
    console.log("Exporting report for date range:", dateRange);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Reports & Analytics</h1>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40" data-testid="select-date-range">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48" data-testid="select-report-type">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
              <SelectItem value="clients">Client Analytics</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} data-testid="button-export-report">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Generated</p>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-revenue">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {dateRange === "30" ? "Last 30 days" : `Selected period`}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Billable Hours</p>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-hours">
                  {formatDuration(totalBillableHours)}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Avg: ${averageHourlyRate.toFixed(0)}/hr
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Cases</p>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-cases">
                  {dashboardMetrics?.activeCases || 0}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  <Briefcase className="w-3 h-3 inline mr-1" />
                  {cases.length} total cases
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-clients">
                  {clients.length}
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  <Users className="w-3 h-3 inline mr-1" />
                  Active clients
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Revenue Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Collected Revenue</p>
                <p className="text-xs text-muted-foreground">Paid invoices</p>
              </div>
              <p className="text-lg font-bold text-green-600" data-testid="revenue-collected">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Pending Revenue</p>
                <p className="text-xs text-muted-foreground">Outstanding invoices</p>
              </div>
              <p className="text-lg font-bold text-blue-600" data-testid="revenue-pending">
                ${pendingRevenue.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Overdue Revenue</p>
                <p className="text-xs text-muted-foreground">Past due invoices</p>
              </div>
              <p className="text-lg font-bold text-red-600" data-testid="revenue-overdue">
                ${overdueRevenue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Case Type Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(caseTypeStats).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm text-foreground capitalize" data-testid={`case-type-${type}`}>
                      {type.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant="secondary" data-testid={`case-count-${type}`}>
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracking Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Time Utilization</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Billable Hours</p>
                <p className="text-xl font-bold text-foreground" data-testid="billable-hours">
                  {formatDuration(totalBillableHours)}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Average Rate</p>
                <p className="text-xl font-bold text-foreground" data-testid="average-rate">
                  ${averageHourlyRate.toFixed(0)}/hr
                </p>
              </div>
            </div>
            
            {/* Activity breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Top Activities</h4>
              {['legal_research', 'client_meeting', 'document_review'].map(activity => {
                const activityHours = filteredTimeEntries
                  .filter(entry => entry.activity === activity)
                  .reduce((sum, entry) => sum + (entry.duration || 0), 0);
                const percentage = totalBillableHours > 0 ? (activityHours / totalBillableHours) * 100 : 0;
                
                return (
                  <div key={activity} className="flex items-center justify-between text-sm">
                    <span className="capitalize" data-testid={`activity-${activity}`}>
                      {activity.replace('_', ' ')}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDuration(activityHours)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Recent Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Invoices Sent</span>
                  <Badge variant="default" data-testid="invoices-sent-count">
                    {filteredInvoices.filter(inv => inv.status === "sent").length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total value: ${filteredInvoices
                    .filter(inv => inv.status === "sent")
                    .reduce((sum, inv) => sum + parseFloat(inv.total.toString()), 0)
                    .toLocaleString()}
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Cases Opened</span>
                  <Badge variant="secondary" data-testid="cases-opened-count">
                    {cases.filter((c: Case) => {
                      const caseDate = safeDate(c.createdAt);
                      if (!caseDate) return false;
                      return caseDate >= startDate && caseDate <= endDate;
                    }).length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  In selected period
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">New Clients</span>
                  <Badge variant="outline" data-testid="new-clients-count">
                    {clients.filter((client: Client) => {
                      const clientDate = safeDate(client.createdAt);
                      if (!clientDate) return false;
                      return clientDate >= startDate && clientDate <= endDate;
                    }).length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Client acquisition rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Export Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Financial Summary", desc: "Revenue and billing report" },
              { title: "Time Analysis", desc: "Detailed time tracking report" },
              { title: "Case Summary", desc: "Active cases and outcomes" },
              { title: "Client Report", desc: "Client activity and acquisition" }
            ].map((report, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start"
                onClick={exportReport}
                data-testid={`export-${report.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <h4 className="font-medium text-sm">{report.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{report.desc}</p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
