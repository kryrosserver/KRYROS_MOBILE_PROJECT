import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateOrderPDF = (order: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // --- Header Section ---
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('KRYROS', centerX, 30, { align: 'center' });

  doc.setFontSize(14);
  doc.text('KRYROS MOBILE TECH LIMITED', centerX, 42, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TPIN: 2003951496', centerX, 50, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('PLOT NO. 139 ROYAL, LUSAKA, ZAMBIA', centerX, 58, { align: 'center' });
  doc.text('+260966423719 | +260966629719', centerX, 64, { align: 'center' });
  doc.setTextColor(31, 168, 154);
  doc.text('info@kryros.com', centerX, 70, { align: 'center' });

  // Divider line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(20, 78, pageWidth - 20, 78);

  // --- Order Info Section ---
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order Number:`, 20, 90);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${order.orderNumber}`, 55, 90);

  doc.setFont('helvetica', 'bold');
  doc.text(`Date:`, 20, 98);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })}`, 55, 98);

  doc.setFont('helvetica', 'bold');
  doc.text(`Status:`, 20, 106);
  doc.setFont('helvetica', 'normal');
  doc.text(`${(order.status || 'PENDING').toUpperCase()}`, 55, 106);

  // --- Billing & Shipping Section ---
  doc.setFont('helvetica', 'bold');
  doc.text('BILLING & SHIPPING', 20, 120);
  
  doc.setFont('helvetica', 'normal');
  const customer = order.addressDetails || order.customer || {};
  const firstName = customer.firstName || '';
  const lastName = customer.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Valued Customer';
  
  let addressY = 128;
  doc.text(fullName, 20, addressY);
  addressY += 6;
  
  if (customer.address) {
    doc.text(customer.address, 20, addressY);
    addressY += 6;
  }
  
  const locationParts = [];
  if (customer.cityName || customer.city) locationParts.push(customer.cityName || customer.city);
  if (customer.stateName || customer.state) locationParts.push(customer.stateName || customer.state);
  if (locationParts.length > 0) {
    doc.text(locationParts.join(', '), 20, addressY);
    addressY += 6;
  }
  
  if (customer.countryName || customer.country) {
    doc.text(customer.countryName || customer.country, 20, addressY);
    addressY += 6;
  }
  
  if (customer.phone) {
    doc.text(customer.phone, 20, addressY);
    addressY += 6;
  }

  // --- Order Notes Section ---
  if (order.notes) {
    addressY += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER NOTES:', 20, addressY);
    addressY += 6;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(order.notes, pageWidth - 40);
    doc.text(splitNotes, 20, addressY);
    addressY += (splitNotes.length * 6) + 4;
  }

  // --- Items Table Section ---
  const currencySymbol = order.currency?.symbol || 'ZMW';
  
  const tableRows = (order.items || []).map((item: any) => [
    item.name || item.product?.name || 'Product',
    item.variantName || item.variant?.name || 'Standard',
    item.quantity.toString(),
    `${currencySymbol}${Number(item.price).toLocaleString()}`,
    `${currencySymbol}${(Number(item.price) * item.quantity).toLocaleString()}`
  ]);

  (doc as any).autoTable({
    startY: addressY > 150 ? addressY : 150,
    head: [['Product', 'Variant', 'Qty', 'Price', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [31, 168, 154], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // --- Summary Section ---
  const summaryX = pageWidth - 60;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Subtotal:', summaryX, finalY);
  doc.text(`${currencySymbol}${Number(order.subtotal || 0).toLocaleString()}`, pageWidth - 20, finalY, { align: 'right' });

  doc.text('Shipping:', summaryX, finalY + 8);
  doc.text(`${currencySymbol}${Number(order.shippingFee || order.shipping || 0).toLocaleString()}`, pageWidth - 20, finalY + 8, { align: 'right' });

  // Calculate Tax (Zambia VAT is usually 16%)
  const tax = order.tax || (Number(order.subtotal || 0) * 0.16);
  doc.text('Tax (16%):', summaryX, finalY + 16);
  doc.text(`${currencySymbol}${Number(tax).toLocaleString()}`, pageWidth - 20, finalY + 16, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.line(summaryX, finalY + 20, pageWidth - 20, finalY + 20);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', summaryX, finalY + 30);
  doc.text(`${currencySymbol}${Number(order.total || 0).toLocaleString()}`, pageWidth - 20, finalY + 30, { align: 'right' });

  // --- Payment Method Info ---
  let paymentY = finalY + 45;
  if (order.paymentMethod === 'BANK_TRANSFER') {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BANK TRANSFER DETAILS:', 20, paymentY);
    doc.setFont('helvetica', 'normal');
    doc.text('Bank: KRYROS BANK', 20, paymentY + 6);
    doc.text('Acc Name: KRYROS MOBILE TECH LTD', 20, paymentY + 12);
    doc.text('Acc No: 1234567890123', 20, paymentY + 18);
    paymentY += 25;
  }

  // --- Receipt Title (Centered) ---
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT', centerX, paymentY + 15, { align: 'center' });

  // --- Footer Section ---
  const footerY = pageHeight - 30;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing Kryros!', centerX, footerY, { align: 'center' });
  
  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleString()}`, centerX, footerY + 8, { align: 'center' });
  doc.text(`Order Reference: #${order.orderNumber}`, centerX, footerY + 14, { align: 'center' });

  doc.save(`Kryros-Order-${order.orderNumber}.pdf`);
};
