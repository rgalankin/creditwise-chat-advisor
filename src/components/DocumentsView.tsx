import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { FileText, Download, Trash2, Eye, Plus, Loader2, AlertCircle, FileCheck2 } from 'lucide-react';
import { blink } from '../lib/blink';
import { toast } from 'sonner';
import { useLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';

interface DocumentsViewProps {
  isGuestMode?: boolean;
  onLogin?: () => void;
}

export function DocumentsView({ isGuestMode = false, onLogin }: DocumentsViewProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  const fetchDocuments = async () => {
    if (isGuestMode) {
      setLoading(false);
      return;
    }
    try {
      // blink.auth.me() throws when not authenticated
      let user = null;
      try {
        user = await blink.auth.me();
      } catch (authError: any) {
        // Not authenticated - treat as guest mode
        if (authError?.code === 'INVALID_CREDENTIALS' || authError?.message?.includes('Not authenticated')) {
          setLoading(false);
          return;
        }
        throw authError;
      }
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      const docs = await (blink.db as any).userDocuments.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDemoUpload = () => {
    if (isGuestMode) {
      toast.info('Пожалуйста, войдите в систему для загрузки документов');
      if (onLogin) onLogin();
      return;
    }
    toast.info('Имитация загрузки документа...');
    
    setTimeout(() => {
      const newDoc = {
        id: `demo_${Date.now()}`,
        name: 'Отчёт о кредитной истории.pdf',
        createdAt: new Date().toISOString(),
        url: '#',
        isDemo: true
      };
      setDocuments(prev => [newDoc, ...prev]);
      toast.success('Демо-документ добавлен');
    }, 1000);
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('demo_')) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Удалено');
      return;
    }

    if (!confirm('Вы уверены?')) return;
    
    try {
      await (blink.db as any).userDocuments.delete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Удалено');
    } catch (error) {
      toast.error('Error');
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in overflow-y-auto chat-height scrollbar-hide">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Документы</h1>
          <p className="text-muted-foreground">
            Управляйте своими финансовыми отчетами.
          </p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="gap-2 font-bold border-primary text-primary" onClick={() => toast.info('Пример отчета скоро будет доступен')}>
             <FileCheck2 className="h-4 w-4" /> Пример отчёта
           </Button>
           <Button className="gap-2 font-bold shadow-lg shadow-primary/20 bg-primary" onClick={handleDemoUpload}>
             <Plus className="h-4 w-4" /> Загрузить
           </Button>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800 shadow-sm">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div className="text-xs font-medium leading-relaxed">
          В демо-версии реальная загрузка отключена. Нажмите «Загрузить», чтобы увидеть, как документы будут выглядеть в системе.
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl bg-secondary/30 text-muted-foreground space-y-4">
          <FileText className="h-12 w-12 opacity-20" />
          <div className="text-center">
            <p className="font-bold">Здесь будут ваши документы</p>
            <p className="text-sm opacity-70">
              Пока вы можете пройти диагностику без загрузки файлов.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="group overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg bg-card border-2">
              <CardHeader className="p-4 bg-secondary/50 border-b flex flex-row items-center justify-between space-y-0">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info('View disabled in demo')}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive/80"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold truncate text-sm" title={doc.name}>{doc.name}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    Загружено {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                   <div className={cn(
                     "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                     doc.isDemo ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                   )}>
                     {doc.isDemo ? 'Демо' : 'Обработано'}
                   </div>
                   <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" disabled={doc.isDemo}>
                      <Download className="h-3 w-3" /> Скачать
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
