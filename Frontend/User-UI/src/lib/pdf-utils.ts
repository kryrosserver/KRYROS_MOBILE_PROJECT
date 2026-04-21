import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateOrderPDF = (order: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // Company Header (Simple & Clean)
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.text('KRYROS', centerX, 40, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.text('KRYROS MOBILE TECH LIMITED', centerX, 60, { align: 'center' });

  // Add Company Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TPIN: 2003951496', centerX, 75, { align: 'center' });

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('PLOT NO. 139 ROYAL', centerX, 92, { align: 'center' });
  doc.text('ZAMBIA', centerX, 108, { align: 'center' });

  doc.setFontSize(14);
  doc.text('+260966423719 | +260966629719', centerX, 123, { align: 'center' });

  doc.setTextColor(31, 168, 154);
  doc.text('info@kryros.com', centerX, 138, { align: 'center' });

  // Divider line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.setLineDash([3, 3], 0);
  doc.line(20, 148, pageWidth - 20, 148);
  doc.setLineDash([], 0);

  // Customer Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  const customer = order.customer || {};
  doc.text(`Customer:`, 20, 165);
  doc.setFont('helvetica', 'bold');
  doc.text(`${customer.firstName || ''} ${customer.lastName || ''}`, pageWidth - 20, 165, { align: 'right' });

  // Description (First product or all items)
  doc.setFont('helvetica', 'normal');
  let yPosition = 180;
  
  if (order.items && order.items.length > 0) {
    if (order.items.length === 1) {
      doc.text(`Description:`, 20, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(`${order.items[0].name}`, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 15;
    } else {
      // Multiple items - list them
      doc.text(`Description:`, 20, yPosition);
      yPosition += 15;
      
      order.items.forEach((item: any, index: number) => {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.quantity}x ${item.name}`, 25, yPosition);
        doc.setFont('helvetica', 'bold');
        const itemTotal = item.price * item.quantity;
        doc.text(`${order.currency?.symbol || ''}${itemTotal.toLocaleString()}`, pageWidth - 20, yPosition, { align: 'right' });
        yPosition += 12;
      });
    }
  }

  // Divider line
  doc.setLineDash([3, 3], 0);
  doc.line(20, yPosition + 5, pageWidth - 20, yPosition + 5);
  doc.setLineDash([], 0);
  yPosition += 20;

  // Price Details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Price', 20, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.text(`${order.currency?.symbol || ''}${order.subtotal?.toLocaleString()}`, pageWidth - 20, yPosition, { align: 'right' });
  
  yPosition += 15;
  doc.setFont('helvetica', 'normal');
  doc.text('Shipping', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.currency?.symbol || ''}${order.shipping?.toLocaleString()}`, pageWidth - 20, yPosition, { align: 'right' });

  yPosition += 20;
  // Final Divider
  doc.setLineDash([3, 3], 0);
  doc.line(pageWidth - 100, yPosition, pageWidth - 20, yPosition);
  doc.setLineDash([], 0);
  yPosition += 15;

  // Total
  doc.setFontSize(22);
  doc.setFont('helvetica', 'normal');
  doc.text('Total:', 20, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(`${order.currency?.symbol || ''}${order.total?.toLocaleString()}`, pageWidth - 20, yPosition, { align: 'right' });

  // Receipt Label
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT', centerX, yPosition, { align: 'center' });

  yPosition += 25;

  // Date
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'normal');
  doc.text(`DATE: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, centerX, yPosition, { align: 'center' });

  yPosition += 20;

  // Phone if available
  const address = order.shippingAddress || {};
  if (address.phone || customer.phone) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(`${address.phone || customer.phone || ''}`, centerX, yPosition, { align: 'center' });
    yPosition += 20;
  }

  // Thank you message
  doc.setFontSize(16);
  doc.text('Thank you for choosing us!', centerX, yPosition, { align: 'center' });

  yPosition += 25;

  // Barcode placeholder (simple lines for barcode look)
  const barcodeX = centerX - 40;
  const barcodeY = yPosition;
  const barcodeHeight = 40;
  
  doc.setLineWidth(1);
  doc.setDrawColor(0, 0, 0);
  
  // Draw simple barcode pattern
  for (let i = 0; i < 40; i++) {
    const lineWidth = i % 3 === 0 ? 2 : (i % 2 === 0 ? 1.5 : 1);
    doc.setLineWidth(lineWidth);
    doc.line(barcodeX + i * 2, barcodeY, barcodeX + i * 2, barcodeY + barcodeHeight);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); 
  doc.text(`Order #${order.orderNumber}`, centerX, pageHeight - 20, { align: 'center' });

  doc.save(`Kryros-Order-${order.orderNumber}.pdf`);
};
