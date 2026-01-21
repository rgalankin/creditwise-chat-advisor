import { Button } from './ui/button';
import { Shield, Sparkles, FileText, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex h-16 items-center justify-between px-6 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
            <Shield className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">CreditWise</span>
        </div>
        <Button onClick={onLogin} variant="outline" className="font-medium">
          Sign In
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="px-6 py-20 lg:py-32 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Unbiased AI Financial Advice</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Your Personal <br />
                <span className="text-slate-500">Credit Advisor.</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                Take control of your financial future with CreditWise. Intelligent, unbiased advice for loans, debts, and credit health—without the broker intervention.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={onLogin} size="lg" className="h-14 px-8 text-lg gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                  How it works
                </Button>
              </div>
            </div>
            <div className="relative h-[500px] bg-slate-50 rounded-2xl border flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
              <div className="z-10 bg-white p-6 rounded-xl shadow-2xl border w-80 space-y-4 animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-black rounded-full" />
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                    <div className="h-2 w-16 bg-slate-50 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded" />
                  <div className="h-2 w-3/4 bg-slate-100 rounded" />
                </div>
                <div className="pt-4 flex justify-between">
                  <div className="h-8 w-20 bg-slate-50 rounded" />
                  <div className="h-8 w-20 bg-black rounded" />
                </div>
              </div>
              <div className="absolute top-10 right-10 z-0 bg-slate-100 p-4 rounded-lg border w-48 rotate-3">
                 <FileText className="h-6 w-6 mb-2 text-slate-400" />
                 <div className="h-2 w-full bg-slate-200 rounded mb-1" />
                 <div className="h-2 w-2/3 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-slate-50 py-20 px-6 border-y">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="h-12 w-12 bg-white rounded-xl border flex items-center justify-center shadow-sm">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Privacy First</h3>
                <p className="text-slate-600">Your data is encrypted and used only for analysis. We never sell your personal information.</p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-white rounded-xl border flex items-center justify-center shadow-sm">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Document Analysis</h3>
                <p className="text-slate-600">Upload reports and statements. Our AI extracts key data points to build your financial profile automatically.</p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-white rounded-xl border flex items-center justify-center shadow-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Unbiased Scenarios</h3>
                <p className="text-slate-600">Get clear recommendations on refinancing, bankruptcy, or debt restructuring based on your jurisdiction.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="h-20 border-t flex items-center justify-center px-6 text-sm text-slate-500">
        &copy; 2026 CreditWise Chat Advisor. All rights reserved.
      </footer>
    </div>
  );
}
