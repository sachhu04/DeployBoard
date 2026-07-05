"use client";

import { Header } from "@/components/dashboard/header";
import { LogViewer } from "@/components/dashboard/log-viewer";

export default function LogsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Logs"
        description="Stream pod stdout/stderr in real-time."
      />
      <div className="flex-1 p-6">
        <LogViewer />
      </div>
    </div>
  );
}
