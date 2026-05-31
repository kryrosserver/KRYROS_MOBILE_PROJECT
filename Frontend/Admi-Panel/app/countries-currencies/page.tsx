'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, FormField, ModalFooter } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { Globe, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCountries, updateCountry, createCountry } from '@/lib/api';

type Country = { id:string; name:string; code:string; currency:string; symbol:string; rate:number; status:string; shipping:boolean };
type Currency = { code:string; name:string; symbol:string; rate:number; status:string };

const EMPTY_CFORM = { name:'', code:'', currency:'', symbol:'', rate:'1', shipping:'true', status:'Active' };
const EMPTY_CURFORM = { rate:'', status:'Active' };

function CountriesContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';
  const card = isDark ? '#0D1523' : '#FFFFFF';

  const [tab, setTab] = useState<'countries'|'currencies'>('countries');
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit country
  const [editCountry, setEditCountry] = useState<Country|null>(null);
  const [cForm, setCForm] = useState({ rate:'', shipping:'true', status:'Active' });

  // Add country
  const [addCountryOpen, setAddCountryOpen] = useState(false);
  const [addCForm, setAddCForm] = useState(EMPTY_CFORM);

  // Edit currency
  const [editCurrency, setEditCurrency] = useState<Currency|null>(null);
  const [curForm, setCurForm] = useState(EMPTY_CURFORM);

  // Add currency
  const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);
  const [addCurForm, setAddCurForm] = useState({ code:'', name:'', symbol:'', rate:'1', status:'Active' });

  const inputStyle = { width:'100%', background:surface, border:`1px solid ${border}`, borderRadius:'9px', color:textMain, fontSize:'13.5px', fontFamily:'var(--font-inter)', outline:'none', padding:'10px 14px' };
  const selStyle = { ...inputStyle, cursor:'pointer' };

  const fetchCountries = () => {
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
  };

  useEffect(() => { fetchCountries(); }, []);

  // Edit handlers
  const openEditCountry = (row: Record<string,unknown>) => {
    const r = row as unknown as Country;
    setCForm({ rate:String(r.rate), shipping:String(r.shipping), status:r.status });
    setEditCountry(r);
  };
  const handleSaveCountry = async () => {
    if (!editCountry) return;
    setLoading(true);
    try {
      await updateCountry(editCountry.id, { exchangeRate: Number(cForm.rate), status: cForm.status === 'Active' });
      setCountries(d => d.map(c => c.id===editCountry.id ? {...c, rate:Number(cForm.rate), shipping:cForm.shipping==='true', status:cForm.status} : c));
      toast.success('Country updated');
      setEditCountry(null);
    } catch { toast.error('Failed to update country'); }
    setLoading(false);
  };

  // Add country handler
  const handleAddCountry = async () => {
    if (!addCForm.name.trim() || !addCForm.code.trim() || !addCForm.currency.trim()) {
      toast.error('Name, code and currency are required');
      return;
    }
    setLoading(true);
    try {
      await createCountry({
        name: addCForm.name,
        code: addCForm.code.toUpperCase(),
        currencyCode: addCForm.currency.toUpperCase(),
        currencySymbol: addCForm.symbol,
        exchangeRate: Number(addCForm.rate) || 1,
        status: addCForm.status === 'Active',
      });
      toast.success('Country added successfully');
      setAddCountryOpen(false);
      setAddCForm(EMPTY_CFORM);
      fetchCountries();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add country');
    }
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
    { key:'name', label:'Currency', render:(v)=><span style={{fontWeight:600,color:textMain}}>{String(v)}</span> },
    { key:'symbol', label:'Symbol', render:(v)=><span style={{fontWeight:600,color:textMuted}}>{String(v)}</span>, width:'80px' },
    { key:'rate', label:'Exchange Rate', render:(v)=><span style={{color:'#6366f1',fontWeight:600}}>{String(v)}</span> },
    { key:'status', label:'Status', render:(v)=><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11.5px',fontWeight:600,background:v==='Base'?'rgba(99,102,241,0.12)':v==='Active'?'rgba(31,168,154,0.12)':'rgba(100,116,139,0.12)',color:v==='Base'?'#6366f1':v==='Active'?'#1FA89A':'#8E9AAF'}}>{String(v)}</span> },
  ];

  const addBtn = (label: string, onClick: ()=>void) => (
    <button onClick={onClick} style={{
      display:'flex',alignItems:'center',gap:'6px',padding:'9px 16px',
      background:'linear-gradient(135deg,#1FA89A,#27B9AF)',border:'none',borderRadius:'9px',
      color:'white',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'var(--font-inter)',
    }}>
      <Plus size={14} /> {label}
    </button>
  );

  return (
    <div>
      <PageHeader title="Countries & Currencies" subtitle="Configure countries, currencies and exchange rates" icon={Globe} />

      {/* Tab bar */}
      <div style={{background:card,border:`1px solid ${border}`,borderRadius:'12px',padding:'6px',display:'inline-flex',gap:'4px',marginBottom:'20px'}}>
        {(['countries','currencies'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'9px 20px',borderRadius:'9px',border:'none',cursor:'pointer',
            fontSize:'13.5px',fontWeight:tab===t?700:400,
            background:tab===t?'linear-gradient(135deg,#1FA89A,#27B9AF)':'transparent',
            color:tab===t?'white':textMuted,
            fontFamily:'var(--font-inter)',transition:'all 0.15s',
          }}>
            {t==='countries'?`Countries (${countries.length})`:`Currencies (${currencies.length})`}
          </button>
        ))}
      </div>

      {/* Countries tab */}
      {tab === 'countries' && (
        <DataTable
          columns={countryColumns}
          data={countries as unknown as Record<string,unknown>[]}
          searchPlaceholder="Search countries..."
          onEdit={openEditCountry}
          actionNode={addBtn('Add Country', ()=>setAddCountryOpen(true))}
        />
      )}

      {/* Currencies tab */}
      {tab === 'currencies' && (
        <DataTable
          columns={currencyColumns}
          data={currencies as unknown as Record<string,unknown>[]}
          searchPlaceholder="Search currencies..."
          onEdit={openEditCurrency}
          actionNode={addBtn('Add Currency', ()=>setAddCurrencyOpen(true))}
        />
      )}

      {/* ── Edit Country Modal ── */}
      <Modal open={!!editCountry} onClose={()=>setEditCountry(null)} title={`Edit: ${editCountry?.name??''}`}>
        {editCountry && <>
          <FormField label="Country" value={editCountry.name} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Exchange Rate (vs USD)" value={cForm.rate} onChange={v=>setCForm(f=>({...f,rate:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} type="number" />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <div>
              <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Shipping</label>
              <select value={cForm.shipping} onChange={e=>setCForm(f=>({...f,shipping:e.target.value}))} style={selStyle}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Status</label>
              <select value={cForm.status} onChange={e=>setCForm(f=>({...f,status:e.target.value}))} style={selStyle}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>
          <ModalFooter onClose={()=>setEditCountry(null)} onSubmit={handleSaveCountry} loading={loading} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} />
        </>}
      </Modal>

      {/* ── Add Country Modal ── */}
      <Modal open={addCountryOpen} onClose={()=>setAddCountryOpen(false)} title="Add New Country">
        <FormField label="Country Name *" value={addCForm.name} onChange={v=>setAddCForm(f=>({...f,name:v}))} placeholder="e.g. South Africa" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          <FormField label="Country Code *" value={addCForm.code} onChange={v=>setAddCForm(f=>({...f,code:v.toUpperCase()}))} placeholder="e.g. ZA" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Currency Code *" value={addCForm.currency} onChange={v=>setAddCForm(f=>({...f,currency:v.toUpperCase()}))} placeholder="e.g. ZAR" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          <FormField label="Currency Symbol" value={addCForm.symbol} onChange={v=>setAddCForm(f=>({...f,symbol:v}))} placeholder="e.g. R" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Exchange Rate (vs USD)" value={addCForm.rate} onChange={v=>setAddCForm(f=>({...f,rate:v}))} placeholder="e.g. 18.5" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} type="number" />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          <div>
            <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Shipping</label>
            <select value={addCForm.shipping} onChange={e=>setAddCForm(f=>({...f,shipping:e.target.value}))} style={selStyle}>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
          <div>
            <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Status</label>
            <select value={addCForm.status} onChange={e=>setAddCForm(f=>({...f,status:e.target.value}))} style={selStyle}>
              <option>Active</option><option>Inactive</option>
            </select>
          </div>
        </div>
        <ModalFooter onClose={()=>setAddCountryOpen(false)} onSubmit={handleAddCountry} loading={loading} submitLabel="Add Country" isDark={isDark} border={border} textMain={textMain} />
      </Modal>

      {/* ── Edit Currency Modal ── */}
      <Modal open={!!editCurrency} onClose={()=>setEditCurrency(null)} title={`Edit Currency: ${editCurrency?.code??''}`}>
        {editCurrency && <>
          <FormField label="Currency" value={editCurrency.name} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Exchange Rate (vs USD)" value={curForm.rate} onChange={v=>setCurForm(f=>({...f,rate:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} type="number" />
          <div>
            <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Status</label>
            <select value={curForm.status} onChange={e=>setCurForm(f=>({...f,status:e.target.value}))} style={selStyle}>
              <option>Active</option><option>Base</option><option>Inactive</option>
            </select>
          </div>
          <ModalFooter onClose={()=>setEditCurrency(null)} onSubmit={handleSaveCurrency} loading={loading} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} />
        </>}
      </Modal>

      {/* ── Add Currency Modal ── */}
      <Modal open={addCurrencyOpen} onClose={()=>setAddCurrencyOpen(false)} title="Add New Currency">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          <FormField label="Currency Code *" value={addCurForm.code} onChange={v=>setAddCurForm(f=>({...f,code:v.toUpperCase()}))} placeholder="e.g. ZAR" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Currency Name *" value={addCurForm.name} onChange={v=>setAddCurForm(f=>({...f,name:v}))} placeholder="e.g. South African Rand" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          <FormField label="Symbol" value={addCurForm.symbol} onChange={v=>setAddCurForm(f=>({...f,symbol:v}))} placeholder="e.g. R" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Exchange Rate (vs USD)" value={addCurForm.rate} onChange={v=>setAddCurForm(f=>({...f,rate:v}))} placeholder="e.g. 18.5" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} type="number" />
        </div>
        <div>
          <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Status</label>
          <select value={addCurForm.status} onChange={e=>setAddCurForm(f=>({...f,status:e.target.value}))} style={selStyle}>
            <option>Active</option><option>Base</option><option>Inactive</option>
          </select>
        </div>
        <ModalFooter onClose={()=>setAddCurrencyOpen(false)} onSubmit={()=>{
          if (!addCurForm.code.trim() || !addCurForm.name.trim()) { toast.error('Code and name are required'); return; }
          setCurrencies(d=>[...d, { code:addCurForm.code, name:addCurForm.name, symbol:addCurForm.symbol, rate:Number(addCurForm.rate)||1, status:addCurForm.status }]);
          toast.success('Currency added');
          setAddCurrencyOpen(false);
          setAddCurForm({ code:'', name:'', symbol:'', rate:'1', status:'Active' });
        }} loading={loading} submitLabel="Add Currency" isDark={isDark} border={border} textMain={textMain} />
      </Modal>
    </div>
  );
}
export default function CountriesCurrenciesPage() { return <AdminShell><CountriesContent /></AdminShell>; }
