import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateOrderPDF = (order: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(31, 168, 154); // Primary color #1FA89A
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('KRYROS GLOBAL TECH', 15, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('ORDER SUMMARY', pageWidth - 15, 25, { align: 'right' });

  // Order Info
  doc.setTextColor(51, 65, 85); // Slate 700
  doc.setFontSize(10);
  doc.text(`Order Number: #${order.orderNumber}`, 15, 50);
  doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, 15, 56);
  doc.text(`Status: ${order.status || 'Pending'}`, 15, 62);

  // Customer Info
  doc.setFont('helvetica', 'bold');
  doc.text('BILLING & SHIPPING', 15, 75);
  doc.setFont('helvetica', 'normal');
  const customer = order.customer || {};
  const address = order.shippingAddress || {};
  doc.text(`${customer.firstName || ''} ${customer.lastName || ''}`, 15, 81);
  doc.text(`${address.address || address.street || ''}`, 15, 87);
  doc.text(`${address.city || ''}, ${address.state || ''}`, 15, 93);
  doc.text(`${address.country || ''}`, 15, 99);
  doc.text(`${address.phone || customer.phone || ''}`, 15, 105);

  // Table
  const tableData = order.items.map((item: any) => [
    item.name,
    item.variant || 'Standard',
    item.quantity.toString(),
    `${order.currency?.symbol || ''}${item.price.toLocaleString()}`,
    `${order.currency?.symbol || ''}${(item.price * item.quantity).toLocaleString()}`
  ]);

  (doc as any).autoTable({
    startY: 115,
    head: [['Product', 'Variant', 'Qty', 'Price', 'Total']],
    body: tableData,
    headStyles: { fillColor: [31, 168, 154], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totalX = pageWidth - 15;

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalX - 40, finalY);
  doc.text(`${order.currency?.symbol || ''}${order.subtotal?.toLocaleString()}`, totalX, finalY, { align: 'right' });

  doc.text('Shipping:', totalX - 40, finalY + 6);
  doc.text(`${order.currency?.symbol || ''}${order.shipping?.toLocaleString()}`, totalX, finalY + 6, { align: 'right' });

  if (order.tax) {
    doc.text('Tax:', totalX - 40, finalY + 12);
    doc.text(`${order.currency?.symbol || ''}${order.tax?.toLocaleString()}`, totalX, finalY + 12, { align: 'right' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', totalX - 40, finalY + 20);
  doc.text(`${order.currency?.symbol || ''}${order.total?.toLocaleString()}`, totalX, finalY + 20, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Thank you for shopping with Kryros Global Tech!', pageWidth / 2, pageWidth > 200 ? 285 : 280, { align: 'center' });

  doc.save(`Kryros-Order-${order.orderNumber}.pdf`);
};
