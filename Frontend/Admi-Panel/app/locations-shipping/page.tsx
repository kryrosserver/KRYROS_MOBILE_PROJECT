'use client';
import { useState } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, ConfirmDialog, FormField, ModalFooter } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

type Zone = { id:string; name:string; region:string; countries:string; method:string; rate:string; minOrder:string; days:string; status:string };
const INITIAL: Zone[] = [
  { id:'SZ001', name:'Lusaka City', region:'Lusaka', countries:'Zambia', method:'Express', rate:'$5.00', minOrder:'$20', days:'1-2', status:'Active' },
  { id:'SZ002', name:'Copperbelt', region:'Copperbelt', countries:'Zambia', method:'Standard', rate:'$8.00', minOrder:'$30', days:'2-3', status:'Active' },
  { id:'SZ003', name:'Southern Africa', region:'International', countries:'ZA, ZW, TZ', method:'International', rate:'$25.00', minOrder:'$100', days:'5-7', status:'Active' },
  { id:'SZ004', name:'Free Shipping', region:'All', countries:'Zambia', method:'Free', rate:'$0.00', minOrder:'$200', days:'3-5', status:'Active' },
  { id:'SZ005', name:'Rest of World', region:'International', countries:'All Others', method:'International', rate:'$45.00', minOrder:'$150', days:'10-14', status:'Inactive' },
];
const METHODS = ['Express','Standard','International','Free'];
const EMPTY = { name:'', region:'', countries:'', method:'Express', rate:'', minOrder:'', days:'', status:'Active' };

function ShippingContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';
  const [data, setData] = useState<Zone[]>(INITIAL);
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Zone|null>(null);
  const [deleteRow, setDeleteRow] = useState<Zone|null>(null);
  const [form, setForm] = useState({...EMPTY});
  const fp = (k:string) => (v:string) => setForm(f=>({...f,[k]:v}));

  const openAdd = () => { setForm({...EMPTY}); setAddOpen(true); };
  const openEdit = (row:Record<string,unknown>) => { const r=row as unknown as Zone; setForm({name:r.name,region:r.region,countries:r.countries,method:r.method,rate:r.rate,minOrder:r.minOrder,days:r.days,status:r.status}); setEditRow(r); };
  const openDelete = (row:Record<string,unknown>) => setDeleteRow(row as unknown as Zone);

  const handleAdd = () => {
    if (!form.name.trim()) { toast.error('Zone name required'); return; }
    const z: Zone = { id:`SZ${String(Date.now()).slice(-3)}`, ...form };
    setData(d=>[...d,z]); toast.success('Zone added'); setAddOpen(false);
  };
  const handleEdit = () => {
    if (!editRow) return;
    setData(d=>d.map(z=>z.id===editRow.id?{...z,...form}:z));
    toast.success('Zone updated'); setEditRow(null);
  };
  const handleDelete = () => {
    if (!deleteRow) return;
    setData(d=>d.filter(z=>z.id!==deleteRow.id));
    toast.success('Zone deleted'); setDeleteRow(null);
  };

  const methodColor = (m:string) => ({Express:'#1FA89A',Standard:'#6366f1',International:'#f59e0b',Free:'#FFC107'}[m]||'#64748b');
  const columns: Column[] = [
    { key:'id', label:'ID', width:'90px' },
    { key:'name', label:'Zone Name', render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'region', label:'Region' },
    { key:'countries', label:'Countries' },
    { key:'method', label:'Method', render:(v)=><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11.5px',fontWeight:600,background:`${methodColor(String(v))}18`,color:methodColor(String(v))}}>{String(v)}</span> },
    { key:'rate', label:'Rate', render:(v)=><span style={{fontWeight:700,color:textMain}}>{String(v)}</span> },
    { key:'minOrder', label:'Min Order' },
    { key:'days', label:'Delivery Days' },
    { key:'status', label:'Status', render:(v)=><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11.5px',fontWeight:600,background:v==='Active'?'rgba(31,168,154,0.12)':'rgba(100,116,139,0.12)',color:v==='Active'?'#1FA89A':'#64748b'}}>{String(v)}</span> },
  ];

  const modalFields = (
    <>
      <FormField label="Zone Name" value={form.name} onChange={fp('name')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. Lusaka City" />
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
        <FormField label="Region" value={form.region} onChange={fp('region')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. Lusaka" />
        <FormField label="Countries" value={form.countries} onChange={fp('countries')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. Zambia" />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
        <FormField label="Method" value={form.method} onChange={fp('method')} options={METHODS} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
        <FormField label="Status" value={form.status} onChange={fp('status')} options={['Active','Inactive']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px'}}>
        <FormField label="Rate" value={form.rate} onChange={fp('rate')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="$0.00" />
        <FormField label="Min Order" value={form.minOrder} onChange={fp('minOrder')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="$0" />
        <FormField label="Delivery Days" value={form.days} onChange={fp('days')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="1-2" />
      </div>
    </>
  );

  return (
    <div>
      <PageHeader title="Locations & Shipping" subtitle="Configure shipping zones and delivery rates" icon={MapPin} onAdd={openAdd} addLabel="Add Zone" />
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'24px'}} className="sg">
        {[{label:'Shipping Zones',val:String(data.length),color:'#1FA89A'},{label:'Active Zones',val:String(data.filter(z=>z.status==='Active').length),color:'#1FA89A'},{label:'Countries Covered',val:'7',color:'#6366f1'}].map(s=>(
          <div key={s.label} style={{background:card,border:`1px solid ${border}`,borderRadius:'12px',padding:'16px'}}>
            <div style={{fontSize:'12px',color:textMuted,marginBottom:'6px'}}>{s.label}</div>
            <div style={{fontSize:'24px',fontWeight:800,color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>
      <DataTable columns={columns} data={data as unknown as Record<string,unknown>[]} searchPlaceholder="Search zones..." onEdit={openEdit} onDelete={openDelete} />
      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Add Shipping Zone">{modalFields}<ModalFooter onClose={()=>setAddOpen(false)} onSubmit={handleAdd} loading={false} submitLabel="Add Zone" isDark={isDark} border={border} textMain={textMain} /></Modal>
      <Modal open={!!editRow} onClose={()=>setEditRow(null)} title={`Edit: ${editRow?.name??''}`}>{modalFields}<ModalFooter onClose={()=>setEditRow(null)} onSubmit={handleEdit} loading={false} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} /></Modal>
      <ConfirmDialog open={!!deleteRow} onClose={()=>setDeleteRow(null)} onConfirm={handleDelete} loading={false} title="Delete Zone" message={`Delete zone "${deleteRow?.name}"?`} />
      <style>{`.sg{} @media(max-width:768px){.sg{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
export default function LocationsShippingPage() { return <AdminShell><ShippingContent /></AdminShell>; }
