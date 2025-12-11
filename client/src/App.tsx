import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { PortalAuthProvider } from "@/lib/portal-auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
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
import Settings from "@/pages/settings";
import MainLayout from "@/components/main-layout";
import PortalLogin from "@/pages/portal/portal-login";
import PortalDashboard from "@/pages/portal/portal-dashboard";
import PortalCases from "@/pages/portal/portal-cases";
import PortalInvoices from "@/pages/portal/portal-invoices";
import PortalMessages from "@/pages/portal/portal-messages";
import PortalEvents from "@/pages/portal/portal-events";
import PortalProfile from "@/pages/portal/portal-profile";
import PortalAcceptInvitation from "@/pages/portal/portal-accept-invitation";
import PortalLayout from "@/components/portal-layout";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <MainLayout>
      <Component />
    </MainLayout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login />}
      </Route>
      <Route path="/">
        {user ? (
          <MainLayout>
            <Dashboard />
          </MainLayout>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      <Route path="/clients">
        <ProtectedRoute component={Clients} />
      </Route>
      <Route path="/cases">
        <ProtectedRoute component={Cases} />
      </Route>
      <Route path="/calendar">
        <ProtectedRoute component={Calendar} />
      </Route>
      <Route path="/documents">
        <ProtectedRoute component={Documents} />
      </Route>
      <Route path="/time-tracking">
        <ProtectedRoute component={TimeTracking} />
      </Route>
      <Route path="/invoicing">
        <ProtectedRoute component={Invoicing} />
      </Route>
      <Route path="/messages">
        <ProtectedRoute component={Messages} />
      </Route>
      <Route path="/ai-assistant">
        <ProtectedRoute component={AiAssistant} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={Reports} />
      </Route>
      <Route path="/compliance">
        <ProtectedRoute component={Compliance} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      
      {/* Portal Routes */}
      <Route path="/portal/login" component={PortalLogin} />
      <Route path="/portal/accept-invitation" component={PortalAcceptInvitation} />
      <Route path="/portal">
        <PortalLayout><PortalDashboard /></PortalLayout>
      </Route>
      <Route path="/portal/cases/:id?">
        <PortalLayout><PortalCases /></PortalLayout>
      </Route>
      <Route path="/portal/invoices">
        <PortalLayout><PortalInvoices /></PortalLayout>
      </Route>
      <Route path="/portal/events">
        <PortalLayout><PortalEvents /></PortalLayout>
      </Route>
      <Route path="/portal/messages">
        <PortalLayout><PortalMessages /></PortalLayout>
      </Route>
      <Route path="/portal/profile">
        <PortalLayout><PortalProfile /></PortalLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PortalAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </PortalAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
