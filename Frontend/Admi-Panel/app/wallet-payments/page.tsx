'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, FormField } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { Wallet, Link2, CreditCard, TrendingUp, ChevronDown } from 'lucide-react';
import { getWalletTransactions, getPayments } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
type Tx = { id:string; user:string; type:string; method:string; amount:string; fee:string; date:string; status:string; ref:string };
type PayLink = { id:string; name:string; url:string; amount:string; clicks:string; status:string; created:string; desc:string };
type CheckMethod = { id:string; name:string; type:string; provider:string; status:string; enabled:string };

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockTx: Tx[] = [
  { id:'TXN001', user:'Bwalya Chileshe',  type:'Deposit',    method:'Mobile Money',  amount:'$500.00',   fee:'$2.50',  date:'2025-05-26 10:24', status:'Completed', ref:'MM2025052601' },
  { id:'TXN002', user:'Mulenga Schone',   type:'Payment',    method:'Credit Card',   amount:'$349.00',   fee:'$8.75',  date:'2025-05-26 09:15', status:'Completed', ref:'CC2025052601' },
  { id:'TXN003', user:'Chansa Mumba',     type:'Withdrawal', method:'Bank Transfer', amount:'$1,000.00', fee:'$5.00',  date:'2025-05-25 14:30', status:'Pending',   ref:'BT2025052501' },
  { id:'TXN004', user:'John Banda',       type:'Refund',     method:'Mobile Money',  amount:'$45.00',    fee:'$0.00',  date:'2025-05-24 11:20', status:'Completed', ref:'RF2025052401' },
  { id:'TXN005', user:'Mary Phiri',       type:'Deposit',    method:'Cash',          amount:'$200.00',   fee:'$0.00',  date:'2025-05-23 16:45', status:'Completed', ref:'CA2025052301' },
  { id:'TXN006', user:'Peter Zulu',       type:'Payment',    method:'Credit Card',   amount:'$3,200.00', fee:'$80.00', date:'2025-05-22 08:10', status:'Failed',    ref:'CC2025052201' },
];

const mockLinks: PayLink[] = [
  { id:'LNK001', name:'Premium Plan Checkout', url:'pay.example.com/l/prm001',  amount:'$49.00',  clicks:'124', status:'Active',   created:'2025-05-20', desc:'Premium subscription payment link' },
  { id:'LNK002', name:'Order #1042 Payment',   url:'pay.example.com/l/ord1042', amount:'$349.00', clicks:'3',   status:'Active',   created:'2025-05-24', desc:'Custom order payment request' },
  { id:'LNK003', name:'Event Ticket – June',   url:'pay.example.com/l/evt0601', amount:'$25.00',  clicks:'89',  status:'Expired',  created:'2025-04-15', desc:'Conference ticket payment' },
  { id:'LNK004', name:'Donation Drive 2025',   url:'pay.example.com/l/don2025', amount:'Any',     clicks:'312', status:'Active',   created:'2025-01-10', desc:'Community donation collection' },
  { id:'LNK005', name:'Basic Plan Monthly',    url:'pay.example.com/l/bsc001',  amount:'$19.00',  clicks:'67',  status:'Active',   created:'2025-03-01', desc:'Basic monthly subscription' },
];

