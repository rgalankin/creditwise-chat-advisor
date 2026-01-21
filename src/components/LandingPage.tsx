import { Button } from './ui/button';
import { Shield, Sparkles, FileText, ArrowRight, Wallet, Globe } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-16 items-center justify-between px-6 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center p-1.5">
            <img src="https://credoserv.ru/img/48438455.png" alt="Logo" className="w-full h-full object-contain invert" />
          </div>
          <span className="font-bold text-xl tracking-tight">Кредо-Сервис</span>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === 'ru' ? 'RU' : 'EN'}
          </Button>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Wallet className="h-4 w-4" />
                <span>{language === 'ru' ? 'Бесплатный финансовый анализ' : 'Free Financial Analysis'}</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                {language === 'ru' ? 'Ваш персональный' : 'Your Personal'} <br />
                <span className="text-primary">{language === 'ru' ? 'AI Советник.' : 'AI Advisor.'}</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                {language === 'ru' 
                  ? 'Возьмите под контроль свое финансовое будущее с Кредо-Сервис. Интеллектуальные, непредвзятые советы без брокеров.'
                  : 'Take control of your financial future with Credo-Service. Intelligent, unbiased advice without brokers.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={onLogin} size="lg" className="h-14 px-8 text-lg gap-2 font-bold shadow-xl shadow-primary/20">
                  {t('startChat')} <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold">
                  {language === 'ru' ? 'Как это работает' : 'How it works'}
                </Button>
              </div>
            </div>
            <div className="relative h-[500px] bg-secondary/30 rounded-2xl border border-border/50 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="z-10 bg-card p-6 rounded-xl shadow-2xl border w-80 space-y-4 animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                    <img src="https://credoserv.ru/img/48438455.png" alt="Logo" className="w-6 h-6 object-contain invert" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-2 w-16 bg-muted/50 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-muted rounded" />
                  <div className="h-2 w-3/4 bg-muted rounded" />
                </div>
                <div className="pt-4 flex justify-between">
                  <div className="h-8 w-20 bg-muted rounded" />
                  <div className="h-8 w-20 bg-primary rounded" />
                </div>
              </div>
              <div className="absolute top-10 right-10 z-0 bg-secondary p-4 rounded-lg border w-48 rotate-3 opacity-50">
                 <FileText className="h-6 w-6 mb-2 text-muted-foreground" />
                 <div className="h-2 w-full bg-muted-foreground/20 rounded mb-1" />
                 <div className="h-2 w-2/3 bg-muted-foreground/20 rounded" />
              </div>
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full -z-10 pointer-events-none">
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          </div>
        </section>

        {/* Features */}
        <section className="bg-secondary/20 py-24 px-6 border-y">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4 text-center md:text-left">
                <div className="h-12 w-12 bg-card rounded-xl border flex items-center justify-center shadow-sm mx-auto md:mx-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{language === 'ru' ? 'Конфиденциальность' : 'Privacy First'}</h3>
                <p className="text-muted-foreground">
                  {language === 'ru'
                    ? 'Ваши данные зашифрованы и используются только для анализа. Мы никогда не продаем вашу информацию.'
                    : 'Your data is encrypted and used only for analysis. We never sell your personal information.'}
                </p>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <div className="h-12 w-12 bg-card rounded-xl border flex items-center justify-center shadow-sm mx-auto md:mx-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{language === 'ru' ? 'Анализ документов' : 'Document Analysis'}</h3>
                <p className="text-muted-foreground">
                  {language === 'ru'
                    ? 'Загружайте отчеты и выписки. Наш AI автоматически извлечет данные для построения вашего профиля.'
                    : 'Upload reports and statements. Our AI extracts key data points to build your financial profile automatically.'}
                </p>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <div className="h-12 w-12 bg-card rounded-xl border flex items-center justify-center shadow-sm mx-auto md:mx-0">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{language === 'ru' ? 'Умные сценарии' : 'Unbiased Scenarios'}</h3>
                <p className="text-muted-foreground">
                  {language === 'ru'
                    ? 'Получайте рекомендации по рефинансированию, банкротству или реструктуризации долга.'
                    : 'Get clear recommendations on refinancing, bankruptcy, or debt restructuring based on your jurisdiction.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="h-20 border-t flex items-center justify-center px-6 text-sm text-muted-foreground">
        &copy; 2026 Кредо-Сервис. {language === 'ru' ? 'Все права защищены.' : 'All rights reserved.'}
      </footer>
    </div>
  );
}
