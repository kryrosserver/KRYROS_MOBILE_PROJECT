'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, FormField } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { Wallet, Link2, CreditCard, TrendingUp, ChevronDown, Plus, Copy, Check, ExternalLink } from 'lucide-react';
import { getWalletTransactions, getPayments } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
type Tx = { id:string; user:string; type:string; method:string; amount:string; fee:string; date:string; status:string; ref:string };
type PayLink = { id:string; name:string; url:string; amount:string; currency:string; note:string; clicks:string; status:string; created:string };
type CheckMethod = { id:string; name:string; type:string; provider:string; status:string; enabled:string };

const FRONTEND_PAYMENT_URL = 'https://kryros-interface.onrender.com/pay';

const mockMethods: CheckMethod[] = [
  { id:'MTH001', name:'Mobile Money (543)', type:'Mobile Wallet', provider:'MTN / Airtel / Zamtel', status:'Active', enabled:'Yes' },
  { id:'MTH002', name:'Credit/Debit Card', type:'Card Payment', provider:'Stripe', status:'Inactive', enabled:'No' },
  { id:'MTH003', name:'Bank Transfer', type:'Bank', provider:'Local Banks', status:'Inactive', enabled:'No' },
  { id:'MTH004', name:'Cash on Delivery', type:'Cash', provider:'Internal', status:'Active', enabled:'Yes' },
  { id:'MTH005', name:'PayPal', type:'Digital Wallet', provider:'PayPal', status:'Inactive', enabled:'No' },
];

const STATUS_COLOR: Record<string,string> = {
  Completed:'#1FA89A', Active:'#1FA89A', Yes:'#1FA89A',
  Pending:'#FFC107', Failed:'#ef4444', Expired:'#ef4444', No:'#ef4444', Inactive:'#64748b',
};
const STATUS_BG: Record<string,string> = {
  Completed:'rgba(31,168,154,0.12)', Active:'rgba(31,168,154,0.12)', Yes:'rgba(31,168,154,0.12)',
  Pending:'rgba(255,193,7,0.12)', Failed:'rgba(185,28,28,0.12)', Expired:'rgba(185,28,28,0.12)', No:'rgba(185,28,28,0.12)', Inactive:'rgba(100,116,139,0.12)',
};

function StatusBadge({ value }: { value: string }) {
  return <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'11.5px', fontWeight:600, background:STATUS_BG[value]??'rgba(100,116,139,0.12)', color:STATUS_COLOR[value]??'#64748b' }}>{value}</span>;
}

