'use client';
import AdminShell from '@/components/admin/admin-shell';
import PageHeader from '@/components/admin/page-header';
import { useTheme } from '@/contexts/theme-context';
import { Settings, Store, Bell, Shield, Globe, CreditCard, Palette, Save, Mail, MessageSquare, Smartphone, Send, CheckCircle, AlertCircle, Clock, KeyRound, Lock, Unlock, RefreshCw, Copy } from 'lucide-react';
import api from '@/lib/api';
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
  const [sessionTimeout, setSessionTimeout] = useState('30');
  // ── 2FA state ──────────────────────────────────────────────────────────────
  type TwoFAStep = 'loading' | 'disabled' | 'setup' | 'enabled' | 'disabling';
  const [twoFAStep, setTwoFAStep] = useState<TwoFAStep>('loading');
  const [twoFAQr, setTwoFAQr] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFABusy, setTwoFABusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testBroadcastSubject, setTestBroadcastSubject] = useState('');
  const [testBroadcastMsg, setTestBroadcastMsg] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);

  const handleTestEmail = async () => {
    if (!testEmail.trim()) { toast.error('Enter an email address'); return; }
    setTestEmailSending(true);
    try {
      await api.post('/api/notifications/email/test', { email: testEmail, firstName: 'Admin' });
      toast.success('Test email sent! Check your inbox.');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'SMTP not configured or send failed');
    }
    setTestEmailSending(false);
  };

  const handleBroadcast = async () => {
    if (!testBroadcastSubject.trim() || !testBroadcastMsg.trim()) { toast.error('Subject and message are required'); return; }
    setBroadcastSending(true);
    try {
      const res: any = await api.post('/api/notifications/email/broadcast', {
        sendToAll: true,
        subject: testBroadcastSubject,
        headline: testBroadcastSubject,
        message: testBroadcastMsg,
      });
      toast.success(`Broadcast sent to ${res.data?.sent || '?'} users!`);
      setTestBroadcastSubject('');
      setTestBroadcastMsg('');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Broadcast failed');
    }
    setBroadcastSending(false);
  };

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
      await updateSettings({
        store_name: storeName,
        store_email: storeEmail,
        store_phone: storePhone,
        currency: currency,
        timezone: timezone,
        email_notifications: String(emailNotif),
        push_notifications: String(pushNotif),
        order_notifications: String(orderNotif),
      });
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
        <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
          <SectionTitle title="Notifications & Email" sub="SMTP, SMS and push notification configuration" />

          {/* Channel Status */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}} className="fg">
            {[
              {icon:Mail, label:'Email (SMTP)', sub:'Gmail • Configured', color:'#1FA89A', status:'Active'},
              {icon:MessageSquare, label:'SMS (Beem Africa)', sub:'Zambia + International', color:'#6366f1', status:'Active'},
              {icon:Smartphone, label:'Push (Firebase)', sub:'Configure FCM to enable', color:'#FFC107', status:'Pending'},
            ].map(c=>(
              <div key={c.label} style={{background:surface,border:`1px solid ${border}`,borderRadius:'10px',padding:'14px 16px',display:'flex',gap:'12px',alignItems:'flex-start'}}>
                <div style={{width:36,height:36,borderRadius:'9px',background:`${c.color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <c.icon size={16} color={c.color} />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',fontWeight:700,color:textMain}}>{c.label}</div>
                  <div style={{fontSize:'11.5px',color:textMuted}}>{c.sub}</div>
                  <span style={{display:'inline-block',marginTop:'6px',padding:'2px 8px',borderRadius:'10px',fontSize:'10.5px',fontWeight:700,
                    background:c.status==='Active'?'rgba(31,168,154,0.12)':'rgba(255,193,7,0.12)',
                    color:c.status==='Active'?'#1FA89A':'#FFC107'}}>
                    {c.status==='Active'?'✓ Active':'⏳ '+c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Notification Settings */}
          <div>
            <div style={{fontSize:'13.5px',fontWeight:700,color:textMain,marginBottom:'12px'}}>Order Notification Triggers</div>
            <div style={{background:surface,border:`1px solid ${border}`,borderRadius:'10px',overflow:'hidden'}}>
              {[
                {label:'Order Placed',sub:'Email + SMS + Push when customer places order',on:true},
                {label:'Order Confirmed',sub:'Email + SMS when admin confirms order',on:true},
                {label:'Order Shipped',sub:'Email + SMS when order ships',on:true},
                {label:'Order Delivered',sub:'Email + SMS when delivered',on:true},
                {label:'Order Cancelled',sub:'Email + SMS when order is cancelled',on:true},
                {label:'Low Stock Alert',sub:'Admin email when stock drops below threshold',on:true},
              ].map((row,idx)=>(
                <div key={row.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${border}`,opacity:idx>=5?0.6:1}}>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:600,color:textMain}}>{row.label}</div>
                    <div style={{fontSize:'11.5px',color:textMuted}}>{row.sub}</div>
                  </div>
                  <span style={{padding:'2px 10px',borderRadius:'10px',fontSize:'11px',fontWeight:600,background:'rgba(31,168,154,0.1)',color:'#1FA89A'}}>Auto</span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Email */}
          <div>
            <div style={{fontSize:'13.5px',fontWeight:700,color:textMain,marginBottom:'12px'}}>Test SMTP Connection</div>
            <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
              <input
                type="email" value={testEmail} onChange={e=>setTestEmail(e.target.value)}
                placeholder="Enter email to test (e.g. kryrosmobile@gmail.com)"
                style={{...inputStyle,flex:'1 1 240px'}}
              />
              <button onClick={handleTestEmail} disabled={testEmailSending} style={{padding:'10px 20px',background:testEmailSending?'rgba(31,168,154,0.5)':'linear-gradient(135deg,#1FA89A,#27B9AF)',border:'none',borderRadius:'9px',color:'white',fontSize:'13.5px',fontWeight:600,cursor:testEmailSending?'not-allowed':'pointer',fontFamily:'var(--font-inter)',display:'flex',alignItems:'center',gap:'6px',whiteSpace:'nowrap'}}>
                <Send size={13}/> {testEmailSending ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
            <div style={{fontSize:'11.5px',color:textMuted,marginTop:'6px'}}>Sends a branded KRYROS HTML email using your configured Gmail SMTP credentials.</div>
          </div>

          {/* Email Broadcast */}
          <div>
            <div style={{fontSize:'13.5px',fontWeight:700,color:textMain,marginBottom:'12px'}}>Email Broadcast (All Users)</div>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <input type="text" value={testBroadcastSubject} onChange={e=>setTestBroadcastSubject(e.target.value)} placeholder="Subject / Headline..." style={inputStyle} />
              <textarea value={testBroadcastMsg} onChange={e=>setTestBroadcastMsg(e.target.value)} placeholder="Write your announcement or promotional message..." rows={3} style={{...inputStyle,resize:'none'}} />
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <button onClick={handleBroadcast} disabled={broadcastSending} style={{padding:'10px 20px',background:broadcastSending?'rgba(31,168,154,0.5)':'linear-gradient(135deg,#1FA89A,#27B9AF)',border:'none',borderRadius:'9px',color:'white',fontSize:'13.5px',fontWeight:600,cursor:broadcastSending?'not-allowed':'pointer',fontFamily:'var(--font-inter)',display:'flex',alignItems:'center',gap:'6px'}}>
                  <Send size={13}/> {broadcastSending ? 'Sending...' : 'Send to All Users'}
                </button>
              </div>
            </div>
          </div>

          {/* Toggle settings */}
          <div>
            <div style={{fontSize:'13.5px',fontWeight:700,color:textMain,marginBottom:'12px'}}>Admin Alert Preferences</div>
            <Row label="Email Notifications" sub="Receive order and activity emails"><ToggleSwitch value={emailNotif} onChange={()=>setEmailNotif(!emailNotif)} /></Row>
            <Row label="New Order Alerts" sub="Notify admin when a new order is placed"><ToggleSwitch value={orderNotif} onChange={()=>setOrderNotif(!orderNotif)} /></Row>
            <Row label="Push Notifications" sub="Browser push (requires Firebase setup)"><ToggleSwitch value={pushNotif} onChange={()=>setPushNotif(!pushNotif)} /></Row>
          </div>
        </div>
      );
      case 'security': return (
        <div>
          <SectionTitle title="Security Settings" sub="Protect your admin account and data" />
          {/* ─── Two-Factor Authentication ─────────────────────────────── */}
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:'12px',padding:'20px',marginBottom:'12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'9px',background:'rgba(31,168,154,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <KeyRound size={16} color="#1FA89A" />
              </div>
              <div>
                <div style={{fontWeight:700,color:textMain,fontSize:'14px'}}>Two-Factor Authentication</div>
                <div style={{fontSize:'12px',color:textMuted}}>Add an extra layer of security with Google Authenticator or Authy</div>
              </div>
              {twoFAStep==='enabled' && <span style={{marginLeft:'auto',padding:'3px 10px',borderRadius:'20px',background:'rgba(34,197,94,0.12)',color:'#22c55e',fontSize:'11px',fontWeight:700,border:'1px solid rgba(34,197,94,0.3)',flexShrink:0}}>ENABLED</span>}
              {twoFAStep==='disabled' && <span style={{marginLeft:'auto',padding:'3px 10px',borderRadius:'20px',background:'rgba(107,122,150,0.1)',color:textMuted,fontSize:'11px',fontWeight:700,border:`1px solid ${border}`,flexShrink:0}}>OFF</span>}
            </div>

            {/* LOADING */}
            {twoFAStep==='loading' && <div style={{textAlign:'center',padding:'16px',color:textMuted,fontSize:'12px'}}>Checking status...</div>}

            {/* DISABLED — show enable button */}
            {twoFAStep==='disabled' && (
              <button onClick={handle2faSetup} disabled={twoFABusy} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',background:'linear-gradient(135deg,#1FA89A,#27B9AF)',border:'none',borderRadius:'9px',color:'white',fontSize:'13px',fontWeight:600,cursor:twoFABusy?'wait':'pointer',fontFamily:'inherit'}}>
                {twoFABusy ? <><RefreshCw size={13} style={{animation:'spin2 1s linear infinite'}} /> Generating...</> : <><Lock size={13} /> Enable 2FA</>}
              </button>
            )}

            {/* SETUP — show QR code + code input */}
            {twoFAStep==='setup' && (
              <div>
                <div style={{fontSize:'12px',color:textMuted,marginBottom:'12px',lineHeight:1.6}}>
                  1. Install <strong style={{color:textMain}}>Google Authenticator</strong> or <strong style={{color:textMain}}>Authy</strong> on your phone.<br/>
                  2. Open the app and scan the QR code below.<br/>
                  3. Enter the 6-digit code shown in the app to confirm.
                </div>
                {twoFAQr && (
                  <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>
                    <img src={twoFAQr} alt="2FA QR Code" style={{width:160,height:160,border:`1px solid ${border}`,borderRadius:'10px',background:'white',padding:8}} />
                  </div>
                )}
                <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                  <input
                    value={twoFACode}
                    onChange={e=>setTwoFACode(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    style={{flex:1,padding:'10px 14px',background:surface,border:`1px solid ${border}`,borderRadius:'9px',color:textMain,fontSize:'16px',fontFamily:'monospace',outline:'none',letterSpacing:'0.25em',textAlign:'center'}}
                  />
                  <button onClick={handle2faEnable} disabled={twoFABusy||twoFACode.length!==6} style={{padding:'10px 16px',background:twoFACode.length===6?'linear-gradient(135deg,#1FA89A,#27B9AF)':border,border:'none',borderRadius:'9px',color:'white',fontSize:'13px',fontWeight:600,cursor:twoFACode.length===6?'pointer':'not-allowed',fontFamily:'inherit',opacity:twoFACode.length!==6?0.5:1}}>
                    {twoFABusy ? '...' : 'Verify'}
                  </button>
                </div>
                <button onClick={()=>{setTwoFAStep('disabled');setTwoFACode('');setTwoFAQr('');}} style={{fontSize:'11px',color:textMuted,background:'none',border:'none',cursor:'pointer',padding:'4px 0'}}>Cancel</button>
              </div>
            )}

            {/* ENABLED — show disable option */}
            {twoFAStep==='enabled' && (
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 12px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'9px',marginBottom:'12px'}}>
                  <CheckCircle size={14} color="#22c55e" />
                  <span style={{fontSize:'12px',color:'#22c55e',fontWeight:600}}>Your account is protected with two-factor authentication</span>
                </div>
                {twoFAStep==='enabled' && twoFACode==='' && (
                  <button onClick={()=>setTwoFAStep('disabling' as any)} style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 14px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'9px',color:'#ef4444',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                    <Unlock size={13} /> Disable 2FA
                  </button>
                )}
              </div>
            )}

            {/* DISABLING — confirm with code */}
            {(twoFAStep as string)==='disabling' && (
              <div>
                <div style={{fontSize:'12px',color:textMuted,marginBottom:'10px'}}>Enter your current 6-digit authenticator code to disable 2FA:</div>
                <div style={{display:'flex',gap:'8px'}}>
                  <input value={twoFACode} onChange={e=>setTwoFACode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="6-digit code" maxLength={6}
                    style={{flex:1,padding:'10px 14px',background:surface,border:`1px solid ${border}`,borderRadius:'9px',color:textMain,fontSize:'16px',fontFamily:'monospace',outline:'none',letterSpacing:'0.25em',textAlign:'center'}} />
                  <button onClick={handle2faDisable} disabled={twoFABusy||twoFACode.length!==6} style={{padding:'10px 14px',background:'#ef4444',border:'none',borderRadius:'9px',color:'white',fontSize:'12px',fontWeight:600,cursor:twoFACode.length===6?'pointer':'not-allowed',fontFamily:'inherit',opacity:twoFACode.length!==6?0.5:1}}>
                    {twoFABusy?'...':'Disable'}
                  </button>
                </div>
                <button onClick={()=>{setTwoFAStep('enabled');setTwoFACode('');}} style={{fontSize:'11px',color:textMuted,background:'none',border:'none',cursor:'pointer',padding:'4px 0',marginTop:'6px'}}>Cancel</button>
              </div>
            )}
          </div>

          <style>{`@keyframes spin2{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
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
            <button onClick={handleSave} disabled={saving} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 20px', background:'linear-gradient(135deg,#1FA89A,#27B9AF)', border:'none', borderRadius:'9px', color:'white', fontSize:'13.5px', fontWeight:600, cursor:saving?'not-allowed':'pointer', fontFamily:'var(--font-inter)', boxShadow:'0 4px 12px rgba(31,168,154,0.25)', opacity:saving?0.7:1 }}>
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

