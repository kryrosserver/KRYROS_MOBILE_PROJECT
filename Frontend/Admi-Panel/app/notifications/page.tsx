'use client';
import AdminShell from '@/components/admin/admin-shell';
import PageHeader from '@/components/admin/page-header';
import { useTheme } from '@/contexts/theme-context';
import { Bell, Send, Globe, Smartphone } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Notification = { id:string; title:string; message:string; target:string; channel:string; sent:number; opened:number; date:string; status:string };

const INITIAL: Notification[] = [
  { id:'N001', title:'Flash Sale - 50% Off!', message:'Get 50% off on all electronics this weekend only!', target:'All Users', channel:'Push+Email', sent:1456, opened:923, date:'2025-05-25', status:'Sent' },
  { id:'N002', title:'Order Shipped', message:'Your order #KRY123456 has been shipped.', target:'Specific User', channel:'Push', sent:1, opened:1, date:'2025-05-26', status:'Sent' },
  { id:'N003', title:'New Arrivals - iPhone 16', message:'The new iPhone 16 series is now available!', target:'All Users', channel:'Email', sent:0, opened:0, date:'2025-05-27', status:'Scheduled' },
  { id:'N004', title:'Loyalty Points Expiring', message:'Your loyalty points are expiring soon. Use them now!', target:'Loyalty Members', channel:'Push+Email+SMS', sent:245, opened:189, date:'2025-05-24', status:'Sent' },
  { id:'N005', title:'Weekend Wholesale Deals', message:'Special bulk pricing for wholesale partners this weekend.', target:'Wholesale', channel:'Email', sent:12, opened:10, date:'2025-05-22', status:'Sent' },
];

function NotificationsContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('All Users');
  const [channel, setChannel] = useState('Push');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [bulkList, setBulkList] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { toast.error('Title and message are required'); return; }
    if (target === 'Specific User' && !recipientEmail.trim() && !recipientPhone.trim()) { toast.error('Please enter recipient email or phone number'); return; }
    if (target === 'Bulk Custom List' && !bulkList.trim()) { toast.error('Please enter recipient list'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    const newNotif: Notification = {
      id: `N${String(Date.now()).slice(-3)}`,
      title, message, target, channel,
      sent: Math.floor(Math.random() * 500) + 1,
      opened: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Sent',
    };
    setNotifications(d => [newNotif, ...d]);
    toast.success(`Notification sent to ${target} via ${channel}`);
    setTitle(''); setMessage('');
    setSending(false);
  };

  const handleSchedule = () => {
    if (!title.trim() || !message.trim()) { toast.error('Title and message are required'); return; }
    const newNotif: Notification = {
      id: `N${String(Date.now()).slice(-3)}`,
      title, message, target, channel,
      sent: 0, opened: 0,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'Scheduled',
    };
    setNotifications(d => [newNotif, ...d]);
    toast.success('Notification scheduled for tomorrow');
    setTitle(''); setMessage('');
  };

  const inputStyle = { width:'100%', background:surface, border:`1px solid ${border}`, borderRadius:'9px', color:textMain, fontSize:'13.5px', fontFamily:'var(--font-inter)', outline:'none', padding:'10px 14px' };

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Send and manage push/email notifications" icon={Bell} />
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'24px'}} className="main-grid">
        {/* Compose */}
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:'12px',padding:'20px'}}>
          <div style={{fontSize:'14px',fontWeight:700,color:textMain,marginBottom:'16px',display:'flex',alignItems:'center',gap:'8px'}}>
            <Send size={16} color="#1FA89A" /> Compose Notification
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <div>
              <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Title</label>
              <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Notification title..." style={inputStyle} />
            </div>
            <div>
              <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Message</label>
              <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Enter notification message..." rows={3} style={{...inputStyle, resize:'none'}} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              <div>
                <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Target</label>
                <select value={target} onChange={e=>setTarget(e.target.value)} style={{...inputStyle, cursor:'pointer'}}>
                  {['All Users','New Users','Loyalty Members','Wholesale','Specific User','Bulk Custom List'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Channel</label>
                <select value={channel} onChange={e=>setChannel(e.target.value)} style={{...inputStyle, cursor:'pointer'}}>
                  {['Push','Email','SMS','Push+Email','Push+Email+SMS'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {/* Conditional recipient fields */}
            {target === 'Specific User' && (
              <div style={{display:'flex',flexDirection:'column',gap:'10px',padding:'12px',background:surface,borderRadius:'9px',border:`1px solid ${border}`}}>
                <div style={{fontSize:'12px',fontWeight:700,color:'#1FA89A',marginBottom:'2px'}}>Recipient Details</div>
                <div>
                  <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Email Address</label>
                  <input type="email" value={recipientEmail} onChange={e=>setRecipientEmail(e.target.value)} placeholder="user@example.com" style={inputStyle} />
                </div>
                <div>
                  <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Phone Number</label>
                  <input type="text" value={recipientPhone} onChange={e=>setRecipientPhone(e.target.value)} placeholder="+260 97X XXX XXX" style={inputStyle} />
                </div>
              </div>
            )}
            {target === 'Bulk Custom List' && (
              <div style={{padding:'12px',background:surface,borderRadius:'9px',border:`1px solid ${border}`}}>
                <label style={{fontSize:'12px',fontWeight:700,color:'#1FA89A',display:'block',marginBottom:'6px'}}>Recipients (comma-separated)</label>
                <textarea value={bulkList} onChange={e=>setBulkList(e.target.value)} placeholder="email1@example.com, email2@example.com, +26097X..." rows={3} style={{...inputStyle,resize:'vertical'}} />
                <div style={{fontSize:'11px',color:textMuted,marginTop:'4px'}}>Enter emails and/or phone numbers separated by commas.</div>
              </div>
            )}
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={handleSend} disabled={sending} style={{flex:1,padding:'11px',background:sending?'rgba(31,168,154,0.5)':'linear-gradient(135deg,#1FA89A,#27B9AF)',border:'none',borderRadius:'9px',color:'white',fontSize:'13.5px',fontWeight:600,cursor:sending?'not-allowed':'pointer',fontFamily:'var(--font-inter)',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                <Send size={14} /> {sending ? 'Sending...' : 'Send Now'}
              </button>
              <button onClick={handleSchedule} style={{padding:'11px 16px',background:surface,border:`1px solid ${border}`,borderRadius:'9px',color:textMuted,fontSize:'13.5px',fontWeight:500,cursor:'pointer',fontFamily:'var(--font-inter)'}}>
                Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {([{label:'Total Sent',val:notifications.reduce((a,n)=>a+n.sent,0).toLocaleString(),icon:Send as React.ComponentType<{size?:number;color?:string}>,color:'#1FA89A'},{label:'Total Opened',val:notifications.reduce((a,n)=>a+n.opened,0).toLocaleString(),icon:Bell as React.ComponentType<{size?:number;color?:string}>,color:'#6366f1'},{label:'Open Rate',val:'65.5%',icon:Globe as React.ComponentType<{size?:number;color?:string}>,color:'#FFC107'},{label:'Push Enabled',val:'1,245',icon:Smartphone as React.ComponentType<{size?:number;color?:string}>,color:'#1FA89A'}]).map(s=>{
            const SIcon = s.icon;
            return (
              <div key={s.label} style={{background:card,border:`1px solid ${border}`,borderRadius:'12px',padding:'16px',display:'flex',alignItems:'center',gap:'14px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'10px',background:`${s.color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <SIcon size={18} color={s.color} />
                </div>
                <div>
                  <div style={{fontSize:'12px',color:textMuted}}>{s.label}</div>
                  <div style={{fontSize:'22px',fontWeight:800,color:s.color}}>{s.val}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div style={{background:card,border:`1px solid ${border}`,borderRadius:'12px',overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:`1px solid ${border}`,fontSize:'14px',fontWeight:700,color:textMain}}>Notification History</div>
        {notifications.map(n=>(
          <div key={n.id} style={{padding:'14px 20px',borderBottom:`1px solid ${border}`,display:'flex',alignItems:'center',gap:'14px',flexWrap:'wrap'}}>
            <div style={{flex:'1 1 200px',minWidth:0}}>
              <div style={{fontWeight:600,color:textMain,fontSize:'13.5px'}}>{n.title}</div>
              <div style={{fontSize:'12px',color:textMuted,marginTop:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.message}</div>
            </div>
            <div style={{display:'flex',gap:'16px',flexWrap:'wrap',fontSize:'12px',color:textMuted}}>
              <div><span style={{fontWeight:600,color:textMain}}>{n.sent.toLocaleString()}</span> sent</div>
              <div><span style={{fontWeight:600,color:'#6366f1'}}>{n.opened.toLocaleString()}</span> opened</div>
              <div style={{fontWeight:500}}>{n.target}</div>
              <div>{n.date}</div>
            </div>
            <span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11.5px',fontWeight:600,background:n.status==='Sent'?'rgba(31,168,154,0.12)':'rgba(255,193,7,0.12)',color:n.status==='Sent'?'#1FA89A':'#FFC107'}}>{n.status}</span>
          </div>
        ))}
      </div>
      <style>{`.main-grid{} @media(max-width:900px){.main-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
export default function NotificationsPage() { return <AdminShell><NotificationsContent /></AdminShell>; }
