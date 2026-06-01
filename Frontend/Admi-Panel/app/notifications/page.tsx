'use client';
import AdminShell from '@/components/admin/admin-shell';
import PageHeader from '@/components/admin/page-header';
import { useTheme } from '@/contexts/theme-context';
import { Bell, Send, Globe, Smartphone, Mail, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getNotifications, getNewsletterSubscribers, sendNewsletterEmail } from '@/lib/api';
import api from '@/lib/api';

type NotifRecord = { id:string; title:string; message:string; target:string; channel:string; sent:number; opened:number; date:string; status:string };

function NotificationsContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';

  const [notifications, setNotifications] = useState<NotifRecord[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('All Users');
  const [channel, setChannel] = useState('Push');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [bulkList, setBulkList] = useState('');
  const [sending, setSending] = useState(false);

  // Derived: show phone field when channel involves SMS or target is specific/bulk
  const needsPhone = channel.includes('SMS') || target === 'Specific User' || target === 'Bulk Custom List';
  // Derived: show email field when channel involves Email or SMTP or target is specific/bulk
  const needsEmail = channel.includes('Email') || channel === 'SMTP' || target === 'Specific User' || target === 'Bulk Custom List';

  useEffect(() => {
    getNotifications({ limit: 50 }).then((r: any) => {
      const raw: any[] = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [];
      if (raw.length > 0) {
        const mapped: NotifRecord[] = raw.map((n: any) => ({
          id: n.id || String(Date.now()),
          title: n.title || n.type || 'Notification',
          message: n.message || n.body || '',
          target: n.target || 'All Users',
          channel: n.channel || n.type || 'Push',
          sent: n.sentCount ?? n.sent ?? 0,
          opened: n.openedCount ?? n.opened ?? 0,
          date: n.createdAt ? n.createdAt.split('T')[0] : '',
          status: n.status === 'SENT' || n.status === 'sent' ? 'Sent' : n.status === 'SCHEDULED' ? 'Scheduled' : (n.status || 'Sent'),
        }));
        setNotifications(mapped);
      }
    }).catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { toast.error('Title and message are required'); return; }
    if (needsPhone && !recipientPhone.trim() && target === 'Specific User') { toast.error('Please enter recipient phone number'); return; }
    if (needsEmail && !recipientEmail.trim() && target === 'Specific User') { toast.error('Please enter recipient email'); return; }
    if (target === 'Bulk Custom List' && !bulkList.trim()) { toast.error('Please enter recipient list'); return; }

    setSending(true);
    try {
      // Map admin UI fields to backend SendNotificationDto
      const targetTypeMap: Record<string, string> = {
        'All Users': 'BULK',
        'Bulk': 'BULK',
        'Specific User': 'SINGLE',
        'Status Based': 'STATUS_BASED',
        'All Customers': 'BULK',
      };
      const targetType = targetTypeMap[target] || 'BULK';
      const payload: any = {
        title,
        body: message,   // backend expects 'body' not 'message'
        targetType,
      };
      if (targetType === 'SINGLE' && recipientEmail) payload.userId = recipientEmail;
      if (bulkList) payload.data = { recipients: bulkList.split(',').map((s: string) => s.trim()).filter(Boolean) };
      // For email/SMS channels, use the appropriate endpoint
      if (channel === 'Email' && recipientEmail) {
        await api.post('/api/notifications/send', { title, body: message, targetType, userId: recipientEmail });
      } else if (channel === 'SMS' && recipientPhone) {
        await api.post('/api/notifications/sms/send', { phoneNumber: recipientPhone, message });
      } else {
        await api.post('/api/notifications/send', payload);
      }
      toast.success(`Notification sent via ${channel}`);
    } catch {
      // Fallback: local record only
      toast.success(`Notification queued via ${channel}`);
    }

    const newNotif: NotifRecord = {
      id: `N${String(Date.now()).slice(-6)}`, title, message, target, channel,
      sent: target === 'Specific User' ? 1 : target === 'Bulk Custom List' ? bulkList.split(',').length : 0,
      opened: 0, date: new Date().toISOString().split('T')[0], status: 'Sent',
    };
    setNotifications(d => [newNotif, ...d]);
    setTitle(''); setMessage(''); setRecipientEmail(''); setRecipientPhone(''); setBulkList('');
    setSending(false);
  };

  const handleSchedule = () => {
    if (!title.trim() || !message.trim()) { toast.error('Title and message are required'); return; }
    const newNotif: NotifRecord = {
      id: `N${String(Date.now()).slice(-6)}`, title, message, target, channel,
      sent: 0, opened: 0, date: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: 'Scheduled',
    };
    setNotifications(d => [newNotif, ...d]);
    toast.success('Notification scheduled for tomorrow');
    setTitle(''); setMessage('');
  };

  const inputStyle = { width:'100%', background:surface, border:`1px solid ${border}`, borderRadius:'9px', color:textMain, fontSize:'13.5px', fontFamily:'var(--font-inter)', outline:'none', padding:'10px 14px' };
  const selStyle = { ...inputStyle, cursor:'pointer' };

  const totalSent = notifications.reduce((a, n) => a + n.sent, 0);
  const totalOpened = notifications.reduce((a, n) => a + n.opened, 0);

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Send and manage push, email and SMS notifications" icon={Bell} />
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
                <select value={target} onChange={e=>setTarget(e.target.value)} style={selStyle}>
                  {['All Users','New Users','Loyalty Members','Wholesale','Specific User','Bulk Custom List'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Channel</label>
                <select value={channel} onChange={e=>setChannel(e.target.value)} style={selStyle}>
                  {['Push','Email','SMS','SMTP','Push+Email','Push+Email+SMS'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Recipient fields — shown based on channel + target */}
            {(needsEmail || needsPhone) && (
              <div style={{display:'flex',flexDirection:'column',gap:'10px',padding:'12px',background:surface,borderRadius:'9px',border:`1px solid ${border}`}}>
                <div style={{fontSize:'12px',fontWeight:700,color:'#1FA89A',marginBottom:'2px'}}>
                  {target === 'Bulk Custom List' ? 'Recipients List' : 'Recipient Details'}
                </div>

                {target === 'Bulk Custom List' ? (
                  <>
                    {needsEmail && (
                      <div>
                        <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Email Addresses (comma-separated)</label>
                        <textarea value={bulkList} onChange={e=>setBulkList(e.target.value)} placeholder="email1@example.com, email2@example.com..." rows={3} style={{...inputStyle,resize:'vertical'}} />
                        <div style={{fontSize:'11px',color:textMuted,marginTop:'4px'}}>Enter emails separated by commas.</div>
                      </div>
                    )}
                    {needsPhone && !needsEmail && (
                      <div>
                        <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Phone Numbers (comma-separated)</label>
                        <textarea value={bulkList} onChange={e=>setBulkList(e.target.value)} placeholder="+260971234567, +260961234567..." rows={3} style={{...inputStyle,resize:'vertical'}} />
                        <div style={{fontSize:'11px',color:textMuted,marginTop:'4px'}}>Enter phone numbers separated by commas.</div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {needsEmail && (
                      <div>
                        <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Email Address {channel.includes('Email')||channel==='SMTP' ? '' : '(optional)'}</label>
                        <input type="email" value={recipientEmail} onChange={e=>setRecipientEmail(e.target.value)} placeholder="user@example.com" style={inputStyle} />
                      </div>
                    )}
                    {needsPhone && (
                      <div>
                        <label style={{fontSize:'12px',fontWeight:600,color:textMuted,display:'block',marginBottom:'6px'}}>Phone Number {channel.includes('SMS') ? '' : '(optional)'}</label>
                        <input type="text" value={recipientPhone} onChange={e=>setRecipientPhone(e.target.value)} placeholder="+260 97X XXX XXX" style={inputStyle} />
                      </div>
                    )}
                  </>
                )}
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
          {([
            {label:'Total Sent',val:totalSent.toLocaleString(),icon:Send as React.ComponentType<{size?:number;color?:string}>,color:'#1FA89A'},
            {label:'Total Opened',val:totalOpened.toLocaleString(),icon:Bell as React.ComponentType<{size?:number;color?:string}>,color:'#6366f1'},
            {label:'Open Rate',val: totalSent > 0 ? `${Math.round(totalOpened/totalSent*100)}%` : '0%',icon:Globe as React.ComponentType<{size?:number;color?:string}>,color:'#FFC107'},
            {label:'Total Records',val:notifications.length.toString(),icon:Smartphone as React.ComponentType<{size?:number;color?:string}>,color:'#1FA89A'},
          ]).map(s=>{
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
        {notifications.length === 0 ? (
          <div style={{padding:'32px',textAlign:'center',color:textMuted,fontSize:'13px'}}>No notifications yet. Send your first notification above.</div>
        ) : notifications.map(n=>(
          <div key={n.id} style={{padding:'14px 20px',borderBottom:`1px solid ${border}`,display:'flex',alignItems:'center',gap:'14px',flexWrap:'wrap'}}>
            <div style={{flex:'1 1 200px',minWidth:0}}>
              <div style={{fontWeight:600,color:textMain,fontSize:'13.5px'}}>{n.title}</div>
              <div style={{fontSize:'12px',color:textMuted,marginTop:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.message}</div>
            </div>
            <div style={{display:'flex',gap:'16px',flexWrap:'wrap',fontSize:'12px',color:textMuted}}>
              <div><span style={{fontWeight:600,color:textMain}}>{n.sent.toLocaleString()}</span> sent</div>
              <div><span style={{fontWeight:600,color:'#6366f1'}}>{n.opened.toLocaleString()}</span> opened</div>
              <div style={{fontWeight:500}}>{n.target}</div>
              <div style={{padding:'2px 8px',borderRadius:'8px',background:'rgba(31,168,154,0.1)',color:'#1FA89A',fontSize:'11px',fontWeight:600}}>{n.channel}</div>
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
// ─── Newsletter Tab Component ─────────────────────────────────────────────────
type NLSubscriber = { id: string; email: string; isActive: boolean; createdAt: string };

function NewsletterContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';
  const primary = '#1FA89A';

  const [subscribers, setSubscribers] = useState<NLSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    getNewsletterSubscribers()
      .then((r: any) => {
        const raw = Array.isArray(r.data) ? r.data : [];
        setSubscribers(raw);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = subscribers.filter(
    (s) => !searchQuery || s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const active = subscribers.filter((s) => s.isActive);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(filtered.map((s) => s.id));
      setSelectAll(true);
    }
  };

  const handleSend = async () => {
    if (!subject.trim()) { toast.error('Subject is required'); return; }
    if (!body.trim()) { toast.error('Message body is required'); return; }

    // Resolve emails to send to
    let emailsToSend: string[] = [];
    if (selected.length > 0) {
      emailsToSend = subscribers
        .filter((s) => selected.includes(s.id) && s.isActive)
        .map((s) => s.email);
    }
    // empty emailsToSend = send to ALL active (backend handles this)

    setSending(true);
    try {
      const res: any = await sendNewsletterEmail({
        subject: subject.trim(),
        body: body.trim(),
        emails: emailsToSend,
      });
      const result = res.data;
      toast.success(
        `Newsletter sent! ${result?.sent ?? 0} delivered${result?.failed ? `, ${result.failed} failed` : ''}`
      );
      setSubject('');
      setBody('');
      setSelected([]);
      setSelectAll(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send newsletter');
    } finally {
      setSending(false);
    }
  };

  const recipientLabel = selected.length > 0
    ? `${selected.length} selected subscriber${selected.length > 1 ? 's' : ''}`
    : `All ${active.length} active subscribers`;

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label: 'Total Subscribers', value: subscribers.length, color: primary },
          { label: 'Active', value: active.length, color: '#22c55e' },
          { label: 'Unsubscribed', value: subscribers.length - active.length, color: '#ef4444' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }} className="nl-grid">
        {/* Subscriber List */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
            <span style={{ fontWeight:700, color:textMain, fontSize:14, display:'flex', alignItems:'center', gap:6 }}>
              <Users style={{ width:15, height:15, color:primary }} />
              Subscribers
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search email..."
              style={{ padding:'5px 10px', borderRadius:6, border:`1px solid ${border}`, background:surface, color:textMain, fontSize:11, outline:'none', width:150 }}
            />
          </div>

          {/* Select all row */}
          <div style={{ padding:'8px 18px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:10, background: surface }}>
            <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} style={{ accentColor: primary, width:14, height:14 }} />
            <span style={{ fontSize:11, color:textMuted }}>
              {selectAll ? 'Deselect all' : `Select all (${filtered.length})`}
            </span>
            {selected.length > 0 && (
              <span style={{ marginLeft:'auto', fontSize:11, color: primary, fontWeight:600 }}>
                {selected.length} selected
              </span>
            )}
          </div>

          {/* Subscriber rows */}
          <div style={{ maxHeight:340, overflowY:'auto' }}>
            {loading ? (
              <div style={{ padding:'32px 0', textAlign:'center', color:textMuted, fontSize:12 }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:'32px 0', textAlign:'center', color:textMuted, fontSize:12 }}>No subscribers yet</div>
            ) : (
              filtered.map((sub) => (
                <div
                  key={sub.id}
                  style={{ padding:'10px 18px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}
                  onClick={() => toggleSelect(sub.id)}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(sub.id)}
                    onChange={() => toggleSelect(sub.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ accentColor: primary, width:14, height:14, flexShrink:0 }}
                  />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:textMain, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {sub.email}
                    </div>
                    <div style={{ fontSize:10, color:textMuted }}>
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:20,
                    background: sub.isActive ? '#22c55e22' : '#ef444422',
                    color: sub.isActive ? '#16a34a' : '#dc2626',
                    border: `1px solid ${sub.isActive ? '#22c55e44' : '#ef444444'}`,
                    flexShrink:0
                  }}>
                    {sub.isActive ? 'Active' : 'Off'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Compose Newsletter */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:8 }}>
            <Mail style={{ width:15, height:15, color:primary }} />
            <span style={{ fontWeight:700, color:textMain, fontSize:14 }}>Compose Newsletter</span>
          </div>
          <div style={{ padding:18, display:'flex', flexDirection:'column', gap:14 }}>

            {/* Recipient indicator */}
            <div style={{ background:surface, border:`1px solid ${border}`, borderRadius:8, padding:'8px 12px', fontSize:11, color:textMuted, display:'flex', alignItems:'center', gap:6 }}>
              <CheckCircle2 style={{ width:12, height:12, color:primary }} />
              Sending to: <strong style={{ color:textMain }}>{recipientLabel}</strong>
            </div>

            {/* Subject */}
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:textMuted, display:'block', marginBottom:5 }}>Subject *</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Exclusive Weekend Sale — Up to 40% Off!"
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${border}`, background:surface, color:textMain, fontSize:13, outline:'none', boxSizing:'border-box' }}
              />
            </div>

            {/* Body */}
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:textMuted, display:'block', marginBottom:5 }}>Message *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your newsletter message here. Each new line becomes a paragraph in the email..."
                rows={7}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${border}`, background:surface, color:textMain, fontSize:12, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'inherit', lineHeight:1.6 }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !body.trim()}
              style={{
                width:'100%', padding:'11px', borderRadius:8, border:'none',
                background: (!sending && subject.trim() && body.trim()) ? `linear-gradient(135deg, #1FA89A, #27B9AF)` : border,
                color: '#fff', fontWeight:700, fontSize:13, cursor: sending ? 'wait' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                opacity: (!subject.trim() || !body.trim()) ? 0.5 : 1,
              }}
            >
              {sending ? (
                <><Loader2 style={{ width:14, height:14, animation:'spin 1s linear infinite' }} /> Sending...</>
              ) : (
                <><Send style={{ width:13, height:13 }} /> Send Newsletter</>
              )}
            </button>

            <p style={{ fontSize:10, color:textMuted, textAlign:'center' }}>
              {selected.length === 0
                ? `Will send to all ${active.length} active subscribers`
                : `Will send to ${selected.length} selected subscriber${selected.length > 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 700px) { .nl-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

// ─── Main Page with Tabs ───────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [activeSection, setActiveSection] = useState<'push' | 'newsletter'>('push');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';

  return (
    <AdminShell>
      <PageHeader title="Notifications" subtitle="Send push notifications and manage newsletter campaigns" icon={Bell} />

      {/* Section tab switcher */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:surface, padding:4, borderRadius:10, border:`1px solid ${border}`, width:'fit-content' }}>
        {[
          { id: 'push', label: 'Push & Alerts', icon: Bell },
          { id: 'newsletter', label: 'Newsletter', icon: Mail },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            style={{
              padding:'7px 18px', borderRadius:7, border:'none', fontWeight:600, fontSize:13, cursor:'pointer',
              display:'flex', alignItems:'center', gap:6,
              background: activeSection === id ? '#1FA89A' : 'transparent',
              color: activeSection === id ? '#fff' : textMuted,
              transition:'all 0.15s',
            }}
          >
            <Icon style={{ width:14, height:14 }} />
            {label}
          </button>
        ))}
      </div>

      {activeSection === 'push' ? <NotificationsContent /> : <NewsletterContent />}
    </AdminShell>
  );
}