function FilterSelect({ value, onChange, options, placeholder, border, textMuted, surface, textMain }: {
  value:string; onChange:(v:string)=>void; options:string[]; placeholder:string; border:string; textMuted:string; surface:string; textMain:string;
}) {
  return (
    <div style={{ position:'relative', display:'inline-flex', alignItems:'center' }}>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ appearance:'none', background:surface, border:`1px solid ${border}`, borderRadius:'9px', padding:'0 32px 0 12px', height:'36px', color:value?textMain:textMuted, fontSize:'13px', cursor:'pointer', outline:'none', fontFamily:'var(--font-inter)' }}>
        <option value="">{placeholder}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} color={textMuted} style={{ position:'absolute', right:'10px', pointerEvents:'none' }} />
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={()=>{ navigator.clipboard?.writeText(text).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
      style={{ display:'flex', alignItems:'center', gap:'4px', padding:'5px 10px', background:'rgba(31,168,154,0.1)', border:'1px solid rgba(31,168,154,0.3)', borderRadius:'7px', cursor:'pointer', color:'#1FA89A', fontSize:'12px', fontWeight:600, fontFamily:'var(--font-inter)' }}>
      {copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function WalletContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card    = isDark ? '#0D1523' : '#FFFFFF';
  const border  = isDark ? '#1E293B' : '#E2E8F0';
  const textMain  = isDark ? '#FFFFFF'  : '#0F172A';
  const textMuted = isDark ? '#8E9AAF'  : '#64748B';
  const surface   = isDark ? '#101826'  : '#F1F5F9';

  type Tab = 'transactions' | 'links' | 'methods';
  const [activeTab, setActiveTab] = useState<Tab>('transactions');
  const [txData, setTxData] = useState<Tx[]>([]);
  const [payLinks, setPayLinks] = useState<PayLink[]>([]);
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [viewTx, setViewTx] = useState<Tx|null>(null);
  const [viewLink, setViewLink] = useState<PayLink|null>(null);
  const [viewMethod, setViewMethod] = useState<CheckMethod|null>(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm] = useState({ name:'', amount:'', currency:'ZMW', note:'' });
  const [genLoading, setGenLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string|null>(null);

  const inputStyle = { width:'100%', background:surface, border:`1px solid ${border}`, borderRadius:'9px', color:textMain, fontSize:'13.5px', fontFamily:'var(--font-inter)', outline:'none', padding:'10px 14px' };

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
          method: p.provider || p.method || 'Mobile Money',
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

  const handleGenerateLink = () => {
    if (!genForm.amount || isNaN(Number(genForm.amount)) || Number(genForm.amount) <= 0) {
      toast.error('Please enter a valid amount'); return;
    }
    setGenLoading(true);
    const ref = 'KRYROS-' + Date.now().toString(36).toUpperCase().slice(-8);
    const params = new URLSearchParams({
      amount: genForm.amount,
      currency: genForm.currency,
      ref,
      ...(genForm.note ? { note: genForm.note } : {}),
    });
    const link = `${FRONTEND_PAYMENT_URL}?${params.toString()}`;
    setGeneratedLink(link);
    const newLink: PayLink = {
      id: ref,
      name: genForm.name || `Payment - K${Number(genForm.amount).toLocaleString()} ${genForm.currency}`,
      url: link,
      amount: `K${Number(genForm.amount).toLocaleString()} ${genForm.currency}`,
      currency: genForm.currency,
      note: genForm.note,
      clicks: '0',
      status: 'Active',
      created: new Date().toISOString().split('T')[0],
    };
    setPayLinks(d => [newLink, ...d]);
    toast.success('Payment link generated!');
    setGenLoading(false);
  };

  // ── Tx columns
  const txColumns: Column[] = [
    { key:'id', label:'Transaction', width:'110px',
      render:(v)=><code style={{fontSize:'11px',color:'#1FA89A',background:'rgba(31,168,154,0.1)',padding:'2px 7px',borderRadius:'4px'}}>{String(v)}</code> },
    { key:'user',   label:'User',   render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'amount', label:'Amount', render:(v)=><span style={{fontWeight:800,color:textMain,fontSize:'14px'}}>{String(v)}</span> },
    { key:'fee',    label:'Fee',    render:(v)=><span style={{color:textMuted}}>{String(v)}</span> },
    { key:'method', label:'Method' },
    { key:'status', label:'Status', render:(v)=><StatusBadge value={String(v)} /> },
    { key:'date',   label:'Date' },
  ];
  const txFiltered = txData.filter(r => (!methodFilter || r.method === methodFilter) && (!statusFilter || r.status === statusFilter));
  const txFilterNode = (
    <>
      <FilterSelect value={methodFilter} onChange={setMethodFilter} options={['Mobile Money','Credit Card','Bank Transfer','Cash']} placeholder="All Methods" border={border} textMuted={textMuted} surface={surface} textMain={textMain} />
      <FilterSelect value={statusFilter} onChange={setStatusFilter} options={['Completed','Pending','Failed']} placeholder="All Status" border={border} textMuted={textMuted} surface={surface} textMain={textMain} />
    </>
  );

  // ── Link columns
  const linkColumns: Column[] = [
    { key:'name',    label:'Name',    render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'amount',  label:'Amount',  render:(v)=><span style={{fontWeight:800,color:textMain}}>{String(v)}</span> },
    { key:'clicks',  label:'Clicks',  render:(v)=><span style={{color:textMuted,fontWeight:600}}>{String(v)}</span> },
    { key:'status',  label:'Status',  render:(v)=><StatusBadge value={String(v)} /> },
    { key:'created', label:'Created' },
    { key:'url', label:'Link', render:(v)=>(
      <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
        <CopyButton text={String(v)} />
        <a href={String(v)} target="_blank" rel="noreferrer" style={{color:'#1FA89A',display:'flex',alignItems:'center'}}><ExternalLink size={13} /></a>
      </div>
    )},
  ];

  // ── Method columns
  const methodColumns: Column[] = [
    { key:'name',     label:'Method Name', render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'type',     label:'Type',        render:(v)=><span style={{color:textMuted}}>{String(v)}</span> },
    { key:'provider', label:'Provider' },
    { key:'status',   label:'Status',  render:(v)=><StatusBadge value={String(v)} /> },
    { key:'enabled',  label:'Enabled', render:(v)=><StatusBadge value={String(v)} /> },
  ];

  const tabs: { id:Tab; label:string; icon:React.ComponentType<{size?:number}> }[] = [
    { id:'transactions', label:'Wallet Transactions', icon:TrendingUp },
    { id:'links',        label:'Payment Links',        icon:Link2 },
    { id:'methods',      label:'Checkout Methods',     icon:CreditCard },
  ];

  const totalDeposits = txData.filter(t=>t.type==='Deposit').reduce((a,t)=>a+parseInt(t.amount.replace(/[^0-9]/g,'')||'0'),0);
  const totalPayments = txData.filter(t=>t.type==='Payment').reduce((a,t)=>a+parseInt(t.amount.replace(/[^0-9]/g,'')||'0'),0);
  const totalPending = txData.filter(t=>t.status==='Pending').reduce((a,t)=>a+parseInt(t.amount.replace(/[^0-9]/g,'')||'0'),0);

  return (
    <div>
      <PageHeader title="Wallet & Payments" subtitle="Manage transactions, payment links and checkout methods" icon={Wallet} />

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'24px'}} className="sg">
        {[
          {label:'Total Deposits', val:`K${totalDeposits.toLocaleString()}`, color:'#1FA89A'},
          {label:'Total Payments', val:`K${totalPayments.toLocaleString()}`, color:'#6366f1'},
          {label:'Pending',        val:`K${totalPending.toLocaleString()}`, color:'#FFC107'},
          {label:'Payment Links',  val:String(payLinks.length), color:'#1FA89A'},
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
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'13px 16px', background:'transparent', border:'none', borderBottom:active?'2px solid #1FA89A':'2px solid transparent', color:active?'#1FA89A':textMuted, fontWeight:active?600:400, fontSize:'13.5px', cursor:'pointer', whiteSpace:'nowrap', marginBottom:'-1px', transition:'color 0.15s', fontFamily:'var(--font-inter)' }}>
                <Icon size={14} />{tab.label}
              </button>
            );
          })}
        </div>

        <div style={{padding:'16px'}}>
          {activeTab === 'transactions' && (
            <DataTable columns={txColumns} data={txFiltered as unknown as Record<string,unknown>[]} searchPlaceholder="Search transactions..." filterNode={txFilterNode} onView={(row)=>setViewTx(row as unknown as Tx)} />
          )}
          {activeTab === 'links' && (
            <>
              <div style={{marginBottom:'12px',display:'flex',justifyContent:'flex-end'}}>
                <button onClick={()=>{setShowGenModal(true);setGeneratedLink(null);setGenForm({name:'',amount:'',currency:'ZMW',note:''}); }}
                  style={{display:'flex',alignItems:'center',gap:'6px',padding:'9px 16px',background:'linear-gradient(135deg,#1FA89A,#27B9AF)',border:'none',borderRadius:'9px',color:'white',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'var(--font-inter)'}}>
                  <Plus size={14} /> Generate Payment Link
                </button>
              </div>
              {payLinks.length === 0 ? (
                <div style={{padding:'48px',textAlign:'center',color:textMuted}}>
                  <Link2 size={36} color={textMuted} style={{margin:'0 auto 14px',display:'block'}} />
                  <div style={{fontSize:'14px',fontWeight:700,color:textMain,marginBottom:'6px'}}>No payment links yet</div>
                  <div style={{fontSize:'13px'}}>Click "Generate Payment Link" to create your first shareable payment link</div>
                </div>
              ) : (
                <DataTable columns={linkColumns} data={payLinks as unknown as Record<string,unknown>[]} searchPlaceholder="Search links..." onView={(row)=>setViewLink(row as unknown as PayLink)} />
              )}
            </>
          )}
          {activeTab === 'methods' && (
            <DataTable columns={methodColumns} data={mockMethods as unknown as Record<string,unknown>[]} searchPlaceholder="Search methods..." onView={(row)=>setViewMethod(row as unknown as CheckMethod)} />
          )}
        </div>
      </div>

      {/* ── Transaction Detail Modal ── */}
      <Modal open={!!viewTx} onClose={()=>setViewTx(null)} title="Transaction Details">
        {viewTx && <>
          <FormField label="Transaction ID" value={viewTx.id}   readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="User"           value={viewTx.user} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
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
          <FormField label="Date" value={viewTx.date} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <button onClick={()=>setViewTx(null)} style={{width:'100%',padding:'10px',borderRadius:'9px',background:isDark?'#1E293B':'#F1F5F9',border:`1px solid ${border}`,color:textMain,fontSize:'13.5px',fontWeight:600,cursor:'pointer',fontFamily:'var(--font-inter)'}}>Close</button>
        </>}
      </Modal>

      {/* ── Generate Payment Link Modal ── */}
      <Modal open={showGenModal} onClose={()=>setShowGenModal(false)} title="Generate Payment Link">
        <div style={{fontSize:'12.5px',color:textMuted,marginBottom:'14px',padding:'10px 12px',background:'rgba(31,168,154,0.07)',border:'1px solid rgba(31,168,154,0.2)',borderRadius:'8px'}}>
          Uses <strong style={{color:'#1FA89A'}}>Mobile Money (543/cGrate)</strong> — currently active. Customer opens link, enters their number, and pays. Receipt is auto-generated on success.
        </div>
        <FormField label="Link Name / Description" value={genForm.name} onChange={v=>setGenForm(f=>({...f,name:v}))} placeholder="e.g. Order #1042 Payment" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'10px'}}>
          <FormField label="Amount *" value={genForm.amount} onChange={v=>setGenForm(f=>({...f,amount:v}))} placeholder="e.g. 500" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} type="number" />
          <div>
            <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Currency</label>
            <select value={genForm.currency} onChange={e=>setGenForm(f=>({...f,currency:e.target.value}))} style={{...inputStyle,cursor:'pointer'}}>
              <option>ZMW</option><option>USD</option>
            </select>
          </div>
        </div>
        <FormField label="Note / Reference (optional)" value={genForm.note} onChange={v=>setGenForm(f=>({...f,note:v}))} placeholder="e.g. Invoice #1042, service description..." isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />

        {generatedLink ? (
          <div style={{padding:'14px',background:isDark?'rgba(31,168,154,0.08)':'rgba(31,168,154,0.05)',border:'1px solid rgba(31,168,154,0.25)',borderRadius:'10px'}}>
            <div style={{fontSize:'12px',fontWeight:700,color:'#1FA89A',marginBottom:'8px'}}>✓ Payment link generated!</div>
            <div style={{fontSize:'11.5px',color:textMuted,wordBreak:'break-all',padding:'8px',background:surface,borderRadius:'7px',marginBottom:'10px'}}>{generatedLink}</div>
            <div style={{display:'flex',gap:'8px'}}>
              <CopyButton text={generatedLink} />
              <a href={generatedLink} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'7px',color:'#6366f1',fontSize:'12px',fontWeight:600,textDecoration:'none'}}>
                <ExternalLink size={12} /> Test
              </a>
            </div>
          </div>
        ) : (
          <button onClick={handleGenerateLink} disabled={genLoading} style={{width:'100%',padding:'11px',background:genLoading?'rgba(31,168,154,0.5)':'linear-gradient(135deg,#1FA89A,#27B9AF)',border:'none',borderRadius:'9px',color:'white',fontSize:'13.5px',fontWeight:600,cursor:genLoading?'not-allowed':'pointer',fontFamily:'var(--font-inter)',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
            <Link2 size={14} /> {genLoading ? 'Generating...' : 'Generate Link'}
          </button>
        )}
        <button onClick={()=>setShowGenModal(false)} style={{width:'100%',padding:'10px',borderRadius:'9px',background:isDark?'#1E293B':'#F1F5F9',border:`1px solid ${border}`,color:textMuted,fontSize:'13.5px',cursor:'pointer',fontFamily:'var(--font-inter)'}}>
          {generatedLink ? 'Done' : 'Cancel'}
        </button>
      </Modal>

      {/* ── Payment Link Detail Modal ── */}
      <Modal open={!!viewLink} onClose={()=>setViewLink(null)} title="Payment Link Details">
        {viewLink && <>
          <FormField label="Link Name" value={viewLink.name} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <div style={{padding:'10px 12px',background:surface,borderRadius:'9px',border:`1px solid ${border}`,marginBottom:'4px'}}>
            <div style={{fontSize:'11.5px',color:textMuted,marginBottom:'6px',fontWeight:600}}>Payment URL</div>
            <div style={{fontSize:'11px',color:'#1FA89A',wordBreak:'break-all',marginBottom:'8px'}}>{viewLink.url}</div>
            <div style={{display:'flex',gap:'8px'}}>
              <CopyButton text={viewLink.url} />
              <a href={viewLink.url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',color:'#6366f1',fontWeight:600,textDecoration:'none'}}><ExternalLink size={12}/> Open</a>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <FormField label="Amount"  value={viewLink.amount}        readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
            <FormField label="Clicks"  value={String(viewLink.clicks)} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          </div>
          {viewLink.note && <FormField label="Note" value={viewLink.note} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />}
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
