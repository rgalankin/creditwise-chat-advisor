import { Button } from './ui/button';
import { Shield, Sparkles, FileText, ArrowRight, Wallet, Globe } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface LandingPageProps {
  onLogin: () => void;
  onStartDiagnostic: () => void;
}

export function LandingPage({ onLogin, onStartDiagnostic }: LandingPageProps) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-16 items-center justify-between px-6 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FendNQpF5nghlJxKVPTu4iQirL503%2Flogo-__e444df85.png?alt=media&token=3dc97fca-5f68-4d47-a4a6-debc1a8860bd" 
              alt="Logo" 
              className="w-full h-full object-contain invert" 
            />
          </div>
          <span className="font-bold text-xl tracking-tight">Кредо-Сервис</span>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={onLogin} variant="outline" className="font-medium">
            {t('login')}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="px-6 py-20 lg:py-32 max-w-7xl mx-auto relative overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>5–7 минут, без документов на старте</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground">
                Ваш персональный <br />
                <span className="text-primary">кредитный советник</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Поможем разобраться в кредитной ситуации и выбрать безопасный путь дальше
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={onStartDiagnostic} size="lg" className="h-14 px-8 text-lg gap-2 font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Начать диагностику <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold border-primary text-primary hover:bg-primary/5">
                  Как это работает
                </Button>
              </div>
              <p className="text-sm text-muted-foreground italic">
                Без обещаний одобрения кредита
              </p>
            </div>
            <div className="relative h-[500px] bg-secondary/30 rounded-3xl border-2 border-primary/10 flex items-center justify-center overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="z-10 bg-card p-8 rounded-2xl shadow-2xl border-2 border-primary/5 w-80 space-y-6 animate-slide-up">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <img 
                      src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FendNQpF5nghlJxKVPTu4iQirL503%2Flogo-__e444df85.png?alt=media&token=3dc97fca-5f68-4d47-a4a6-debc1a8860bd" 
                      alt="Logo" 
                      className="w-8 h-8 object-contain invert" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 bg-primary/20 rounded-full" />
                    <div className="h-2 w-20 bg-muted rounded-full" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-muted rounded-full" />
                  <div className="h-2 w-full bg-muted rounded-full" />
                  <div className="h-2 w-3/4 bg-muted rounded-full" />
                </div>
                <div className="pt-4 flex justify-between gap-4">
                  <div className="h-10 flex-1 bg-secondary rounded-lg" />
                  <div className="h-10 flex-1 bg-primary rounded-lg shadow-md shadow-primary/20" />
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-12 right-12 z-0 bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-primary/10 w-52 -rotate-3 shadow-lg opacity-80">
                 <div className="flex items-center gap-2 mb-3">
                   <Shield className="h-5 w-5 text-primary" />
                   <div className="h-2 w-20 bg-primary/20 rounded-full" />
                 </div>
                 <div className="space-y-2">
                   <div className="h-1.5 w-full bg-muted/40 rounded-full" />
                   <div className="h-1.5 w-2/3 bg-muted/40 rounded-full" />
                 </div>
              </div>
              
              <div className="absolute bottom-12 left-12 z-0 bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-primary/10 w-48 rotate-6 shadow-lg opacity-80">
                 <div className="flex items-center gap-2 mb-3">
                   <FileText className="h-5 w-5 text-accent" />
                   <div className="h-2 w-20 bg-accent/20 rounded-full" />
                 </div>
                 <div className="space-y-2">
                   <div className="h-1.5 w-full bg-muted/40 rounded-full" />
                   <div className="h-1.5 w-3/4 bg-muted/40 rounded-full" />
                 </div>
              </div>
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full -z-10 pointer-events-none">
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
          </div>
        </section>

        {/* Features */}
        <section className="bg-secondary/30 py-24 px-6 border-y border-primary/10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="group space-y-5 p-8 bg-card rounded-3xl border border-transparent hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Конфиденциально</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ваши данные зашифрованы и используются только для анализа. Мы никогда не продаем вашу информацию.
                </p>
              </div>
              <div className="group space-y-5 p-8 bg-card rounded-3xl border border-transparent hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">По шагам</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Понятный путь без перегруза. Мы ведем вас через диагностику к конкретным сценариям решения.
                </p>
              </div>
              <div className="group space-y-5 p-8 bg-card rounded-3xl border border-transparent hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Без обещаний</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Только реалистичные варианты на основе вашей ситуации. Мы не обещаем одобрения, мы даем знания.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t flex flex-col items-center justify-center px-6 gap-4 text-sm text-muted-foreground bg-background">
        <p className="text-center max-w-2xl italic">
          Рекомендации носят информационный характер и не гарантируют получение кредита.
        </p>
        <div className="flex items-center gap-2">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FendNQpF5nghlJxKVPTu4iQirL503%2Flogo-__e444df85.png?alt=media&token=3dc97fca-5f68-4d47-a4a6-debc1a8860bd" 
            alt="Logo" 
            className="w-6 h-6 object-contain opacity-50 grayscale" 
          />
          &copy; 2026 Кредо-Сервис. Все права защищены.
        </div>
      </footer>
    </div>
  );
}
