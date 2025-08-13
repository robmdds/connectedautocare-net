import { useLocation, Link } from "wouter";

const menuItems = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", icon: "fas fa-chart-line", href: "/" },
      { name: "Analytics", icon: "fas fa-chart-bar", href: "/analytics" },
    ],
  },
  {
    title: "Policy Management",
    items: [
      { name: "Policies", icon: "fas fa-file-contract", href: "/policies" },
      { name: "Quotes", icon: "fas fa-calculator", href: "/quotes" },
      { name: "Products", icon: "fas fa-tags", href: "/products" },
      { name: "Rate Tables", icon: "fas fa-table", href: "/rate-tables" },
    ],
  },
  {
    title: "Hero VSC Products",
    items: [
      { name: "Hero VSC Catalog", icon: "fas fa-shield-alt", href: "/hero-vsc" },
    ],
  },
  {
    title: "Claims",
    items: [
      { name: "All Claims", icon: "fas fa-clipboard-list", href: "/claims" },
      { name: "Advanced Claims", icon: "fas fa-brain", href: "/advanced-claims" },
      { name: "FNOL", icon: "fas fa-exclamation-triangle", href: "/fnol" },
      { name: "Adjusters", icon: "fas fa-users", href: "/adjusters" },
    ],
  },
  {
    title: "Business",
    items: [
      { name: "Resellers", icon: "fas fa-handshake", href: "/resellers" },
      { name: "Payments", icon: "fas fa-credit-card", href: "/payments" },
      { name: "AI Assistant", icon: "fas fa-robot", href: "/ai-assistant" },
    ],
  },
  {
    title: "Admin",
    items: [
      { name: "Tenants", icon: "fas fa-building", href: "/admin" },
      { name: "Settings", icon: "fas fa-cog", href: "/settings" },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="space-y-6">
          {menuItems.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${
                          isActive(item.href)
                            ? "bg-blue-50 text-primary border-r-2 border-primary"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }
                      `}
                    >
                      <i className={`${item.icon} w-5 h-5 mr-3`}></i>
                      {item.name}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
