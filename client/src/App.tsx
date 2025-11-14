import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
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
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";

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

  return <Component />;
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
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <Dashboard />
              </div>
            </main>
          </div>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      <Route path="/clients">
        <ProtectedRoute component={() => (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <Clients />
              </div>
            </main>
          </div>
        )} />
      </Route>
      <Route path="/cases">
        <ProtectedRoute component={() => (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <Cases />
              </div>
            </main>
          </div>
        )} />
      </Route>
      <Route path="/calendar">
        <ProtectedRoute component={() => (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <Calendar />
              </div>
            </main>
          </div>
        )} />
      </Route>
      <Route path="/documents">
        <ProtectedRoute component={() => (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <Documents />
              </div>
            </main>
          </div>
        )} />
      </Route>
      <Route path="/time-tracking">
        <ProtectedRoute component={() => (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <TimeTracking />
              </div>
            </main>
          </div>
        )} />
      </Route>
      <Route path="/invoicing">
        <ProtectedRoute component={() => (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <Invoicing />
              </div>
            </main>
          </div>
        )} />
      </Route>
      <Route path="/messages">
        <ProtectedRoute component={() => (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <Messages />
              </div>
            </main>
          </div>
        )} />
      </Route>
      <Route path="/ai-assistant">
        <ProtectedRoute component={() => (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <AiAssistant />
              </div>
            </main>
          </div>
        )} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={() => (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <Reports />
              </div>
            </main>
          </div>
        )} />
      </Route>
      <Route path="/compliance">
        <ProtectedRoute component={() => (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <Compliance />
              </div>
            </main>
          </div>
        )} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={() => (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-y-auto">
                <Settings />
              </div>
            </main>
          </div>
        )} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
