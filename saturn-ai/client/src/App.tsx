import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import SaturnLayout from "@/components/SaturnLayout";
import CommandCenter from "@/pages/CommandCenter";
import Projects from "@/pages/Projects";
import ProposalEngine from "@/pages/ProposalEngine";
import PricingScope from "@/pages/PricingScope";
import DocumentQA from "@/pages/DocumentQA";
import WorkflowTracker from "@/pages/WorkflowTracker";
import MeetingNotes from "@/pages/MeetingNotes";
import Settings from "@/pages/Settings";
import Integrations from "@/pages/Integrations";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <SaturnLayout>
          <Switch>
            <Route path="/" component={CommandCenter} />
            <Route path="/projects" component={Projects} />
            <Route path="/proposals" component={ProposalEngine} />
            <Route path="/pricing" component={PricingScope} />
            <Route path="/documents" component={DocumentQA} />
            <Route path="/workflow" component={WorkflowTracker} />
            <Route path="/meetings" component={MeetingNotes} />
            <Route path="/settings" component={Settings} />
            <Route path="/integrations" component={Integrations} />
            <Route component={NotFound} />
          </Switch>
        </SaturnLayout>
      </Router>
      <Toaster />
      <PerplexityAttribution />
    </QueryClientProvider>
  );
}

export default App;
