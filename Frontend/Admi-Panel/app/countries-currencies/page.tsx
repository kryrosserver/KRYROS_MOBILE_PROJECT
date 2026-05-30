'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, FormField, ModalFooter } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCountries, updateCountry } from '@/lib/api';

type Country = { id:string; name:string; code:string; currency:string; symbol:string; rate:number; status:string; shipping:boolean };
type Currency = { code:string; name:string; symbol:string; rate:number; status:string };

function CountriesContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';
  const [tab, setTab] = useState<'countries'|'currencies'>('countries');
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [editCountry, setEditCountry] = useState<Country|null>(null);
  const [editCurrency, setEditCurrency] = useState<Currency|null>(null);
  const [cForm, setCForm] = useState({ rate:'', shipping:'true', status:'Active' });
  const [curForm, setCurForm] = useState({ rate:'', status:'Active' });

  useEffect(() => {
    getCountries().then((r: any) => {
      const raw: any[] = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [];
      const normalized: Country[] = raw.map((c: any) => ({
        id: c.id || '',
        name: c.name || '',
        code: c.code || c.iso2 || '',
        currency: c.currency || c.currencyCode || '',
        symbol: c.currencySymbol || c.symbol || '',
        rate: Number(c.exchangeRate || c.rate || 1),
        status: c.isActive !== false ? 'Active' : 'Inactive',
        shipping: c.shippingEnabled !== false && c.shipping !== false,
      }));
      setCountries(normalized);
      // Derive unique currencies from countries
      const seen = new Set<string>();
      const currList: Currency[] = [];
      normalized.forEach(c => {
        if (c.currency && !seen.has(c.currency)) {
          seen.add(c.currency);
          currList.push({ code: c.currency, name: c.currency, symbol: c.symbol, rate: c.rate, status: c.rate === 1 ? 'Base' : 'Active' });
        }
      });
      setCurrencies(currList);
    }).catch(() => {});
  }, []);

  const openEditCountry = (row: Record<string,unknown>) => {
    const r = row as unknown as Country;
    setCForm({ rate:String(r.rate), shipping:String(r.shipping), status:r.status });
    setEditCountry(r);
  };
  const handleSaveCountry = async () => {
    if (!editCountry) return;
    setLoading(true);
    try {
      await updateCountry(editCountry.id, {
        exchangeRate: Number(cForm.rate),
        shippingEnabled: cForm.shipping === 'true',
        isActive: cForm.status === 'Active',
      });
      setCountries(d => d.map(c => c.id===editCountry.id ? {...c, rate:Number(cForm.rate), shipping:cForm.shipping==='true', status:cForm.status} : c));
      toast.success('Country updated');
      setEditCountry(null);
    } catch { toast.error('Failed to update country'); }
    setLoading(false);
  };

  const openEditCurrency = (row: Record<string,unknown>) => {
    const r = row as unknown as Currency;
    setCurForm({ rate:String(r.rate), status:r.status });
    setEditCurrency(r);
  };
  const handleSaveCurrency = () => {
    if (!editCurrency) return;
    setCurrencies(d => d.map(c => c.code===editCurrency.code ? {...c, rate:Number(curForm.rate), status:curForm.status} : c));
    toast.success('Currency rate updated');
    setEditCurrency(null);
  };

  const countryColumns: Column[] = [
    { key:'code', label:'Code', render:(v)=><span style={{fontWeight:700,color:'#1FA89A',fontSize:'13px'}}>{String(v)}</span>, width:'70px' },
    { key:'name', label:'Country', render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'currency', label:'Currency', render:(v,row)=>{ const r=row as unknown as Country; return <span style={{fontWeight:600,color:textMain}}>{String(v)} <span style={{color:textMuted,fontWeight:400}}>({r.symbol})</span></span>; }},
    { key:'rate', label:'Rate (vs USD)', render:(v)=><span style={{color:'#6366f1',fontWeight:600}}>{String(v)}</span> },
    { key:'shipping', label:'Shipping', render:(v)=><span style={{padding:'2px 8px',borderRadius:'10px',fontSize:'11px',fontWeight:600,background:v?'rgba(31,168,154,0.12)':'rgba(100,116,139,0.1)',color:v?'#1FA89A':'#8E9AAF'}}>{v?'Enabled':'Disabled'}</span> },
    { key:'status', label:'Status', render:(v)=><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11.5px',fontWeight:600,background:v==='Active'?'rgba(31,168,154,0.12)':'rgba(100,116,139,0.12)',color:v==='Active'?'#1FA89A':'#8E9AAF'}}>{String(v)}</span> },
  ];
  const currencyColumns: Column[] = [
    { key:'code', label:'Code', render:(v)=><span style={{fontWeight:700,color:'#1FA89A',fontSize:'13px'}}>{String(v)}</span>, width:'80px' },
    { key:'name', label:'Currency' },
    { key:'symbol', label:'Symbol', render:(v)=><span style={{fontWeight:700,color:textMain,fontSize:'16px'}}>{String(v)}</span>, width:'70px' },
    { key:'rate', label:'Exchange Rate', render:(v)=><span style={{fontWeight:700,color:'#6366f1'}}>{String(v)}</span> },
    { key:'status', label:'Status', render:(v)=><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11.5px',fontWeight:600,background:v==='Base'?'rgba(99,102,241,0.12)':v==='Active'?'rgba(31,168,154,0.12)':'rgba(100,116,139,0.12)',color:v==='Base'?'#6366f1':v==='Active'?'#1FA89A':'#8E9AAF'}}>{String(v)}</span> },
  ];

  const tabBtnStyle = (active: boolean) => ({
    padding:'8px 20px', borderRadius:'8px', border:'none', cursor:'pointer',
    background: active ? '#1FA89A' : 'transparent',
    color: active ? 'white' : textMuted,
    fontSize:'13px', fontWeight:600, fontFamily:'var(--font-inter)', transition:'all 0.15s',
  });

  return (
    <div>
      <PageHeader title="Countries & Currencies" subtitle="Configure countries, currencies and exchange rates" icon={Globe} />
      <div style={{display:'flex',gap:'4px',marginBottom:'20px',background:surface,padding:'4px',borderRadius:'10px',border:`1px solid ${border}`,width:'fit-content'}}>
        <button style={tabBtnStyle(tab==='countries')} onClick={()=>setTab('countries')}>Countries ({countries.length})</button>
        <button style={tabBtnStyle(tab==='currencies')} onClick={()=>setTab('currencies')}>Currencies ({currencies.length})</button>
      </div>

      {tab==='countries' && (
        <DataTable columns={countryColumns} data={countries as unknown as Record<string,unknown>[]} searchPlaceholder="Search countries..." onEdit={openEditCountry} />
      )}
      {tab==='currencies' && (
        <DataTable columns={currencyColumns} data={currencies as unknown as Record<string,unknown>[]} searchPlaceholder="Search currencies..." onEdit={openEditCurrency} />
      )}

      {editCountry && (
        <Modal open={!!editCountry} onClose={()=>setEditCountry(null)} title={`Edit: ${editCountry.name}`}>
          <FormField label="Country" value={editCountry.name} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Currency" value={editCountry.currency} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Exchange Rate (vs USD)" value={cForm.rate} onChange={(v)=>setCForm(f=>({...f,rate:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. 27.5" />
          <FormField label="Shipping Enabled" value={cForm.shipping} onChange={(v)=>setCForm(f=>({...f,shipping:v}))} options={['true','false']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Status" value={cForm.status} onChange={(v)=>setCForm(f=>({...f,status:v}))} options={['Active','Inactive']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <ModalFooter onClose={()=>setEditCountry(null)} onSubmit={handleSaveCountry} loading={loading} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} />
        </Modal>
      )}
      {editCurrency && (
        <Modal open={!!editCurrency} onClose={()=>setEditCurrency(null)} title={`Edit: ${editCurrency.code}`}>
          <FormField label="Currency" value={editCurrency.name} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Exchange Rate (vs USD)" value={curForm.rate} onChange={(v)=>setCurForm(f=>({...f,rate:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. 27.5" />
          <FormField label="Status" value={curForm.status} onChange={(v)=>setCurForm(f=>({...f,status:v}))} options={['Active','Inactive','Base']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <ModalFooter onClose={()=>setEditCurrency(null)} onSubmit={handleSaveCurrency} loading={false} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} />
        </Modal>
      )}
    </div>
  );
}

export default function CountriesCurrenciesPage() { return <AdminShell><CountriesContent /></AdminShell>; }