const mockMethods: CheckMethod[] = [
  { id:'MTH001', name:'Mobile Money',      type:'Mobile Wallet',  provider:'MTN / Airtel', status:'Active',   enabled:'Yes' },
  { id:'MTH002', name:'Credit/Debit Card', type:'Card Payment',   provider:'Stripe',       status:'Active',   enabled:'Yes' },
  { id:'MTH003', name:'Bank Transfer',     type:'Bank',           provider:'Local Banks',  status:'Active',   enabled:'Yes' },
  { id:'MTH004', name:'Cash on Delivery',  type:'Cash',           provider:'Internal',     status:'Active',   enabled:'Yes' },
  { id:'MTH005', name:'PayPal',            type:'Digital Wallet', provider:'PayPal',       status:'Inactive', enabled:'No'  },
  { id:'MTH006', name:'Crypto (USDT)',     type:'Cryptocurrency', provider:'Binance Pay',  status:'Inactive', enabled:'No'  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string,string> = {
  Completed:'#1FA89A', Active:'#1FA89A', Yes:'#1FA89A',
  Pending:'#FFC107',
  Failed:'#ef4444', Expired:'#ef4444', No:'#ef4444',
  Inactive:'#64748b',
};
const STATUS_BG: Record<string,string> = {
  Completed:'rgba(31,168,154,0.12)', Active:'rgba(31,168,154,0.12)', Yes:'rgba(31,168,154,0.12)',
  Pending:'rgba(255,193,7,0.12)',
  Failed:'rgba(185,28,28,0.12)', Expired:'rgba(185,28,28,0.12)', No:'rgba(185,28,28,0.12)',
  Inactive:'rgba(100,116,139,0.12)',
};
const TYPE_COLOR: Record<string,string> = {
  Deposit:'#1FA89A', Payment:'#6366f1', Withdrawal:'#f59e0b', Refund:'#64748b',
};

function StatusBadge({ value }: { value: string }) {
  return (
    <span style={{
      padding:'3px 10px', borderRadius:'20px', fontSize:'11.5px', fontWeight:600,
      background: STATUS_BG[value] ?? 'rgba(100,116,139,0.12)',
      color: STATUS_COLOR[value] ?? '#64748b',
    }}>{value}</span>
  );
}

function FilterSelect({
  value, onChange, options, placeholder, border, textMuted, surface, textMain,
}: {
  value:string; onChange:(v:string)=>void; options:string[];
  placeholder:string; border:string; textMuted:string; surface:string; textMain:string;
}) {
  return (
    <div style={{position:'relative',display:'inline-flex',alignItems:'center'}}>
      <select
        value={value}
        onChange={e=>onChange(e.target.value)}
        style={{
          appearance:'none', background:surface, border:`1px solid ${border}`,
          borderRadius:'9px', padding:'0 32px 0 12px', height:'36px',
          color: value ? textMain : textMuted, fontSize:'13px',
          cursor:'pointer', outline:'none', fontFamily:'var(--font-inter)',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} color={textMuted} style={{position:'absolute',right:'10px',pointerEvents:'none'}} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function WalletContent() {
  const { theme } = useTheme();
  const isDark  = theme === 'dark';
  const card    = isDark ? '#0D1523' : '#FFFFFF';
  const border  = isDark ? '#1E293B' : '#E2E8F0';
  const textMain  = isDark ? '#FFFFFF'  : '#0F172A';
  const textMuted = isDark ? '#8E9AAF'  : '#64748B';
  const surface   = isDark ? '#101826'  : '#F1F5F9';

  type Tab = 'transactions' | 'links' | 'methods';
  const [activeTab, setActiveTab] = useState<Tab>('transactions');
  const [txData, setTxData] = useState<Tx[]>([]);
  useEffect(() => {
    Promise.all([
      getWalletTransactions({ limit: 200 }).catch(() => ({ data: [] })),
      getPayments({ limit: 200 }).catch(() => ({ data: [] })),
    ]).then(([wRes, pRes]: any[]) => {
      const wRaw: any[] = Array.isArray(wRes.data?.data) ? wRes.data.data : Array.isArray(wRes.data) ? wRes.data : [];
      const pRaw: any[] = Array.isArray(pRes.data?.data) ? pRes.data.data : Array.isArray(pRes.data) ? pRes.data : [];
      const combined: Tx[] = [
        ...wRaw.map((t: any) => ({
          id: t.id?.slice(-8) || `W${Date.now().toString().slice(-5)}`,
          user: t.user ? (`${t.user.firstName||''} ${t.user.lastName||''}`.trim() || t.user.email || 'Customer') : 'Customer',
          type: t.type || 'Wallet',
          method: t.paymentMethod || t.method || 'Wallet',
          amount: t.amount ? `K${Number(t.amount).toLocaleString()}` : 'K0',
          fee: t.fee ? `K${Number(t.fee).toLocaleString()}` : 'K0',
          date: t.createdAt ? t.createdAt.split('T')[0] : '',
          status: t.status==='COMPLETED'||t.status==='SUCCESS' ? 'Completed' : t.status==='PENDING' ? 'Pending' : t.status==='FAILED' ? 'Failed' : (t.status||'Completed'),
          ref: t.reference || t.id || '',
        })),
        ...pRaw.map((p: any) => ({
          id: p.id?.slice(-8) || `P${Date.now().toString().slice(-5)}`,
          user: p.user ? (`${p.user.firstName||''} ${p.user.lastName||''}`.trim() || p.user.email || 'Customer') : 'Customer',
          type: 'Payment',
          method: p.provider || p.method || 'Payment',
          amount: p.amount ? `K${Number(p.amount).toLocaleString()}` : 'K0',
          fee: 'K0',
          date: p.createdAt ? p.createdAt.split('T')[0] : '',
          status: p.status==='PAID'||p.status==='COMPLETED' ? 'Completed' : p.status==='PENDING' ? 'Pending' : p.status==='FAILED' ? 'Failed' : (p.status||'Pending'),
          ref: p.reference || p.id || '',
        })),
      ];
      setTxData(combined);
    }).catch(() => {});
  }, []);

  // Tx filters
  const [methodFilter, setMethodFilter]  = useState('');
  const [statusFilter, setStatusFilter]  = useState('');

  // Modals
  const [viewTx,     setViewTx]     = useState<Tx|null>(null);
  const [viewLink,   setViewLink]   = useState<PayLink|null>(null);
  const [viewMethod, setViewMethod] = useState<CheckMethod|null>(null);

  // ── Tab 1 columns
  const txColumns: Column[] = [
    { key:'id',     label:'Transaction', width:'110px',
      render:(v)=><code style={{fontSize:'11px',color:'#1FA89A',background:'rgba(31,168,154,0.1)',padding:'2px 7px',borderRadius:'4px'}}>{String(v)}</code> },
    { key:'user',   label:'User',   render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'amount', label:'Amount', render:(v)=><span style={{fontWeight:800,color:textMain,fontSize:'14px'}}>{String(v)}</span> },
    { key:'fee',    label:'Fee',    render:(v)=><span style={{color:textMuted}}>{String(v)}</span> },
    { key:'method', label:'Method' },
    { key:'status', label:'Status', render:(v)=><StatusBadge value={String(v)} /> },
    { key:'date',   label:'Date' },
  ];

  const txFiltered = txData.filter(r =>
    (!methodFilter || r.method === methodFilter) &&
    (!statusFilter || r.status === statusFilter)
  );

  const txFilterNode = (
    <>
      <FilterSelect value={methodFilter} onChange={setMethodFilter}
        options={['Mobile Money','Credit Card','Bank Transfer','Cash']}
        placeholder="All Methods" border={border} textMuted={textMuted} surface={surface} textMain={textMain} />
      <FilterSelect value={statusFilter} onChange={setStatusFilter}
        options={['Completed','Pending','Failed']}
        placeholder="All Status" border={border} textMuted={textMuted} surface={surface} textMain={textMain} />
    </>
  );

  // ── Tab 2 columns
  const linkColumns: Column[] = [
    { key:'name',    label:'Link Name',  render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'url',     label:'URL',        render:(v)=><code style={{fontSize:'11px',color:'#1FA89A',background:'rgba(31,168,154,0.1)',padding:'2px 7px',borderRadius:'4px'}}>{String(v)}</code> },
    { key:'amount',  label:'Amount',     render:(v)=><span style={{fontWeight:800,color:textMain}}>{String(v)}</span> },
    { key:'clicks',  label:'Clicks',     render:(v)=><span style={{color:textMuted,fontWeight:600}}>{String(v)}</span> },
    { key:'status',  label:'Status',     render:(v)=><StatusBadge value={String(v)} /> },
    { key:'created', label:'Created' },
  ];

  // ── Tab 3 columns
  const methodColumns: Column[] = [
    { key:'name',     label:'Method Name', render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'type',     label:'Type',        render:(v)=><span style={{color:textMuted}}>{String(v)}</span> },
    { key:'provider', label:'Provider' },
    { key:'status',   label:'Status',  render:(v)=><StatusBadge value={String(v)} /> },
    { key:'enabled',  label:'Enabled', render:(v)=><StatusBadge value={String(v)} /> },
  ];

  // ── Tabs config
  const tabs: { id:Tab; label:string; icon:React.ComponentType<{size?:number}> }[] = [
    { id:'transactions', label:'Wallet Transactions', icon:TrendingUp },
    { id:'links',        label:'Payment Links',        icon:Link2 },
    { id:'methods',      label:'Checkout Methods',     icon:CreditCard },
  ];

  return (
    <div>
      <PageHeader title="Wallet & Payments" subtitle="Manage transactions, payment links and checkout methods" icon={Wallet} />

      {/* Stats cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'24px'}} className="sg">
        {[
          {label:'Total Deposits', val:'$700',    color:'#1FA89A'},
          {label:'Total Payments', val:'$3,549',  color:'#6366f1'},
          {label:'Pending',        val:'$1,000',  color:'#FFC107'},
          {label:'Total Volume',   val:'$5,294',  color:'#1FA89A'},
        ].map(s=>(
          <div key={s.label} style={{background:card,border:`1px solid ${border}`,borderRadius:'12px',padding:'16px'}}>
            <div style={{fontSize:'12px',color:textMuted,marginBottom:'6px'}}>{s.label}</div>
            <div style={{fontSize:'22px',fontWeight:800,color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{background:card,border:`1px solid ${border}`,borderRadius:'12px',overflow:'hidden'}}>
        <div style={{display:'flex',borderBottom:`1px solid ${border}`,padding:'0 8px',overflowX:'auto'}}>
          {tabs.map(tab=>{
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={()=>setActiveTab(tab.id)}
                style={{
                  display:'flex',alignItems:'center',gap:'7px',
                  padding:'13px 16px',
                  background:'transparent',border:'none',
                  borderBottom: active ? '2px solid #1FA89A' : '2px solid transparent',
                  color: active ? '#1FA89A' : textMuted,
                  fontWeight: active ? 600 : 400,
                  fontSize:'13.5px',cursor:'pointer',
                  whiteSpace:'nowrap',marginBottom:'-1px',
                  transition:'color 0.15s',
                  fontFamily:'var(--font-inter)',
                }}
              >
                <Icon size={14} />{tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{padding:'16px'}}>
          {activeTab === 'transactions' && (
            <DataTable
              columns={txColumns}
              data={txFiltered as unknown as Record<string,unknown>[]}
              searchPlaceholder="Search transactions..."
              filterNode={txFilterNode}
              onView={(row)=>setViewTx(row as unknown as Tx)}
            />
          )}
          {activeTab === 'links' && (
            <DataTable
              columns={linkColumns}
              data={mockLinks as unknown as Record<string,unknown>[]}
              searchPlaceholder="Search payment links..."
              onView={(row)=>setViewLink(row as unknown as PayLink)}
            />
          )}
          {activeTab === 'methods' && (
            <DataTable
              columns={methodColumns}
              data={mockMethods as unknown as Record<string,unknown>[]}
              searchPlaceholder="Search checkout methods..."
              onView={(row)=>setViewMethod(row as unknown as CheckMethod)}
            />
          )}
        </div>
      </div>

      {/* ── Transaction Detail Modal ── */}
      <Modal open={!!viewTx} onClose={()=>setViewTx(null)} title="Transaction Details">
        {viewTx && <>
          <FormField label="Transaction ID" value={viewTx.id}     readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="User"           value={viewTx.user}   readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <FormField label="Type"   value={viewTx.type}   readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
            <FormField label="Method" value={viewTx.method} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <FormField label="Amount" value={viewTx.amount} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
            <FormField label="Fee"    value={viewTx.fee}    readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <FormField label="Status"    value={viewTx.status} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
            <FormField label="Reference" value={viewTx.ref}    readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          </div>
          <FormField label="Date / Time" value={viewTx.date} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <button onClick={()=>setViewTx(null)} style={{width:'100%',padding:'10px',borderRadius:'9px',background:isDark?'#1E293B':'#F1F5F9',border:`1px solid ${border}`,color:textMain,fontSize:'13.5px',fontWeight:600,cursor:'pointer',fontFamily:'var(--font-inter)'}}>Close</button>
        </>}
      </Modal>

      {/* ── Payment Link Detail Modal ── */}
      <Modal open={!!viewLink} onClose={()=>setViewLink(null)} title="Payment Link Details">
        {viewLink && <>
          <FormField label="Link Name"   value={viewLink.name}    readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="URL"         value={viewLink.url}     readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Description" value={viewLink.desc}    readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <FormField label="Amount"  value={viewLink.amount}        readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
            <FormField label="Clicks"  value={String(viewLink.clicks)} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <FormField label="Status"  value={viewLink.status}  readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
            <FormField label="Created" value={viewLink.created} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          </div>
          <button onClick={()=>setViewLink(null)} style={{width:'100%',padding:'10px',borderRadius:'9px',background:isDark?'#1E293B':'#F1F5F9',border:`1px solid ${border}`,color:textMain,fontSize:'13.5px',fontWeight:600,cursor:'pointer',fontFamily:'var(--font-inter)'}}>Close</button>
        </>}
      </Modal>

      {/* ── Checkout Method Detail Modal ── */}
      <Modal open={!!viewMethod} onClose={()=>setViewMethod(null)} title="Checkout Method Details">
        {viewMethod && <>
          <FormField label="Method Name" value={viewMethod.name}     readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <FormField label="Type"     value={viewMethod.type}     readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
            <FormField label="Provider" value={viewMethod.provider} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <FormField label="Status"  value={viewMethod.status}  readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
            <FormField label="Enabled" value={viewMethod.enabled} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          </div>
          <button onClick={()=>setViewMethod(null)} style={{width:'100%',padding:'10px',borderRadius:'9px',background:isDark?'#1E293B':'#F1F5F9',border:`1px solid ${border}`,color:textMain,fontSize:'13.5px',fontWeight:600,cursor:'pointer',fontFamily:'var(--font-inter)'}}>Close</button>
        </>}
      </Modal>

      <style>{`.sg{} @media(max-width:768px){.sg{grid-template-columns:1fr 1fr!important;}}`}</style>
    </div>
  );
}

export default function WalletPaymentsPage() {
  return <AdminShell><WalletContent /></AdminShell>;
}
