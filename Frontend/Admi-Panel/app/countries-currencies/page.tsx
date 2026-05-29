'use client';
import { useState } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, FormField, ModalFooter } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { Globe } from 'lucide-react';
import toast from 'react-hot-toast';

type Country = { id:string; name:string; code:string; currency:string; symbol:string; rate:number; status:string; shipping:boolean };
type Currency = { code:string; name:string; symbol:string; rate:number; status:string };

const INIT_COUNTRIES: Country[] = [
  { id:'C001', name:'Zambia', code:'ZM', currency:'ZMW', symbol:'K', rate:27.5, status:'Active', shipping:true },
  { id:'C002', name:'Zimbabwe', code:'ZW', currency:'USD', symbol:'$', rate:1, status:'Active', shipping:true },
  { id:'C003', name:'South Africa', code:'ZA', currency:'ZAR', symbol:'R', rate:18.2, status:'Active', shipping:true },
  { id:'C004', name:'Kenya', code:'KE', currency:'KES', symbol:'KSh', rate:130.5, status:'Active', shipping:false },
  { id:'C005', name:'Tanzania', code:'TZ', currency:'TZS', symbol:'TSh', rate:2480, status:'Active', shipping:false },
  { id:'C006', name:'United Kingdom', code:'GB', currency:'GBP', symbol:'£', rate:0.79, status:'Inactive', shipping:false },
  { id:'C007', name:'United States', code:'US', currency:'USD', symbol:'$', rate:1, status:'Active', shipping:true },
];
const INIT_CURRENCIES: Currency[] = [
  { code:'USD', name:'US Dollar', symbol:'$', rate:1, status:'Base' },
  { code:'ZMW', name:'Zambian Kwacha', symbol:'K', rate:27.5, status:'Active' },
  { code:'ZAR', name:'South African Rand', symbol:'R', rate:18.2, status:'Active' },
  { code:'KES', name:'Kenyan Shilling', symbol:'KSh', rate:130.5, status:'Active' },
  { code:'GBP', name:'British Pound', symbol:'£', rate:0.79, status:'Active' },
  { code:'EUR', name:'Euro', symbol:'€', rate:0.92, status:'Active' },
];

function CountriesContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';
  const [tab, setTab] = useState<'countries'|'currencies'>('countries');
  const [countries, setCountries] = useState<Country[]>(INIT_COUNTRIES);
  const [currencies, setCurrencies] = useState<Currency[]>(INIT_CURRENCIES);
  const [editCountry, setEditCountry] = useState<Country|null>(null);
  const [editCurrency, setEditCurrency] = useState<Currency|null>(null);
  const [cForm, setCForm] = useState({ rate:'', shipping:'true', status:'Active' });
  const [curForm, setCurForm] = useState({ rate:'', status:'Active' });

  const openEditCountry = (row: Record<string,unknown>) => {
    const r = row as unknown as Country;
    setCForm({ rate:String(r.rate), shipping:String(r.shipping), status:r.status });
    setEditCountry(r);
  };
  const handleSaveCountry = () => {
    if (!editCountry) return;
    setCountries(d => d.map(c => c.id===editCountry.id ? {...c, rate:Number(cForm.rate), shipping:cForm.shipping==='true', status:cForm.status} : c));
    toast.success('Country updated'); setEditCountry(null);
  };

  const openEditCurrency = (row: Record<string,unknown>) => {
    const r = row as unknown as Currency;
    setCurForm({ rate:String(r.rate), status:r.status });
    setEditCurrency(r);
  };
  const handleSaveCurrency = () => {
    if (!editCurrency) return;
    setCurrencies(d => d.map(c => c.code===editCurrency.code ? {...c, rate:Number(curForm.rate), status:curForm.status} : c));
    toast.success('Currency updated'); setEditCurrency(null);
  };

  const countryColumns: Column[] = [
    { key:'code', label:'Code', render:(v)=><span style={{fontWeight:700,color:'#1FA89A',fontSize:'13px'}}>{String(v)}</span>, width:'70px' },
    { key:'name', label:'Country', render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'currency', label:'Currency' },
    { key:'symbol', label:'Symbol', render:(v)=><span style={{fontWeight:700,color:textMain}}>{String(v)}</span> },
    { key:'rate', label:'Exchange Rate', render:(v)=><span style={{color:'#6366f1',fontWeight:600}}>1 USD = {String(v)}</span> },
    { key:'shipping', label:'Shipping', render:(v)=><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11.5px',fontWeight:600,background:v?'rgba(31,168,154,0.12)':'rgba(100,116,139,0.12)',color:v?'#1FA89A':'#64748b'}}>{v?'Enabled':'Disabled'}</span> },
    { key:'status', label:'Status', render:(v)=><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11.5px',fontWeight:600,background:v==='Active'?'rgba(31,168,154,0.12)':'rgba(100,116,139,0.12)',color:v==='Active'?'#1FA89A':'#64748b'}}>{String(v)}</span> },
  ];
  const currencyColumns: Column[] = [
    { key:'code', label:'Code', render:(v)=><span style={{fontWeight:700,color:'#1FA89A'}}>{String(v)}</span>, width:'80px' },
    { key:'name', label:'Currency Name', render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'symbol', label:'Symbol', render:(v)=><span style={{fontWeight:700,fontSize:'16px',color:textMain}}>{String(v)}</span> },
    { key:'rate', label:'Rate vs USD', render:(v)=><span style={{color:'#6366f1',fontWeight:600}}>1 USD = {String(v)}</span> },
    { key:'status', label:'Status', render:(v)=><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11.5px',fontWeight:600,background:v==='Base'?'rgba(99,102,241,0.12)':'rgba(31,168,154,0.12)',color:v==='Base'?'#6366f1':'#1FA89A'}}>{String(v)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Countries / Currencies" subtitle="Configure supported countries and currencies" icon={Globe} />
      <div style={{display:'flex',gap:'4px',background:isDark?'#101826':'#F1F5F9',padding:'4px',borderRadius:'10px',width:'fit-content',marginBottom:'20px'}}>
        {(['countries','currencies'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'7px 20px',borderRadius:'8px',border:'none',background:tab===t?'#1FA89A':'transparent',color:tab===t?'white':textMuted,fontSize:'13.5px',fontWeight:tab===t?600:500,cursor:'pointer',fontFamily:'var(--font-inter)',textTransform:'capitalize'}}>{t}</button>
        ))}
      </div>
      {tab==='countries' ? (
        <DataTable columns={countryColumns} data={countries as unknown as Record<string,unknown>[]} searchPlaceholder="Search countries..." onEdit={openEditCountry} />
      ) : (
        <DataTable columns={currencyColumns} data={currencies as unknown as Record<string,unknown>[]} searchPlaceholder="Search currencies..." onEdit={openEditCurrency} />
      )}

      <Modal open={!!editCountry} onClose={()=>setEditCountry(null)} title={`Edit: ${editCountry?.name??''}`}>
        <FormField label="Exchange Rate (vs USD)" value={cForm.rate} onChange={v=>setCForm(f=>({...f,rate:v}))} type="number" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
        <FormField label="Shipping" value={cForm.shipping} onChange={v=>setCForm(f=>({...f,shipping:v}))} options={['true','false']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
        <FormField label="Status" value={cForm.status} onChange={v=>setCForm(f=>({...f,status:v}))} options={['Active','Inactive']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
        <ModalFooter onClose={()=>setEditCountry(null)} onSubmit={handleSaveCountry} loading={false} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} />
      </Modal>
      <Modal open={!!editCurrency} onClose={()=>setEditCurrency(null)} title={`Edit: ${editCurrency?.name??''}`}>
        <FormField label="Exchange Rate (vs USD)" value={curForm.rate} onChange={v=>setCurForm(f=>({...f,rate:v}))} type="number" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
        <FormField label="Status" value={curForm.status} onChange={v=>setCurForm(f=>({...f,status:v}))} options={['Base','Active','Inactive']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
        <ModalFooter onClose={()=>setEditCurrency(null)} onSubmit={handleSaveCurrency} loading={false} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} />
      </Modal>
    </div>
  );
}
export default function CountriesCurrenciesPage() { return <AdminShell><CountriesContent /></AdminShell>; }
