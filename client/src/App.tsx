import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import LandingNew from "@/pages/LandingNew";
import NewLanding from "@/pages/NewLanding";
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
import VSCQuoteResults from "@/pages/VSCQuoteResults";
import Purchase from "@/pages/Purchase";
import AIAssistant from "@/pages/AIAssistant";
import AdvancedClaims from "@/pages/AdvancedClaims";
import PolicyManagement from "@/pages/PolicyManagement";
import AdvancedAnalytics from "@/pages/AdvancedAnalytics";
import Communications from "@/pages/Communications";
import SystemIntegration from "@/pages/SystemIntegration";
import AdminLogin from "@/pages/AdminLogin";
import QuickLogin from "@/pages/QuickLogin";
import LoginTest from "@/pages/LoginTest";

function Router() {
  try {
    const { isAuthenticated, isLoading } = useAuth();

    return (
      <Switch>
        {/* Critical Platform Routes - First Priority */}
        <Route path="/policies" component={Policies} />
        <Route path="/claims" component={Claims} />
        <Route path="/analytics" component={Analytics} />
        
        {/* Authentication Routes */}
        <Route path="/login" component={QuickLogin} />
        <Route path="/login-test" component={LoginTest} />
        <Route path="/admin/login" component={AdminLogin} />
        
        {/* Core TPA Platform Routes */}
        <Route path="/ai-assistant" component={AIAssistant} />
        <Route path="/advanced-claims" component={AdvancedClaims} />
        <Route path="/policy-management" component={PolicyManagement} />
        <Route path="/advanced-analytics" component={AdvancedAnalytics} />
        <Route path="/communications" component={Communications} />
        <Route path="/system-integration" component={SystemIntegration} />
        
        {/* Admin Routes */}
        <Route path="/admin/coverage-options" component={AdminCoverageOptions} />
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
        <Route path="/admin" component={Admin} />
        
        {/* Public Routes */}
        <Route path="/quote" component={QuoteGenerator} />
        <Route path="/vsc-quote" component={VSCQuoteResults} />
        <Route path="/purchase" component={Purchase} />
        <Route path="/products" component={Products} />
        <Route path="/faq" component={FAQ} />
        <Route path="/public-claims" component={PublicClaims} />
        <Route path="/wholesale" component={WholesaleLogin} />
        <Route path="/wholesale/portal" component={WholesalePortal} />
        <Route path="/wholesale/bulk-pricing" component={WholesaleBulkPricing} />
        <Route path="/wholesale/white-label" component={WhitelabelConfig} />
        <Route path="/branded/:resellerId" component={() => <BrandedQuotePage resellerId="reseller-001" />} />
        <Route path="/hero-vsc" component={HeroVscProducts} />
        <Route path="/connected-auto-care" component={ConnectedAutoCarePage} />
        <Route path="/fresh" component={NewLanding} />
        
        {/* Home Route - Conditional Based on Auth */}
        <Route path="/" component={isLoading || !isAuthenticated ? NewLanding : Dashboard} />
        
        <Route component={NotFound} />
      </Switch>
    );
  } catch (error: any) {
    console.error("Router error:", error);
    return (
      <div style={{ padding: '20px', background: '#fee', border: '2px solid #f00' }}>
        <h1>Router Error</h1>
        <p>Error: {error.message}</p>
        <p><a href="/api/login">Login</a> | <a href="/">Home</a></p>
      </div>
    );
  }
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
