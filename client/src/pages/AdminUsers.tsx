import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Shield, Settings } from "lucide-react";
import { Link } from "wouter";

export default function AdminUsers() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Mock users data for demonstration
  const mockUsers = [
    {
      id: "45865666",
      email: "rm@pdgsinc.com",
      firstName: "Administrator",
      lastName: "User",
      role: "admin",
      status: "active",
      lastLogin: "2025-08-10T12:00:00Z"
    },
    {
      id: "12345678",
      email: "agent@tpa.com",
      firstName: "Insurance",
      lastName: "Agent",
      role: "agent",
      status: "active",
      lastLogin: "2025-08-10T10:30:00Z"
    },
    {
      id: "87654321",
      email: "customer@example.com",
      firstName: "John",
      lastName: "Customer",
      role: "customer",
      status: "active",
      lastLogin: "2025-08-10T09:15:00Z"
    }
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Shield className="h-8 w-8 text-blue-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
              </div>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Link href="/" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <Link href="/policies" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Policies
            </Link>
            <Link href="/claims" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Claims
            </Link>
            <Link href="/analytics" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Analytics
            </Link>
            <Link href="/admin" className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUsers.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockUsers.filter(u => u.status === 'active').length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{mockUsers.filter(u => u.role === 'admin').length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{mockUsers.filter(u => u.role === 'agent').length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsers.map((userAccount) => (
                  <div key={userAccount.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {userAccount.firstName} {userAccount.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{userAccount.email}</div>
                        <div className="text-xs text-gray-400">ID: {userAccount.id}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getRoleBadgeColor(userAccount.role)}>
                        {userAccount.role.toUpperCase()}
                      </Badge>
                      <Badge variant={userAccount.status === 'active' ? 'default' : 'secondary'}>
                        {userAccount.status.toUpperCase()}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        Last: {new Date(userAccount.lastLogin).toLocaleDateString()}
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Role Management */}
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-red-800">Administrator</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Full system access</li>
                    <li>• User management</li>
                    <li>• System configuration</li>
                    <li>• Financial reporting</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">Agent</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Policy management</li>
                    <li>• Claims processing</li>
                    <li>• Customer support</li>
                    <li>• Limited reporting</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-green-800">Customer</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• View own policies</li>
                    <li>• Submit claims</li>
                    <li>• Update contact info</li>
                    <li>• Download documents</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}