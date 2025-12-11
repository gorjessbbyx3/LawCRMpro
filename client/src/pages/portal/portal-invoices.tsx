import { useQuery } from '@tanstack/react-query';
import { FileText, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  tax: string;
  total: string;
  status: string;
  notes?: string;
}

export default function PortalInvoices() {
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/portal/invoices'],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const pendingInvoices = invoices?.filter(i => i.status === 'sent' || i.status === 'overdue') || [];
  const paidInvoices = invoices?.filter(i => i.status === 'paid') || [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'overdue': return 'destructive';
      case 'sent': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Invoices
        </h1>
        <p className="text-muted-foreground">View your billing history and outstanding invoices</p>
      </div>

      {pendingInvoices.length > 0 && (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              Outstanding Invoices
            </CardTitle>
            <CardDescription>Invoices awaiting payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} getStatusVariant={getStatusVariant} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Complete billing history</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} getStatusVariant={getStatusVariant} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InvoiceCard({ 
  invoice, 
  getStatusVariant 
}: { 
  invoice: Invoice; 
  getStatusVariant: (status: string) => "default" | "destructive" | "secondary" | "outline";
}) {
  const isOverdue = invoice.status === 'overdue' || 
    (invoice.status === 'sent' && new Date(invoice.dueDate) < new Date());

  return (
    <div 
      className={`p-4 rounded-md border ${isOverdue ? 'border-destructive/50 bg-destructive/5' : 'bg-muted/50'}`}
      data-testid={`card-invoice-${invoice.id}`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-medium">{invoice.invoiceNumber}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Issued: {new Date(invoice.issueDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              Due: {new Date(invoice.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant={getStatusVariant(invoice.status)}>
            {invoice.status}
          </Badge>
          <span className="font-bold text-lg flex items-center">
            <DollarSign className="h-4 w-4" />
            {parseFloat(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      {invoice.notes && (
        <p className="text-sm text-muted-foreground mt-2">{invoice.notes}</p>
      )}
    </div>
  );
}
