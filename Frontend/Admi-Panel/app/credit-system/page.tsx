'use client';
import { useState } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, ConfirmDialog, FormField, ModalFooter } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────
type Credit = { id:string; user:string; email:string; balance:number; earned:number; spent:number; status:string; lastActivity:string };
type Application = { id:string; user:string; email:string; product:string; plan:string; amount:string; status:string; date:string };
type Plan = { id:string; name:string; months:number; interest:string; minAmount:string; maxAmount:string; status:string };
type InstProduct = { id:string; name:string; sku:string; price:string; plans:string; status:string };

// ─── Initial Data ─────────────────────────────────────────
const INIT_CREDITS: Credit[] = [
  { id:'CRD001', user:'Bwalya Chileshe', email:'bwalya@example.com', balance:1500, earned:2000, spent:500, status:'Active', lastActivity:'2025-05-26' },
  { id:'CRD002', user:'Mulenga Schone', email:'mulenga@example.com', balance:750, earned:900, spent:150, status:'Active', lastActivity:'2025-05-25' },
  { id:'CRD003', user:'Chansa Mumba', email:'chansa@example.com', balance:3200, earned:4000, spent:800, status:'Active', lastActivity:'2025-05-24' },
  { id:'CRD004', user:'John Banda', email:'john@example.com', balance:0, earned:100, spent:100, status:'Inactive', lastActivity:'2025-04-10' },
  { id:'CRD005', user:'Mary Phiri', email:'mary@example.com', balance:450, earned:500, spent:50, status:'Active', lastActivity:'2025-05-20' },
];
const INIT_APPLICATIONS: Application[] = [
  { id:'APP001', user:'Bwalya Chileshe', email:'bwalya@example.com', product:'iPhone 15 Pro Max', plan:'Pay in 3', amount:'$1,099', status:'Approved', date:'2025-05-26' },
  { id:'APP002', user:'Mulenga Schone', email:'mulenga@example.com', product:'MacBook Air M2', plan:'Pay in 12', amount:'$1,249', status:'Pending', date:'2025-05-25' },
  { id:'APP003', user:'Chansa Mumba', email:'chansa@example.com', product:'Samsung Galaxy S24', plan:'Pay in 6', amount:'$1,199', status:'Approved', date:'2025-05-24' },
  { id:'APP004', user:'John Banda', email:'john@example.com', product:'iPad Pro 13"', plan:'Pay in 3', amount:'$1,299', status:'Rejected', date:'2025-05-20' },
  { id:'APP005', user:'Mary Phiri', email:'mary@example.com', product:'Apple Watch Series 9', plan:'Pay in 6', amount:'$399', status:'Pending', date:'2025-05-18' },
];
const INIT_PLANS: Plan[] = [
  { id:'PLN001', name:'Pay in 3', months:3, interest:'0%', minAmount:'$100', maxAmount:'$500', status:'Active' },
  { id:'PLN002', name:'Pay in 6', months:6, interest:'2.5%', minAmount:'$200', maxAmount:'$1,500', status:'Active' },
  { id:'PLN003', name:'Pay in 12', months:12, interest:'5%', minAmount:'$500', maxAmount:'$5,000', status:'Active' },
  { id:'PLN004', name:'Pay in 24', months:24, interest:'8%', minAmount:'$1,000', maxAmount:'$10,000', status:'Inactive' },
];
const INIT_INST_PRODUCTS: InstProduct[] = [
  { id:'PRD001', name:'iPhone 15 Pro Max', sku:'APL-IP15PM', price:'$1,099', plans:'Pay in 3, Pay in 6, Pay in 12', status:'Active' },
  { id:'PRD002', name:'MacBook Air M2', sku:'APL-MBA-M2', price:'$1,249', plans:'Pay in 6, Pay in 12', status:'Active' },
  { id:'PRD003', name:'Samsung Galaxy S24 Ultra', sku:'SAM-GS24U', price:'$1,199', plans:'Pay in 3, Pay in 6, Pay in 12', status:'Active' },
  { id:'PRD004', name:'iPad Pro 13"', sku:'APL-IPP13', price:'$1,299', plans:'Pay in 12', status:'Active' },
];

