import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { FileText, Download, Trash2, Eye, Plus, Loader2 } from 'lucide-react';
import { blink } from '../lib/blink';
import { toast } from 'sonner';
import { useLanguage } from '../lib/i18n';

export function DocumentsView() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  const fetchDocuments = async () => {
    try {
      const user = await blink.auth.me();
      if (!user) return;
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

  const handleDelete = async (id: string, url: string) => {
    if (!confirm(language === 'ru' ? 'Вы уверены, что хотите удалить этот документ?' : 'Are you sure you want to delete this document?')) return;
    
    try {
      await (blink.db as any).userDocuments.delete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success(language === 'ru' ? 'Документ удален' : 'Document deleted');
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка удаления' : 'Failed to delete');
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
          <h1 className="text-3xl font-bold tracking-tight">{t('documents')}</h1>
          <p className="text-muted-foreground">
            {language === 'ru' 
              ? 'Управляйте своими финансовыми отчетами и документами.'
              : 'Manage your financial statements and identity documents.'}
          </p>
        </div>
        <label className="cursor-pointer">
           <Button className="gap-2 font-bold shadow-lg shadow-primary/20">
             <Plus className="h-4 w-4" /> {language === 'ru' ? 'Загрузить' : 'Upload'}
           </Button>
           <input type="file" className="hidden" />
        </label>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl bg-secondary/30 text-muted-foreground space-y-4">
          <FileText className="h-12 w-12 opacity-20" />
          <div className="text-center">
            <p className="font-bold">{language === 'ru' ? 'Нет документов' : 'No documents yet'}</p>
            <p className="text-sm">
              {language === 'ru' 
                ? 'Загрузите выписки или отчеты для начала анализа.'
                : 'Upload statements or reports to start analysis.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="group overflow-hidden hover:border-primary/50 transition-all hover:shadow-md bg-card">
              <CardHeader className="p-4 bg-secondary/50 border-b flex flex-row items-center justify-between space-y-0">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive/80"
                    onClick={() => handleDelete(doc.id, doc.url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold truncate text-sm" title={doc.name}>{doc.name}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    {language === 'ru' ? 'Загружено' : 'Uploaded'} {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                   <div className="px-2 py-0.5 bg-primary/10 rounded text-[10px] font-bold text-primary uppercase">
                     {language === 'ru' ? 'Обработано' : 'Processed'}
                   </div>
                   <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
                      <a href={doc.url} download>
                        <Download className="h-3 w-3" /> {language === 'ru' ? 'Сохранить' : 'Save'}
                      </a>
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
