import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Info, Terminal, AlertTriangle, ShieldCheck } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-32 pb-16 px-6 max-w-4xl mx-auto">
        
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Documentation & About</h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about the DeployBoard Demo and how to run it locally for real Kubernetes deployments.
          </p>
        </div>

        {/* Demo Mode Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow/10 rounded-lg text-yellow">
              <Info className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">Welcome to the Demo Environment</h2>
          </div>
          
          <div className="p-6 border rounded-xl bg-card mb-6">
            <h3 className="text-lg font-medium mb-2">What you are looking at</h3>
            <p className="text-muted-foreground mb-4">
              The live site you are currently visiting is a <strong>Demo Environment</strong>. Because DeployBoard is a powerful tool designed to manage Kubernetes clusters, it would be a severe security risk to connect this public website to a real, live cluster.
            </p>
            <p className="text-muted-foreground">
              Instead, the backend is running in "Mock Mode". It generates highly-realistic synthetic data for Deployments, Pods, Logs, and Metrics so you can click around and experience the UI exactly as it behaves in the real world.
            </p>
          </div>

          <div className="p-6 border border-destructive/20 rounded-xl bg-destructive/5 flex gap-4">
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-destructive mb-2">Why "Deploy New App" Fails Here</h3>
              <p className="text-sm text-muted-foreground">
                If you try to use the "Deploy from GitHub" feature on this live site, it will fail. Triggering a real CI/CD pipeline requires the backend server to have access to Docker (to build images) and a Kubernetes cluster (to deploy them). Serverless containers in the cloud (like Render or Vercel) do not support Docker-in-Docker natively.
              </p>
            </div>
          </div>
        </section>

        {/* Local Installation Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Terminal className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">Running Locally (The Real Way)</h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            To actually use DeployBoard to manage deployments and trigger builds, you must run it locally on your own machine alongside your Docker Desktop and local Kubernetes cluster (like <code>kind</code> or <code>minikube</code>).
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
        
        {/* Architecture Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">Security & Privacy</h2>
          </div>
          <div className="p-6 border rounded-xl bg-card">
            <p className="text-muted-foreground">
              We take security seriously. DeployBoard does not store any of your GitHub data, tokens, or Kubernetes configurations on our servers. All local cluster communication happens strictly between your local browser and your local python backend, never touching the internet.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