const APP_STATUSES = ['Pending', 'Approved', 'Rejected'];
const PLAN_STATUSES = ['Active', 'Inactive'];

function CreditContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';

  type Tab = 'applications' | 'plans' | 'products' | 'accounts';
  const [activeTab, setActiveTab] = useState<Tab>('applications');

  // Credit Accounts state
  const [credits, setCredits] = useState<Credit[]>(INIT_CREDITS);
  const [viewCredit, setViewCredit] = useState<Credit|null>(null);
  const [editCredit, setEditCredit] = useState<Credit|null>(null);
  const [creditForm, setCreditForm] = useState({ balance:'', status:'Active' });

  // Applications state
  const [applications, setApplications] = useState<Application[]>(INIT_APPLICATIONS);
  const [viewApp, setViewApp] = useState<Application|null>(null);
  const [editApp, setEditApp] = useState<Application|null>(null);
  const [appStatus, setAppStatus] = useState('Pending');

  // Plans state
  const [plans, setPlans] = useState<Plan[]>(INIT_PLANS);
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan|null>(null);
  const [deletePlan, setDeletePlan] = useState<Plan|null>(null);
  const [planForm, setPlanForm] = useState({ name:'', months:'3', interest:'0%', minAmount:'', maxAmount:'', status:'Active' });

  // Installment Products state
  const [instProducts] = useState<InstProduct[]>(INIT_INST_PRODUCTS);

  // ── Handlers ──
  const handleEditCredit = () => {
    if (!editCredit) return;
    setCredits(d => d.map(c => c.id===editCredit.id ? {...c, balance:Number(creditForm.balance), status:creditForm.status} : c));
    toast.success('Credit account updated'); setEditCredit(null);
  };
  const handleEditApp = () => {
    if (!editApp) return;
    setApplications(d => d.map(a => a.id===editApp.id ? {...a, status:appStatus} : a));
    toast.success('Application updated'); setEditApp(null);
  };
  const handleAddPlan = () => {
    if (!planForm.name.trim()) { toast.error('Plan name required'); return; }
    const p: Plan = { id:`PLN${String(Date.now()).slice(-3)}`, ...planForm, months:Number(planForm.months) };
    setPlans(d => [...d, p]); toast.success('Plan added'); setAddPlanOpen(false);
  };
  const handleEditPlan = () => {
    if (!editPlan) return;
    setPlans(d => d.map(p => p.id===editPlan.id ? {...p, ...planForm, months:Number(planForm.months)} : p));
    toast.success('Plan updated'); setEditPlan(null);
  };
  const handleDeletePlan = () => {
    if (!deletePlan) return;
    setPlans(d => d.filter(p => p.id!==deletePlan.id));
    toast.success('Plan deleted'); setDeletePlan(null);
  };

  // ── Status badge helpers ──
  const appBadge = (s: string) => {
    const m: Record<string,{bg:string;color:string}> = {
      Approved:{bg:'rgba(31,168,154,0.12)',color:'#1FA89A'},
      Pending:{bg:'rgba(255,193,7,0.12)',color:'#FFC107'},
      Rejected:{bg:'rgba(239,68,68,0.12)',color:'#ef4444'},
    };
    const c = m[s] || m.Pending;
    return <span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:600,background:c.bg,color:c.color}}>{s}</span>;
  };
  const statusBadge = (s: string) => {
    const active = s === 'Active';
    return <span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:600,background:active?'rgba(31,168,154,0.12)':'rgba(100,116,139,0.1)',color:active?'#1FA89A':'#8E9AAF'}}>{s}</span>;
  };

  // ── Tab bar ──
  const TABS: { key: Tab; label: string; count: number }[] = [
    { key:'applications', label:'Applications', count:applications.length },
    { key:'plans', label:'Manage Plans', count:plans.length },
    { key:'products', label:'Installment Products', count:instProducts.length },
    { key:'accounts', label:'Credit Accounts', count:credits.length },
  ];

  // ── Columns ──
  const appCols: Column[] = [
    { key:'id', label:'ID', width:'90px' },
    { key:'user', label:'User', render:(v,row)=>(
      <div><div style={{fontWeight:600,color:textMain}}>{String(v)}</div><div style={{fontSize:'11.5px',color:textMuted}}>{String(row.email)}</div></div>
    )},
    { key:'product', label:'Product', render:(v)=><span style={{fontWeight:500,color:textMain}}>{String(v)}</span> },
    { key:'plan', label:'Plan', render:(v)=><span style={{fontSize:'12px',color:'#6366f1',background:'rgba(99,102,241,0.1)',padding:'2px 8px',borderRadius:'8px',fontWeight:600}}>{String(v)}</span> },
    { key:'amount', label:'Amount', render:(v)=><span style={{fontWeight:700,color:textMain}}>{String(v)}</span> },
    { key:'status', label:'Status', render:(v)=>appBadge(String(v)) },
  ];
  const planCols: Column[] = [
    { key:'id', label:'ID', width:'90px' },
    { key:'name', label:'Plan Name', render:(v)=><span style={{fontWeight:700,color:textMain}}>{String(v)}</span> },
    { key:'months', label:'Duration', render:(v)=><span style={{color:'#6366f1',fontWeight:600}}>{String(v)} months</span> },
    { key:'interest', label:'Interest Rate', render:(v)=><span style={{fontWeight:600,color:v==='0%'?'#1FA89A':'#FFC107'}}>{String(v)}</span> },
    { key:'minAmount', label:'Min Amount' },
    { key:'maxAmount', label:'Max Amount' },
    { key:'status', label:'Status', render:(v)=>statusBadge(String(v)) },
  ];
  const instProdCols: Column[] = [
    { key:'id', label:'ID', width:'90px' },
    { key:'name', label:'Product', render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'sku', label:'SKU', render:(v)=><code style={{fontSize:'12px',color:'#1FA89A',background:'rgba(31,168,154,0.1)',padding:'2px 6px',borderRadius:'4px'}}>{String(v)}</code> },
    { key:'price', label:'Price', render:(v)=><span style={{fontWeight:700,color:textMain}}>{String(v)}</span> },
    { key:'plans', label:'Available Plans', render:(v)=><span style={{fontSize:'12px',color:textMuted}}>{String(v)}</span> },
    { key:'status', label:'Status', render:(v)=>statusBadge(String(v)) },
  ];
  const creditCols: Column[] = [
    { key:'id', label:'ID', width:'90px' },
    { key:'user', label:'User', render:(v,row)=>(
      <div><div style={{fontWeight:600,color:textMain,fontSize:'13.5px'}}>{String(v)}</div><div style={{fontSize:'11.5px',color:textMuted}}>{String(row.email)}</div></div>
    )},
    { key:'balance', label:'Balance', render:(v)=><span style={{fontWeight:800,fontSize:'14px',color:'#1FA89A'}}>{Number(v).toLocaleString()} pts</span> },
    { key:'earned', label:'Total Earned', render:(v)=><span style={{color:'#6366f1',fontWeight:600}}>{Number(v).toLocaleString()} pts</span> },
    { key:'spent', label:'Spent', render:(v)=><span style={{color:'#FFC107',fontWeight:600}}>{Number(v).toLocaleString()} pts</span> },
    { key:'lastActivity', label:'Last Activity' },
    { key:'status', label:'Status', render:(v)=>statusBadge(String(v)) },
  ];

  const planFormFields = (
    <>
      <FormField label="Plan Name *" value={planForm.name} onChange={v=>setPlanForm(f=>({...f,name:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder='e.g. Pay in 3' />
      <FormField label="Duration (months)" value={planForm.months} onChange={v=>setPlanForm(f=>({...f,months:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder='3' />
      <FormField label="Interest Rate" value={planForm.interest} onChange={v=>setPlanForm(f=>({...f,interest:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder='e.g. 0% or 2.5%' />
      <FormField label="Minimum Amount" value={planForm.minAmount} onChange={v=>setPlanForm(f=>({...f,minAmount:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder='e.g. $100' />
      <FormField label="Maximum Amount" value={planForm.maxAmount} onChange={v=>setPlanForm(f=>({...f,maxAmount:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder='e.g. $5,000' />
      <FormField label="Status" value={planForm.status} onChange={v=>setPlanForm(f=>({...f,status:v}))} options={PLAN_STATUSES} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
    </>
  );

  return (
    <div>
      <PageHeader
        title="Credit System"
        subtitle="Manage installment applications, plans and credit accounts"
        icon={CreditCard}
        onAdd={activeTab === 'plans' ? () => { setPlanForm({name:'',months:'3',interest:'0%',minAmount:'',maxAmount:'',status:'Active'}); setAddPlanOpen(true); } : undefined}
        addLabel="Add Plan"
      />

      {/* ── Summary stats ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'20px'}} className="cg">
        {[
          {label:'Total Applications', val:String(applications.length), color:'#6366f1'},
          {label:'Approved', val:String(applications.filter(a=>a.status==='Approved').length), color:'#1FA89A'},
          {label:'Pending', val:String(applications.filter(a=>a.status==='Pending').length), color:'#FFC107'},
          {label:'Credit Accounts', val:String(credits.length), color:'#1FA89A'},
        ].map(s=>(
          <div key={s.label} style={{background:card,border:`1px solid ${border}`,borderRadius:'12px',padding:'14px'}}>
            <div style={{fontSize:'12px',color:textMuted,marginBottom:'4px'}}>{s.label}</div>
            <div style={{fontSize:'22px',fontWeight:800,color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div style={{display:'flex',gap:'4px',marginBottom:'20px',background:surface,padding:'4px',borderRadius:'10px',border:`1px solid ${border}`,overflowX:'auto'}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{
            flex:'1 0 auto', padding:'8px 14px', borderRadius:'8px', border:'none', cursor:'pointer',
            background:activeTab===t.key?'#1FA89A':'transparent',
            color:activeTab===t.key?'white':textMuted,
            fontSize:'13px', fontWeight:600, fontFamily:'var(--font-inter)',
            display:'flex', alignItems:'center', gap:'6px', justifyContent:'center', whiteSpace:'nowrap',
            transition:'all 0.15s',
          }}>
            {t.label}
            <span style={{
              fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px',
              background:activeTab===t.key?'rgba(255,255,255,0.25)':'rgba(99,102,241,0.12)',
              color:activeTab===t.key?'white':'#6366f1',
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'applications' && (
        <DataTable
          columns={appCols}
          data={applications as unknown as Record<string,unknown>[]}
          searchPlaceholder="Search user or email..."
          onEdit={row=>{ const r=row as unknown as Application; setAppStatus(r.status); setEditApp(r); }}
          onView={row=>setViewApp(row as unknown as Application)}
        />
      )}

      {activeTab === 'plans' && (
        <DataTable
          columns={planCols}
          data={plans as unknown as Record<string,unknown>[]}
          searchPlaceholder="Search plans..."
          onEdit={row=>{ const r=row as unknown as Plan; setPlanForm({name:r.name,months:String(r.months),interest:r.interest,minAmount:r.minAmount,maxAmount:r.maxAmount,status:r.status}); setEditPlan(r); }}
          onDelete={row=>setDeletePlan(row as unknown as Plan)}
        />
      )}

      {activeTab === 'products' && (
        <DataTable
          columns={instProdCols}
          data={instProducts as unknown as Record<string,unknown>[]}
          searchPlaceholder="Search installment products..."
        />
      )}

      {activeTab === 'accounts' && (
        <DataTable
          columns={creditCols}
          data={credits as unknown as Record<string,unknown>[]}
          searchPlaceholder="Search users..."
          onEdit={row=>{ const r=row as unknown as Credit; setCreditForm({balance:String(r.balance),status:r.status}); setEditCredit(r); }}
          onView={row=>setViewCredit(row as unknown as Credit)}
        />
      )}

      {/* ── Modals: Applications ── */}
      {editApp && (
        <Modal open={!!editApp} onClose={()=>setEditApp(null)} title="Update Application Status">
          <FormField label="Application" value={editApp.user + ' — ' + editApp.product} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Plan" value={editApp.plan} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Amount" value={editApp.amount} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Status" value={appStatus} onChange={setAppStatus} options={APP_STATUSES} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <ModalFooter onClose={()=>setEditApp(null)} onSubmit={handleEditApp} loading={false} submitLabel="Update Status" isDark={isDark} border={border} textMain={textMain} />
        </Modal>
      )}
      {viewApp && (
        <Modal open={!!viewApp} onClose={()=>setViewApp(null)} title="Application Details">
          <FormField label="User" value={viewApp.user} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Email" value={viewApp.email} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Product" value={viewApp.product} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Plan" value={viewApp.plan} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Amount" value={viewApp.amount} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Status" value={viewApp.status} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Date" value={viewApp.date} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <button onClick={()=>setViewApp(null)} style={{width:'100%',padding:'10px',borderRadius:'9px',background:isDark?'#1E293B':'#F1F5F9',border:`1px solid ${border}`,color:textMain,fontSize:'13.5px',fontWeight:600,cursor:'pointer',fontFamily:'var(--font-inter)'}}>Close</button>
        </Modal>
      )}

      {/* ── Modals: Plans ── */}
      <Modal open={addPlanOpen} onClose={()=>setAddPlanOpen(false)} title="Add New Plan">
        {planFormFields}
        <ModalFooter onClose={()=>setAddPlanOpen(false)} onSubmit={handleAddPlan} loading={false} submitLabel="Add Plan" isDark={isDark} border={border} textMain={textMain} />
      </Modal>
      {editPlan && (
        <Modal open={!!editPlan} onClose={()=>setEditPlan(null)} title={`Edit Plan: ${editPlan.name}`}>
          {planFormFields}
          <ModalFooter onClose={()=>setEditPlan(null)} onSubmit={handleEditPlan} loading={false} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} />
        </Modal>
      )}
      <ConfirmDialog open={!!deletePlan} onClose={()=>setDeletePlan(null)} onConfirm={handleDeletePlan} loading={false} title="Delete Plan" message={`Delete "${deletePlan?.name}" permanently?`} />

      {/* ── Modals: Credit Accounts ── */}
      {editCredit && (
        <Modal open={!!editCredit} onClose={()=>setEditCredit(null)} title="Edit Credit Account">
          <FormField label="User" value={editCredit.user} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Balance (pts)" value={creditForm.balance} onChange={v=>setCreditForm(f=>({...f,balance:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="0" />
          <FormField label="Status" value={creditForm.status} onChange={v=>setCreditForm(f=>({...f,status:v}))} options={['Active','Inactive']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <ModalFooter onClose={()=>setEditCredit(null)} onSubmit={handleEditCredit} loading={false} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} />
        </Modal>
      )}
      {viewCredit && (
        <Modal open={!!viewCredit} onClose={()=>setViewCredit(null)} title="Credit Account Details">
          <FormField label="User" value={viewCredit.user} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Email" value={viewCredit.email} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Balance" value={viewCredit.balance.toLocaleString() + ' pts'} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Total Earned" value={viewCredit.earned.toLocaleString() + ' pts'} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Total Spent" value={viewCredit.spent.toLocaleString() + ' pts'} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Status" value={viewCredit.status} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <button onClick={()=>setViewCredit(null)} style={{width:'100%',padding:'10px',borderRadius:'9px',background:isDark?'#1E293B':'#F1F5F9',border:`1px solid ${border}`,color:textMain,fontSize:'13.5px',fontWeight:600,cursor:'pointer',fontFamily:'var(--font-inter)'}}>Close</button>
        </Modal>
      )}

      <style>{`.cg{} @media(max-width:768px){.cg{grid-template-columns:repeat(2,1fr)!important;}}`}</style>
    </div>
  );
}

export default function CreditSystemPage() { return <AdminShell><CreditContent /></AdminShell>; }
