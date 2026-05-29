'use client';
import { useState } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, FormField, ModalFooter } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { ShoppingCart, ChevronLeft, MapPin, User, CreditCard, Package, CheckCircle } from 'lucide-react';
import { updateOrder } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────
type OrderItem = { id: string; name: string; sku: string; qty: number; price: string; subtotal: string };

type Order = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  date: string;
  total: string;
  subtotal: string;
  shippingCost: string;
  discount: string;
  status: string;
  paymentStatus: string;
  items: number;
  itemsList: OrderItem[];
  payment: string;
  address: string;
  city: string;
  province: string;
  country: string;
  deliveryNotes: string;
};

// ─── Data ─────────────────────────────────────────────────
const INITIAL: Order[] = [
  {
    id: '#KRY123456', customer: 'Bwalya Chileshe', email: 'bwalya@example.com', phone: '+260 977 123 456',
    date: '2025-05-26', total: '$1,099.00', subtotal: '$1,099.00', shippingCost: '$0.00', discount: '$0.00',
    status: 'Completed', paymentStatus: 'Paid', items: 1, payment: 'Credit Card',
    address: '15 Cairo Road, Flat 3B', city: 'Lusaka', province: 'Lusaka', country: 'Zambia', deliveryNotes: 'Please call before delivery.',
    itemsList: [{ id: 'i1', name: 'iPhone 15 Pro Max', sku: 'APL-IP15PM', qty: 1, price: '$1,099.00', subtotal: '$1,099.00' }],
  },
  {
    id: '#KRY123455', customer: 'Mulenga Schone', email: 'mulenga@example.com', phone: '+260 966 234 567',
    date: '2025-05-26', total: '$349.00', subtotal: '$339.00', shippingCost: '$10.00', discount: '$0.00',
    status: 'Processing', paymentStatus: 'Paid', items: 2, payment: 'Mobile Money',
    address: '42 Independence Avenue', city: 'Ndola', province: 'Copperbelt', country: 'Zambia', deliveryNotes: '',
    itemsList: [
      { id: 'i1', name: 'Sony WH-1000XM5', sku: 'SNY-WH1000', qty: 1, price: '$299.00', subtotal: '$299.00' },
      { id: 'i2', name: 'Phone Case', sku: 'ACC-PC001', qty: 2, price: '$20.00', subtotal: '$40.00' },
    ],
  },
  {
    id: '#KRY123454', customer: 'Chansa Kapwepwe', email: 'chansa@example.com', phone: '+260 955 345 678',
    date: '2025-05-26', total: '$2,499.00', subtotal: '$2,499.00', shippingCost: '$0.00', discount: '$0.00',
    status: 'Completed', paymentStatus: 'Paid', items: 1, payment: 'Bank Transfer',
    address: '8 Nangwenya Road', city: 'Kitwe', province: 'Copperbelt', country: 'Zambia', deliveryNotes: 'Leave with security.',
    itemsList: [{ id: 'i1', name: 'MacBook Air M2', sku: 'APL-MBA-M2', qty: 1, price: '$2,499.00', subtotal: '$2,499.00' }],
  },
  {
    id: '#KRY123453', customer: 'Chanda Kapwepwe', email: 'chanda@example.com', phone: '+260 975 456 789',
    date: '2025-05-25', total: '$129.00', subtotal: '$119.00', shippingCost: '$10.00', discount: '$0.00',
    status: 'Pending', paymentStatus: 'Pending', items: 3, payment: 'Cash',
    address: '5 Freedom Way', city: 'Livingstone', province: 'Southern', country: 'Zambia', deliveryNotes: '',
    itemsList: [
      { id: 'i1', name: 'Phone Screen Protector', sku: 'ACC-SP001', qty: 2, price: '$15.00', subtotal: '$30.00' },
      { id: 'i2', name: 'USB-C Cable', sku: 'ACC-USB-C', qty: 3, price: '$12.00', subtotal: '$36.00' },
      { id: 'i3', name: 'Power Bank 20000mAh', sku: 'ACC-PB20K', qty: 1, price: '$53.00', subtotal: '$53.00' },
    ],
  },
  {
    id: '#KRY123452', customer: 'Chansa Mumba', email: 'chansa.m@example.com', phone: '+260 960 567 890',
    date: '2025-05-25', total: '$899.00', subtotal: '$899.00', shippingCost: '$0.00', discount: '$0.00',
    status: 'Completed', paymentStatus: 'Paid', items: 1, payment: 'Credit Card',
    address: '22 Kabulonga Road', city: 'Lusaka', province: 'Lusaka', country: 'Zambia', deliveryNotes: '',
    itemsList: [{ id: 'i1', name: 'Samsung Galaxy S24 Ultra', sku: 'SAM-GS24U', qty: 1, price: '$899.00', subtotal: '$899.00' }],
  },
  {
    id: '#KRY123451', customer: 'John Banda', email: 'john@example.com', phone: '+260 977 678 901',
    date: '2025-05-24', total: '$45.00', subtotal: '$35.00', shippingCost: '$10.00', discount: '$0.00',
    status: 'Cancelled', paymentStatus: 'Refunded', items: 1, payment: 'Mobile Money',
    address: '3 Kamwala Road', city: 'Lusaka', province: 'Lusaka', country: 'Zambia', deliveryNotes: '',
    itemsList: [{ id: 'i1', name: 'Phone Case Premium', sku: 'ACC-PC002', qty: 1, price: '$35.00', subtotal: '$35.00' }],
  },
  {
    id: '#KRY123450', customer: 'Mary Phiri', email: 'mary@example.com', phone: '+260 966 789 012',
    date: '2025-05-24', total: '$780.00', subtotal: '$770.00', shippingCost: '$10.00', discount: '$0.00',
    status: 'Shipped', paymentStatus: 'Paid', items: 2, payment: 'Credit Card',
    address: '17 Munali Road', city: 'Lusaka', province: 'Lusaka', country: 'Zambia', deliveryNotes: 'Ring the doorbell twice.',
    itemsList: [
      { id: 'i1', name: 'AirPods Pro 2', sku: 'APL-APP2', qty: 1, price: '$249.00', subtotal: '$249.00' },
      { id: 'i2', name: 'Apple Watch Series 9', sku: 'APL-AW9', qty: 1, price: '$521.00', subtotal: '$521.00' },
    ],
  },
  {
    id: '#KRY123449', customer: 'Peter Zulu', email: 'peter@example.com', phone: '+260 955 890 123',
    date: '2025-05-23', total: '$3,200.00', subtotal: '$3,200.00', shippingCost: '$0.00', discount: '$0.00',
    status: 'Completed', paymentStatus: 'Paid', items: 4, payment: 'Bank Transfer',
    address: '6 Great East Road', city: 'Lusaka', province: 'Lusaka', country: 'Zambia', deliveryNotes: '',
    itemsList: [
      { id: 'i1', name: 'iPad Pro 13"', sku: 'APL-IPP13', qty: 1, price: '$1,299.00', subtotal: '$1,299.00' },
      { id: 'i2', name: 'Apple Pencil', sku: 'APL-PEN2', qty: 1, price: '$129.00', subtotal: '$129.00' },
      { id: 'i3', name: 'Magic Keyboard', sku: 'APL-MKBD', qty: 1, price: '$299.00', subtotal: '$299.00' },
      { id: 'i4', name: 'MacBook Air M2', sku: 'APL-MBA-M2', qty: 1, price: '$1,473.00', subtotal: '$1,473.00' },
    ],
  },
  {
    id: '#KRY123448', customer: 'Grace Tembo', email: 'grace@example.com', phone: '+260 975 901 234',
    date: '2025-05-22', total: '$65.00', subtotal: '$55.00', shippingCost: '$10.00', discount: '$0.00',
    status: 'Refunded', paymentStatus: 'Refunded', items: 1, payment: 'Cash',
    address: '9 Chilenje Road', city: 'Lusaka', province: 'Lusaka', country: 'Zambia', deliveryNotes: '',
    itemsList: [{ id: 'i1', name: 'Beats Studio Pro', sku: 'BTS-SP', qty: 1, price: '$55.00', subtotal: '$55.00' }],
  },
  {
    id: '#KRY123447', customer: 'David Mwale', email: 'david@example.com', phone: '+260 960 012 345',
    date: '2025-05-21', total: '$450.00', subtotal: '$440.00', shippingCost: '$10.00', discount: '$0.00',
    status: 'Processing', paymentStatus: 'Paid', items: 2, payment: 'Credit Card',
    address: '31 Longacres Road', city: 'Lusaka', province: 'Lusaka', country: 'Zambia', deliveryNotes: 'Office delivery, ask for David.',
    itemsList: [
      { id: 'i1', name: 'Sony WH-1000XM5', sku: 'SNY-WH1000', qty: 1, price: '$299.00', subtotal: '$299.00' },
      { id: 'i2', name: 'Phone Stand', sku: 'ACC-STD01', qty: 1, price: '$141.00', subtotal: '$141.00' },
    ],
  },
];

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled', 'Refunded'];

function OrdersContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';

  const [data, setData] = useState<Order[]>(INITIAL);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editRow, setEditRow] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const openDetail = (row: Record<string, unknown>) => setSelectedOrder(row as unknown as Order);
  const openEdit = (row: Record<string, unknown>) => {
    const r = row as unknown as Order;
    setEditStatus(r.status);
    setEditRow(r);
  };

  const handleUpdateStatus = async () => {
    if (!editRow) return;
    setLoading(true);
    try {
      await updateOrder(editRow.id.replace('#', ''), { status: editStatus });
      setData(d => d.map(o => o.id === editRow.id ? { ...o, status: editStatus } : o));
      if (selectedOrder?.id === editRow.id) setSelectedOrder(o => o ? { ...o, status: editStatus } : o);
      toast.success('Order status updated');
      setEditRow(null);
    } catch { toast.error('Failed to update order — check your API connection'); }
    setLoading(false);
  };

  const statusBadge = (status: string, size: 'sm' | 'md' = 'sm') => {
    const map: Record<string, { bg: string; color: string }> = {
      Completed: { bg: 'rgba(31,168,154,0.12)', color: '#1FA89A' },
      Processing: { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
      Pending: { bg: 'rgba(255,193,7,0.12)', color: '#FFC107' },
      Cancelled: { bg: 'rgba(185,28,28,0.12)', color: '#ef4444' },
      Shipped: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
      Refunded: { bg: 'rgba(100,116,139,0.12)', color: '#64748b' },
      Paid: { bg: 'rgba(31,168,154,0.12)', color: '#1FA89A' },
      Unpaid: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    };
    const s = map[status] || { bg: 'rgba(100,116,139,0.12)', color: '#64748b' };
    const fontSize = size === 'md' ? '13px' : '11.5px';
    const padding = size === 'md' ? '5px 14px' : '3px 10px';
    return <span style={{ padding, borderRadius: '20px', fontSize, fontWeight: 600, background: s.bg, color: s.color }}>{status}</span>;
  };

  const columns: Column[] = [
    { key: 'id', label: 'Order ID', render: (v) => <span style={{ fontWeight: 700, color: '#1FA89A', fontSize: '13px' }}>{String(v)}</span> },
    { key: 'customer', label: 'Customer', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: textMain }}>{String(v)}</div>
        <div style={{ fontSize: '11.5px', color: textMuted }}>{String((row as unknown as Order).email)}</div>
      </div>
    )},
    { key: 'date', label: 'Date' },
    { key: 'items', label: 'Items', render: (v) => <span style={{ fontWeight: 600, color: textMain }}>{String(v)}</span> },
    { key: 'total', label: 'Total', render: (v) => <span style={{ fontWeight: 700, color: '#1FA89A' }}>{String(v)}</span> },
    { key: 'payment', label: 'Payment' },
    { key: 'status', label: 'Status', render: (v) => statusBadge(String(v)) },
  ];

  const stats = [
    { label: 'Total Orders', val: String(data.length), color: '#1FA89A' },
    { label: 'Completed', val: String(data.filter(o => o.status === 'Completed').length), color: '#1FA89A' },
    { label: 'Processing', val: String(data.filter(o => o.status === 'Processing').length), color: '#6366f1' },
    { label: 'Pending', val: String(data.filter(o => o.status === 'Pending').length), color: '#FFC107' },
  ];

  // ─── Helper: section card ─────────────────────────────
  const SectionCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderBottom: `1px solid ${border}`, background: surface }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(31,168,154,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: textMain, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  );

  const Field = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '13.5px', fontWeight: highlight ? 700 : 500, color: highlight ? '#1FA89A' : textMain }}>{value || '—'}</div>
    </div>
  );

  // ─── ORDER DETAIL VIEW ────────────────────────────────
  if (selectedOrder) {
    const o = selectedOrder;
    return (
      <div>
        {/* Back button + header */}
        <button onClick={() => setSelectedOrder(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isDark ? '#1E293B' : '#F1F5F9', border: `1px solid ${border}`, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', color: textMain, fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-inter)', marginBottom: '16px' }}>
          <ChevronLeft size={14} /> Back to Orders
        </button>

        {/* Order header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: textMain }}>{o.id}</h1>
              {statusBadge(o.status, 'md')}
            </div>
            <p style={{ fontSize: '13px', color: textMuted, marginTop: '4px' }}>Placed on {o.date} &nbsp;·&nbsp; {o.items} {o.items === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={() => { setEditStatus(o.status); setEditRow(o); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#1FA89A,#27B9AF)', border: 'none', borderRadius: '9px', color: 'white', fontSize: '13.5px', fontWeight: 600, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-inter)', boxShadow: '0 4px 12px rgba(31,168,154,0.25)' }}>
            <CheckCircle size={15} /> Update Status
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }} className="od-grid">
          {/* LEFT COLUMN */}
          <div>
            {/* Order Items */}
            <SectionCard icon={<Package size={15} color="#1FA89A" />} title="Order Items">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 80px', gap: '8px', padding: '6px 0', borderBottom: `1px solid ${border}`, marginBottom: '6px' }}>
                  {['Product', 'Qty', 'Price', 'Subtotal'].map(h => (
                    <div key={h} style={{ fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</div>
                  ))}
                </div>
                {o.itemsList.map(item => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 80px', gap: '8px', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: textMain }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: textMuted, marginTop: '2px' }}>{item.sku}</div>
                    </div>
                    <div style={{ fontSize: '13px', color: textMain, fontWeight: 600 }}>×{item.qty}</div>
                    <div style={{ fontSize: '13px', color: textMuted }}>{item.price}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1FA89A' }}>{item.subtotal}</div>
                  </div>
                ))}
                {/* Totals */}
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { label: 'Subtotal', val: o.subtotal, highlight: false },
                    { label: 'Shipping', val: o.shippingCost, highlight: false },
                    { label: 'Discount', val: o.discount, highlight: false },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: textMuted }}>{r.label}</span>
                      <span style={{ color: textMain, fontWeight: 500 }}>{r.val}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, paddingTop: '8px', borderTop: `2px solid ${border}`, marginTop: '4px' }}>
                    <span style={{ color: textMain }}>Total</span>
                    <span style={{ color: '#1FA89A' }}>{o.total}</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Payment */}
            <SectionCard icon={<CreditCard size={15} color="#1FA89A" />} title="Payment">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '3px' }}>Payment Method</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 500, color: textMain }}>{o.payment}</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>Payment Status</div>
                  {statusBadge(o.paymentStatus)}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Customer */}
            <SectionCard icon={<User size={15} color="#1FA89A" />} title="Customer Details">
              <Field label="Full Name" value={o.customer} />
              <Field label="Email Address" value={o.email} />
              <Field label="Phone Number" value={o.phone} />
            </SectionCard>

            {/* Delivery Address */}
            <SectionCard icon={<MapPin size={15} color="#1FA89A" />} title="Delivery Address">
              <Field label="Street Address" value={o.address} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                <Field label="City" value={o.city} />
                <Field label="Province / Region" value={o.province} />
              </div>
              <Field label="Country" value={o.country} />
              {o.deliveryNotes && <Field label="Delivery Notes" value={o.deliveryNotes} />}
            </SectionCard>

            {/* Order Status Timeline */}
            <SectionCard icon={<CheckCircle size={15} color="#1FA89A" />} title="Order Status">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(['Pending', 'Processing', 'Shipped', 'Completed'] as const).map((s, idx) => {
                  const statusOrder = ['Pending', 'Processing', 'Shipped', 'Completed'];
                  const currentIdx = statusOrder.indexOf(o.status);
                  const stepIdx = statusOrder.indexOf(s);
                  const isDone = currentIdx >= stepIdx && !['Cancelled', 'Refunded'].includes(o.status);
                  const isCurrent = o.status === s;
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isDone ? '#1FA89A' : surface, border: `2px solid ${isDone ? '#1FA89A' : border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isDone && <CheckCircle size={12} color="white" />}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: isCurrent ? 700 : 500, color: isDone ? textMain : textMuted }}>{s}</span>
                      {isCurrent && <span style={{ fontSize: '11px', color: '#1FA89A', fontWeight: 600, background: 'rgba(31,168,154,0.1)', padding: '1px 7px', borderRadius: '10px' }}>Current</span>}
                    </div>
                  );
                })}
                {['Cancelled', 'Refunded'].includes(o.status) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '2px solid #ef4444', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>{o.status}</span>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Update Status Modal */}
        <Modal open={!!editRow} onClose={() => setEditRow(null)} title={`Update Status: ${editRow?.id ?? ''}`}>
          {editRow && <>
            <p style={{ fontSize: '13px', color: textMuted, marginBottom: '16px' }}>Customer: <strong style={{ color: textMain }}>{editRow.customer}</strong></p>
            <FormField label="Order Status" value={editStatus} onChange={setEditStatus} options={ORDER_STATUSES} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
            <ModalFooter onClose={() => setEditRow(null)} onSubmit={handleUpdateStatus} loading={loading} submitLabel="Update Status" isDark={isDark} border={border} textMain={textMain} />
          </>}
        </Modal>

        <style>{`@media(max-width:768px){.od-grid{grid-template-columns:1fr!important;}}`}</style>
      </div>
    );
  }

  // ─── ORDERS LIST VIEW ─────────────────────────────────
  return (
    <div>
      <PageHeader title="Orders" subtitle="Manage and track customer orders" icon={ShoppingCart} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }} className="stats-grid">
        {stats.map(s => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: textMuted, marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
      <DataTable
        columns={columns}
        data={data as unknown as Record<string, unknown>[]}
        searchPlaceholder="Search orders..."
        onView={openDetail}
        onEdit={openEdit}
      />

      {/* Edit Status Modal (accessible from list view too) */}
      <Modal open={!!editRow} onClose={() => setEditRow(null)} title={`Update Status: ${editRow?.id ?? ''}`}>
        {editRow && <>
          <p style={{ fontSize: '13px', color: textMuted, marginBottom: '16px' }}>Customer: <strong style={{ color: textMain }}>{editRow.customer}</strong></p>
          <FormField label="Order Status" value={editStatus} onChange={setEditStatus} options={ORDER_STATUSES} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <ModalFooter onClose={() => setEditRow(null)} onSubmit={handleUpdateStatus} loading={loading} submitLabel="Update Status" isDark={isDark} border={border} textMain={textMain} />
        </>}
      </Modal>

      <style>{`@media(max-width:768px){.stats-grid{grid-template-columns:1fr 1fr!important;}}`}</style>
    </div>
  );
}

export default function OrdersPage() {
  return <AdminShell><OrdersContent /></AdminShell>;
}
