import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { 
  Info, 
  Terminal, 
  ShieldCheck, 
  Layers,
  Container,
  Cpu,
  Globe,
  Database,
  ArrowRight
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-32 pb-16 px-6 max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Architecture & Documentation</h1>
          <p className="text-lg text-muted-foreground">
            A deep dive into DeployBoard: The modern, web-first Cloud-Native management tool.
          </p>
        </div>

        {/* What is DeployBoard */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow/10 rounded-lg text-yellow">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">What is DeployBoard?</h2>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              DeployBoard is a <strong>Cloud-Native Developer Tool</strong> designed to simplify Kubernetes cluster management. While industry standards like Lens or K9s are desktop applications or terminal interfaces, DeployBoard provides a modern, web-first experience for viewing workloads, streaming logs, and executing CI/CD pipelines.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              It leverages a robust full-stack architecture to bridge the gap between your web browser and your local container orchestration infrastructure.
            </p>
          </div>
        </section>

        {/* Tech Stack */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">The Tech Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-xl bg-card hover:border-yellow/50 transition-colors">
              <Globe className="w-6 h-6 mb-3 text-blue-400" />
              <h3 className="font-semibold mb-1">Next.js 14</h3>
              <p className="text-sm text-muted-foreground">React Server Components, App Router, and dynamic UI rendering.</p>
            </div>
            <div className="p-4 border rounded-xl bg-card hover:border-yellow/50 transition-colors">
              <Cpu className="w-6 h-6 mb-3 text-green-400" />
              <h3 className="font-semibold mb-1">FastAPI</h3>
              <p className="text-sm text-muted-foreground">High-performance async Python backend for streaming logs and processing builds.</p>
            </div>
            <div className="p-4 border rounded-xl bg-card hover:border-yellow/50 transition-colors">
              <Container className="w-6 h-6 mb-3 text-blue-500" />
              <h3 className="font-semibold mb-1">Kubernetes API</h3>
              <p className="text-sm text-muted-foreground">Official python kubernetes-client for live cluster state manipulation.</p>
            </div>
          </div>
        </section>

        {/* Architecture Diagram */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Architecture (Local vs Demo)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Local Architecture */}
            <div className="p-6 border rounded-xl bg-card relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
              <h3 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
                <Terminal className="w-5 h-5" /> Local Installation (Real)
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-black/20">
                  <span className="text-sm font-medium">Browser (React)</span>
                </div>
                <div className="flex justify-center text-muted-foreground">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-black/20">
                  <span className="text-sm font-medium">FastAPI Backend</span>
                </div>
                <div className="flex justify-center text-muted-foreground">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-blue-500/30 bg-blue-500/10">
                  <span className="text-sm font-medium text-blue-300">Local Kubernetes (Kind)</span>
                  <Database className="w-4 h-4 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Demo Architecture */}
            <div className="p-6 border rounded-xl bg-card relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow/5 to-transparent pointer-events-none" />
              <h3 className="text-lg font-semibold mb-4 text-yellow flex items-center gap-2">
                <Globe className="w-5 h-5" /> Vercel Hosted (Demo)
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-black/20">
                  <span className="text-sm font-medium">Browser (React)</span>
                </div>
                <div className="flex justify-center text-muted-foreground">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-black/20">
                  <span className="text-sm font-medium">FastAPI Backend</span>
                </div>
                <div className="flex justify-center text-muted-foreground">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-yellow/30 bg-yellow/10">
                  <span className="text-sm font-medium text-yellow">Mock State Engine</span>
                  <Cpu className="w-4 h-4 text-yellow" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Mode Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow/10 rounded-lg text-yellow">
              <Info className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">Why use a "Demo Mode"?</h2>
          </div>
          
          <div className="p-6 border rounded-xl bg-card mb-6">
            <p className="text-muted-foreground mb-4 leading-relaxed">
              The live site you are currently visiting is running in <strong>Demo Mode</strong>. 
              DeployBoard is a powerful administrative tool. If we connected this public website to a real, live Kubernetes cluster, it would be a severe security risk—anyone could deploy malicious containers or read sensitive infrastructure logs.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Instead, when deployed to Vercel/Render, the backend detects the absence of a local cluster and automatically falls back to an advanced <strong>Mock Engine</strong>. It generates highly-realistic synthetic data for Deployments, Pods, Logs, and CI/CD pipelines so you can safely click around and experience the UI.
            </p>
          </div>
        </section>

        {/* Local Installation Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Terminal className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">Running Locally (The Real Way)</h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            To actually use DeployBoard to manage real deployments and trigger real Docker builds, you must run it locally on your own machine alongside your local Kubernetes cluster.
          </p>

          <div className="space-y-6">
            <div className="p-6 border rounded-xl bg-card">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-sm">1</span>
                Prerequisites
              </h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
                <li>Docker Desktop</li>
                <li>Kind (Kubernetes IN Docker)</li>
                <li>Node.js 20+</li>
                <li>Python 3.12+</li>
              </ul>
            </div>

            <div className="p-6 border rounded-xl bg-card">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-sm">2</span>
                Start your local cluster
              </h3>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <span className="text-green-400">$</span> kind create cluster
              </div>
            </div>

            <div className="p-6 border rounded-xl bg-card">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-sm">3</span>
                Run the Backend
              </h3>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <span className="text-green-400">$</span> cd backend<br/>
                <span className="text-green-400">$</span> python -m venv venv<br/>
                <span className="text-green-400">$</span> source venv/bin/activate<br/>
                <span className="text-green-400">$</span> pip install -r requirements.txt<br/>
                <span className="text-green-400">$</span> uvicorn app.main:app --reload --port 8000
              </div>
            </div>

            <div className="p-6 border rounded-xl bg-card">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-sm">4</span>
                Run the Frontend
              </h3>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <span className="text-green-400">$</span> cd frontend<br/>
                <span className="text-green-400">$</span> npm install<br/>
                <span className="text-green-400">$</span> npm run dev
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
