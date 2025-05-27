import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import SavedArticles from "@/pages/saved-articles";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/lib/auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/saved" component={SavedArticles} />
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
