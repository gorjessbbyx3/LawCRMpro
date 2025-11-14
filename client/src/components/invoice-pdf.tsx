import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { type Invoice } from '@shared/schema';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 14,
    marginBottom: 5,
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  clientName?: string;
  caseName?: string;
}

export function InvoicePDF({ invoice, clientName, caseName }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>Invoice #{invoice.invoiceNumber}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Issue Date:</Text>
            <Text>{new Date(invoice.issueDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text>{clientName || 'Not specified'}</Text>
          </View>
          {caseName && (
            <View style={styles.row}>
              <Text style={styles.label}>Case:</Text>
              <Text>{caseName}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Status: {invoice.status.toUpperCase()}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal:</Text>
            <Text>${parseFloat(invoice.subtotal.toString()).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax:</Text>
            <Text>${parseFloat((invoice.tax || 0).toString()).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, styles.total]}>Total:</Text>
          <Text style={styles.total}>${parseFloat(invoice.total.toString()).toFixed(2)}</Text>
        </View>

        {invoice.notes && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.label}>Notes:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function downloadInvoicePDF(invoice: Invoice, clientName?: string, caseName?: string) {
  try {
    const blob = await pdf(<InvoicePDF invoice={invoice} clientName={clientName} caseName={caseName} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('PDF generation failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate PDF' };
  }
}
