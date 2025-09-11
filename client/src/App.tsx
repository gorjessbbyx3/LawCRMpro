import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Cases from "@/pages/cases";
import Calendar from "@/pages/calendar";
import Documents from "@/pages/documents";
import TimeTracking from "@/pages/time-tracking";
import Invoicing from "@/pages/invoicing";
import Messages from "@/pages/messages";
import AiAssistant from "@/pages/ai-assistant";
import Reports from "@/pages/reports";
import Compliance from "@/pages/compliance";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";

function Router() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/clients" component={Clients} />
            <Route path="/cases" component={Cases} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/documents" component={Documents} />
            <Route path="/time-tracking" component={TimeTracking} />
            <Route path="/invoicing" component={Invoicing} />
            <Route path="/messages" component={Messages} />
            <Route path="/ai-assistant" component={AiAssistant} />
            <Route path="/reports" component={Reports} />
            <Route path="/compliance" component={Compliance} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
