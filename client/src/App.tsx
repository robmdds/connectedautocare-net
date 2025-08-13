import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Policies from "@/pages/Policies";
import Claims from "@/pages/Claims";
import Analytics from "@/pages/Analytics";
import Admin from "@/pages/Admin";
import AdminUsers from "@/pages/AdminUsers";
import AdminRateTables from "@/pages/AdminRateTables";
import AdminCoverageOptions from "@/pages/AdminCoverageOptions";
import AdminTenants from "@/pages/AdminTenants";
import AdminResellers from "@/pages/AdminResellers";
import AdminPaymentSettings from "@/pages/AdminPaymentSettings";
import AdminApiIntegrations from "@/pages/AdminApiIntegrations";
import AdminSystemLogs from "@/pages/AdminSystemLogs";
import AdminAiModels from "@/pages/AdminAiModels";
import AdminTrainingData from "@/pages/AdminTrainingData";
import AdminResponseTemplates from "@/pages/AdminResponseTemplates";
import HeroVscProducts from "@/pages/HeroVscProducts";
import ConnectedAutoCarePage from "@/pages/ConnectedAutoCarePage";
import Products from "@/pages/Products";
import FAQ from "@/pages/FAQ";
import PublicClaims from "@/pages/PublicClaims";
import WholesaleLogin from "@/pages/WholesaleLogin";
import WholesalePortal from "@/pages/WholesalePortal";
import WholesaleBulkPricing from "@/pages/WholesaleBulkPricing";
import WhitelabelConfig from "@/pages/WhitelabelConfig";
import BrandedQuotePage from "@/pages/BrandedQuotePage";
import QuoteGenerator from "@/components/QuoteGenerator";
import AIAssistant from "@/pages/AIAssistant";
import AdvancedClaims from "@/pages/AdvancedClaims";
import PolicyManagement from "@/pages/PolicyManagement";
import AdvancedAnalytics from "@/pages/AdvancedAnalytics";
import Communications from "@/pages/Communications";
import SystemIntegration from "@/pages/SystemIntegration";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public Routes - Always Available */}
      <Route path="/quote" component={QuoteGenerator} />
      <Route path="/products" component={Products} />
      <Route path="/faq" component={FAQ} />
      <Route path="/claims" component={PublicClaims} />
      <Route path="/wholesale" component={WholesaleLogin} />
      <Route path="/wholesale/portal" component={WholesalePortal} />
      <Route path="/wholesale/bulk-pricing" component={WholesaleBulkPricing} />
      <Route path="/wholesale/white-label" component={WhitelabelConfig} />
      <Route path="/branded/:resellerId" component={() => <BrandedQuotePage resellerId="reseller-001" />} />
      <Route path="/hero-vsc" component={HeroVscProducts} />
      <Route path="/connected-auto-care" component={ConnectedAutoCarePage} />
      <Route path="/admin/coverage-options" component={AdminCoverageOptions} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/rate-tables" component={AdminRateTables} />
      <Route path="/admin/tenants" component={AdminTenants} />
      <Route path="/admin/resellers" component={AdminResellers} />
      <Route path="/admin/payment-settings" component={AdminPaymentSettings} />
      <Route path="/admin/api-integrations" component={AdminApiIntegrations} />
      <Route path="/admin/system-logs" component={AdminSystemLogs} />
      <Route path="/admin/ai-models" component={AdminAiModels} />
      <Route path="/admin/training-data" component={AdminTrainingData} />
      <Route path="/admin/response-templates" component={AdminResponseTemplates} />

      {/* Conditional Routes Based on Auth */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/policies" component={Policies} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/ai-assistant" component={AIAssistant} />
          <Route path="/advanced-claims" component={AdvancedClaims} />
          <Route path="/policy-management" component={PolicyManagement} />
          <Route path="/advanced-analytics" component={AdvancedAnalytics} />
          <Route path="/communications" component={Communications} />
          <Route path="/system-integration" component={SystemIntegration} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
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
