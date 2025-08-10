import { Card, CardContent } from "@/components/ui/card";
import { 
  FileTextIcon, 
  ClipboardListIcon, 
  DollarSignIcon, 
  PercentIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from "lucide-react";

interface MetricsCardsProps {
  analytics?: any;
  isLoading?: boolean;
}

export default function MetricsCards({ analytics, isLoading }: MetricsCardsProps) {
  const metrics = [
    {
      title: "Active Policies",
      value: analytics?.activePolicies?.toLocaleString() || "0",
      icon: FileTextIcon,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "+8.2%",
      trend: "up"
    },
    {
      title: "Open Claims",
      value: analytics?.openClaims?.toLocaleString() || "0",
      icon: ClipboardListIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "-2.1%",
      trend: "down"
    },
    {
      title: "Monthly Premium",
      value: `$${(analytics?.monthlyPremium / 1000000)?.toFixed(1) || "0"}M`,
      icon: DollarSignIcon,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      change: "+12.5%",
      trend: "up"
    },
    {
      title: "Conversion Rate",
      value: `${analytics?.conversionRate || "0"}%`,
      icon: PercentIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "+1.3%",
      trend: "up"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="mt-4 h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                  <metric.icon className={`w-4 h-4 ${metric.iconColor}`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                {metric.trend === "up" ? (
                  <TrendingUpIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDownIcon className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ml-1 ${
                  metric.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {metric.change}
                </span>
                <span className="text-gray-500 text-sm ml-1">from last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
