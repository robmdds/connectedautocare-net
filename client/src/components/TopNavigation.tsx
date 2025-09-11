import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BellIcon, ChevronDownIcon, ShieldIcon } from "lucide-react";

export default function TopNavigation() {
    const { user } = useAuth();

    const handleLogout = async () => {
        try {
            // Call the logout endpoint
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Redirect to homepage after successful logout
                window.location.href = "/";
            } else {
                console.error('Logout failed:', await response.text());
                // Still redirect even if logout fails to clear the UI
                window.location.href = "/";
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Redirect anyway to clear the UI
            window.location.href = "/";
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-full px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <ShieldIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-gray-900">TPA Platform</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-1 ml-8">
                            <button className="px-3 py-2 text-sm font-medium text-primary bg-blue-50 rounded-lg">
                                Dashboard
                            </button>
                            <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                Policies
                            </button>
                            <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                Claims
                            </button>
                            <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                Quotes
                            </button>
                            <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                Analytics
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                            <BellIcon className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                3
              </span>
                        </button>
                        <div className="flex items-center space-x-3">
                            <img
                                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"}
                                alt="User Avatar"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-sm font-medium text-gray-700">
                {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"}
              </span>
                            <button onClick={handleLogout}>
                                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}