'use client';
import AdminShell from '@/components/admin/admin-shell';
import PageHeader from '@/components/admin/page-header';
import { useTheme } from '@/contexts/theme-context';
import { Settings, Store, Bell, Shield, Globe, CreditCard, Palette, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '@/lib/api';
import toast from 'react-hot-toast';

type Tab = 'general'|'store'|'notifications'|'security'|'payments'|'appearance';

const tabs: {id: Tab; label: string; icon: React.ComponentType<{size?: number; color?: string}>}[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'store', label: 'Store', icon: Store },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [storeName, setStoreName] = useState('Kryros Mobile');
  const [storeEmail, setStoreEmail] = useState('info@kryros.com');
  const [storePhone, setStorePhone] = useState('+260 97X XXX XXX');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('Africa/Lusaka');
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [orderNotif, setOrderNotif] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((r: any) => {
      const s = r.data;
      if (!s) return;
      if (s.storeName) setStoreName(s.storeName);
      if (s.email || s.storeEmail) setStoreEmail(s.email || s.storeEmail);
      if (s.phone || s.storePhone) setStorePhone(s.phone || s.storePhone);
      if (s.currency) setCurrency(s.currency);
      if (s.timezone) setTimezone(s.timezone);
      if (s.emailNotifications !== undefined) setEmailNotif(Boolean(s.emailNotifications));
      if (s.pushNotifications !== undefined) setPushNotif(Boolean(s.pushNotifications));
      if (s.orderNotifications !== undefined) setOrderNotif(Boolean(s.orderNotifications));
      if (s.twoFactorEnabled !== undefined) setTwoFA(Boolean(s.twoFactorEnabled));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ storeName, storeEmail, storePhone, currency, timezone, emailNotifications: emailNotif, pushNotifications: pushNotif, orderNotifications: orderNotif, twoFactorEnabled: twoFA });
      toast.success('Settings saved successfully');
    } catch { toast.error('Failed to save settings — check connection'); }
    setSaving(false);
  };

  const inputStyle = { width:'100%', background:surface, border:`1px solid ${border}`, borderRadius:'9px', color:textMain, fontSize:'13.5px', fontFamily:'var(--font-inter)', outline:'none', padding:'10px 14px' };
  const labelStyle = { fontSize:'12.5px', fontWeight:600, color:textMuted, display:'block' as const, marginBottom:'6px' };

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} style={{ width:'44px', height:'24px', borderRadius:'12px', background:value?'#1FA89A':'rgba(100,116,139,0.3)', border:'none', cursor:'pointer', padding:'2px', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:value?'flex-end':'flex-start' }}>
      <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'white', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );

  const SectionTitle = ({ title, sub }: { title: string; sub?: string }) => (
    <div style={{ marginBottom:'20px', paddingBottom:'14px', borderBottom:`1px solid ${border}` }}>
      <div style={{ fontSize:'15px', fontWeight:700, color:textMain }}>{title}</div>
      {sub && <div style={{ fontSize:'13px', color:textMuted, marginTop:'2px' }}>{sub}</div>}
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom:'16px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  const Row = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:`1px solid ${border}` }}>
      <div>
        <div style={{ fontSize:'13.5px', fontWeight:600, color:textMain }}>{label}</div>
        {sub && <div style={{ fontSize:'12px', color:textMuted, marginTop:'2px' }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'general': return (
        <div>
          <SectionTitle title="General Settings" sub="Basic store information and configuration" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }} className="fg">
            <Field label="Store Name"><input style={inputStyle} value={storeName} onChange={e=>setStoreName(e.target.value)} /></Field>
            <Field label="Store Email"><input style={inputStyle} value={storeEmail} onChange={e=>setStoreEmail(e.target.value)} /></Field>
            <Field label="Phone Number"><input style={inputStyle} value={storePhone} onChange={e=>setStorePhone(e.target.value)} /></Field>
            <Field label="Default Currency">
              <select style={inputStyle} value={currency} onChange={e=>setCurrency(e.target.value)}>
                {['USD','ZMW','ZAR','GBP','EUR'].map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Timezone">
              <select style={inputStyle} value={timezone} onChange={e=>setTimezone(e.target.value)}>
                {['Africa/Lusaka','Africa/Nairobi','Africa/Johannesburg','Europe/London','America/New_York'].map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Language">
              <select style={inputStyle}><option>English (US)</option><option>English (UK)</option></select>
            </Field>
          </div>
        </div>
      );
      case 'store': return (
        <div>
          <SectionTitle title="Store Settings" sub="Configure your eCommerce store options" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }} className="fg">
            <Field label="Store URL"><input style={inputStyle} defaultValue="https://kryrosfrontendv2.onrender.com" /></Field>
            <Field label="Admin Panel URL"><input style={inputStyle} defaultValue="https://kryros-admin.codewords.run" /></Field>
            <Field label="Tax Rate (%)"><input style={inputStyle} type="number" defaultValue="10" /></Field>
            <Field label="Min Order Amount"><input style={inputStyle} type="number" defaultValue="20" /></Field>
            <Field label="Items Per Page"><input style={inputStyle} type="number" defaultValue="20" /></Field>
            <Field label="Max Cart Items"><input style={inputStyle} type="number" defaultValue="50" /></Field>
          </div>
          <Row label="Allow Guest Checkout" sub="Let customers checkout without an account"><ToggleSwitch value={true} onChange={()=>{}} /></Row>
          <Row label="Show Stock Quantity" sub="Display available stock on product pages"><ToggleSwitch value={true} onChange={()=>{}} /></Row>
          <Row label="Enable Reviews" sub="Allow customers to review products"><ToggleSwitch value={true} onChange={()=>{}} /></Row>
          <Row label="Enable Wishlist" sub="Let users save products for later"><ToggleSwitch value={false} onChange={()=>{}} /></Row>
        </div>
      );
      case 'notifications': return (
        <div>
          <SectionTitle title="Notification Settings" sub="Configure when and how you receive notifications" />
          <Row label="Email Notifications" sub="Receive order and activity emails"><ToggleSwitch value={emailNotif} onChange={()=>setEmailNotif(!emailNotif)} /></Row>
          <Row label="Push Notifications" sub="Browser push notifications"><ToggleSwitch value={pushNotif} onChange={()=>setPushNotif(!pushNotif)} /></Row>
          <Row label="New Order Alerts" sub="Notify when a new order is placed"><ToggleSwitch value={orderNotif} onChange={()=>setOrderNotif(!orderNotif)} /></Row>
          <Row label="Low Stock Alerts" sub="Alert when product stock is below 10"><ToggleSwitch value={true} onChange={()=>{}} /></Row>
          <Row label="New Review Alerts" sub="Notify when a customer leaves a review"><ToggleSwitch value={false} onChange={()=>{}} /></Row>
          <Row label="Withdrawal Requests" sub="Alert on new withdrawal requests"><ToggleSwitch value={true} onChange={()=>{}} /></Row>
        </div>
      );
      case 'security': return (
        <div>
          <SectionTitle title="Security Settings" sub="Protect your admin account and data" />
          <Row label="Two-Factor Authentication" sub="Add an extra layer of security to your account">
            <ToggleSwitch value={twoFA} onChange={()=>setTwoFA(!twoFA)} />
          </Row>
          <Row label="Session Timeout" sub="Auto logout after inactivity">
            <select style={{...inputStyle,width:'120px'}} value={sessionTimeout} onChange={e=>setSessionTimeout(e.target.value)}>
              {['15','30','60','120','Never'].map(t=><option key={t}>{t} {t!=='Never'?'min':''}</option>)}
            </select>
          </Row>
          <Row label="Login Attempts" sub="Lock account after failed logins"><select style={{...inputStyle,width:'80px'}}><option>5</option><option>3</option><option>10</option></select></Row>
          <div style={{ marginTop:'20px' }}>
            <div style={{ fontSize:'13.5px', fontWeight:700, color:textMain, marginBottom:'14px' }}>Change Password</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }} className="fg">
              <Field label="Current Password"><input style={inputStyle} type="password" placeholder="••••••••" /></Field>
              <Field label="New Password"><input style={inputStyle} type="password" placeholder="••••••••" /></Field>
              <Field label="Confirm Password"><input style={inputStyle} type="password" placeholder="••••••••" /></Field>
            </div>
          </div>
        </div>
      );
      case 'payments': return (
        <div>
          <SectionTitle title="Payment Settings" sub="Configure payment gateways and methods" />
          {[{name:'Mobile Money (MTN/Airtel)',icon:'📱',enabled:true},{name:'Credit / Debit Card',icon:'💳',enabled:true},{name:'Bank Transfer',icon:'🏦',enabled:true},{name:'Cash on Delivery',icon:'💵',enabled:false},{name:'Crypto',icon:'₿',enabled:false}].map(p=>(
            <Row key={p.name} label={`${p.icon} ${p.name}`} sub="Configure API keys and settings">
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <ToggleSwitch value={p.enabled} onChange={()=>{}} />
                <button style={{ padding:'5px 12px', background:surface, border:`1px solid ${border}`, borderRadius:'7px', color:textMuted, fontSize:'12.5px', cursor:'pointer', fontFamily:'var(--font-inter)' }}>Configure</button>
              </div>
            </Row>
          ))}
        </div>
      );
      case 'appearance': return (
        <div>
          <SectionTitle title="Appearance" sub="Customize the admin panel look and feel" />
          <Row label="Dark Mode" sub="Use dark theme for the admin panel">
            <ToggleSwitch value={isDark} onChange={()=>setTheme(isDark?'light':'dark')} />
          </Row>
          <div style={{ marginTop:'20px' }}>
            <div style={{ fontSize:'13.5px', fontWeight:700, color:textMain, marginBottom:'14px' }}>Brand Colors</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }} className="fg">
              {[{label:'Primary Color',val:'#1FA89A'},{label:'Secondary Color',val:'#6366f1'},{label:'Accent Color',val:'#FFC107'}].map(c=>(
                <Field key={c.label} label={c.label}>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:c.val, flexShrink:0, border:`2px solid ${border}` }} />
                    <input style={inputStyle} defaultValue={c.val} />
                  </div>
                </Field>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your admin panel and store" icon={Settings} />
      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:'20px', alignItems:'start' }} className="settings-grid">
        {/* Sidebar */}
        <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'12px', padding:'8px' }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'10px 12px', borderRadius:'8px', border:'none', background:activeTab===t.id?'rgba(31,168,154,0.12)':'transparent', color:activeTab===t.id?'#1FA89A':textMuted, fontSize:'13.5px', fontWeight:activeTab===t.id?600:500, cursor:'pointer', fontFamily:'var(--font-inter)', marginBottom:'2px' }}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'12px', padding:'24px' }}>
          {renderTab()}
          <div style={{ marginTop:'24px', paddingTop:'16px', borderTop:`1px solid ${border}`, display:'flex', justifyContent:'flex-end', gap:'8px' }}>
            <button style={{ padding:'10px 20px', background:surface, border:`1px solid ${border}`, borderRadius:'9px', color:textMuted, fontSize:'13.5px', fontWeight:500, cursor:'pointer', fontFamily:'var(--font-inter)' }}>Cancel</button>
            <button style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 20px', background:'linear-gradient(135deg,#1FA89A,#27B9AF)', border:'none', borderRadius:'9px', color:'white', fontSize:'13.5px', fontWeight:600, cursor:'pointer', fontFamily:'var(--font-inter)', boxShadow:'0 4px 12px rgba(31,168,154,0.25)' }}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      <style>{`.fg{} .settings-grid{} @media(max-width:900px){.settings-grid{grid-template-columns:1fr!important;} .fg{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

export default function SettingsPage() { return <AdminShell><SettingsContent /></AdminShell>; }

