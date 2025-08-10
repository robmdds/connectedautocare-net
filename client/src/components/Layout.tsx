import { ReactNode } from "react";
import TopNavigation from "./TopNavigation";
import Sidebar from "./Sidebar";
import AIAssistant from "./AIAssistant";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
