'use client';
import { useState, useRef, useEffect } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import PageHeader from '@/components/admin/page-header';
import { Modal, ConfirmDialog, FormField, ModalFooter } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import {
  Layout, Edit, Eye, Plus, ChevronDown, Trash2, Upload, X,
  Image as ImageIcon, Video, Link2, Type, AlignLeft, MousePointer,
  ChevronLeft, ChevronRight, FileText, Mail, MapPin, Clock, Tag, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getCmsPages, getCmsBanners, getCmsHomepageSections, getCmsSections,
  createCmsBanner, updateCmsBanner, deleteCmsBanner,
  createCmsHomepageSection, updateCmsHomepageSection, deleteCmsHomepageSection,
  updateCmsSection, createCmsSection, deleteCmsSection,
  getCmsSiteConfigs, upsertCmsSiteConfig,
} from '@/lib/api';

const SECTION_FIELDS: Record<string, Array<{ key: string; label: string; type: string; options?: string[]; icon?: string }>> = {
  'Hero Banner': [
    { key: 'title', label: 'Banner Title', type: 'text', icon: 'type' },
    { key: 'subtitle', label: 'Subtitle', type: 'text', icon: 'type' },
    { key: 'description', label: 'Description', type: 'textarea', icon: 'align' },
    { key: 'button_text', label: 'Button Text', type: 'text', icon: 'mouse' },
    { key: 'button_link', label: 'Button Link (URL)', type: 'text', icon: 'link' },
    { key: 'media', label: 'Banner Image or Video', type: 'file' },
  ],
  'Sale Banner': [
    { key: 'title', label: 'Banner Title', type: 'text', icon: 'type' },
    { key: 'subtitle', label: 'Subtitle', type: 'text', icon: 'type' },
    { key: 'discount_text', label: 'Discount Badge (e.g. 50% OFF)', type: 'text', icon: 'type' },
    { key: 'button_text', label: 'Button Text', type: 'text', icon: 'mouse' },
    { key: 'button_link', label: 'Button Link (URL)', type: 'text', icon: 'link' },
    { key: 'media', label: 'Banner Image', type: 'file' },
  ],
  'Featured Products': [
    { key: 'heading', label: 'Section Heading', type: 'text', icon: 'type' },
    { key: 'subheading', label: 'Subheading', type: 'text', icon: 'type' },
    { key: 'product_limit', label: 'Number of Products to Show', type: 'text', icon: 'type' },
    { key: 'sort_by', label: 'Sort By', type: 'select', options: ['Featured', 'Newest', 'Best Selling', 'On Sale'] },
  ],
  'Promotions': [
    { key: 'heading', label: 'Section Heading', type: 'text', icon: 'type' },
    { key: 'promo_title', label: 'Promotion Title', type: 'text', icon: 'type' },
    { key: 'promo_text', label: 'Promotion Description', type: 'textarea', icon: 'align' },
    { key: 'button_text', label: 'Button Text', type: 'text', icon: 'mouse' },
    { key: 'button_link', label: 'Button Link (URL)', type: 'text', icon: 'link' },
    { key: 'media', label: 'Promotion Image', type: 'file' },
  ],
  'Newsletter': [
    { key: 'heading', label: 'Heading', type: 'text', icon: 'type' },
    { key: 'subheading', label: 'Subheading', type: 'text', icon: 'type' },
    { key: 'placeholder', label: 'Email Placeholder', type: 'text', icon: 'type' },
    { key: 'button_text', label: 'Subscribe Button Text', type: 'text', icon: 'mouse' },
  ],
  'Company Story': [
    { key: 'heading', label: 'Section Heading', type: 'text', icon: 'type' },
    { key: 'content', label: 'Story Content', type: 'textarea', icon: 'align' },
    { key: 'media', label: 'Section Image', type: 'file' },
    { key: 'button_text', label: 'Learn More Button Text', type: 'text', icon: 'mouse' },
    { key: 'button_link', label: 'Button Link (URL)', type: 'text', icon: 'link' },
  ],
  'Team': [
    { key: 'heading', label: 'Section Heading', type: 'text', icon: 'type' },
    { key: 'subheading', label: 'Subheading', type: 'text', icon: 'type' },
    { key: 'media', label: 'Team Photo', type: 'file' },
  ],
  'Mission & Vision': [
    { key: 'mission_title', label: 'Mission Title', type: 'text', icon: 'type' },
    { key: 'mission_text', label: 'Mission Statement', type: 'textarea', icon: 'align' },
    { key: 'vision_title', label: 'Vision Title', type: 'text', icon: 'type' },
    { key: 'vision_text', label: 'Vision Statement', type: 'textarea', icon: 'align' },
    { key: 'media', label: 'Section Image', type: 'file' },
  ],
  'Contact Form': [
    { key: 'heading', label: 'Section Heading', type: 'text', icon: 'type' },
    { key: 'subheading', label: 'Subheading', type: 'text', icon: 'type' },
    { key: 'email', label: 'Contact Email', type: 'text', icon: 'link' },
    { key: 'phone', label: 'Phone Number', type: 'text', icon: 'type' },
    { key: 'address', label: 'Address', type: 'textarea', icon: 'align' },
  ],
  'Location Map': [
    { key: 'heading', label: 'Section Heading', type: 'text', icon: 'type' },
    { key: 'address', label: 'Full Address', type: 'textarea', icon: 'align' },
    { key: 'map_embed_url', label: 'Google Maps Embed URL', type: 'text', icon: 'link' },
  ],
  'Business Hours': [
    { key: 'heading', label: 'Section Heading', type: 'text', icon: 'type' },
    { key: 'mon_fri', label: 'Monday – Friday Hours', type: 'text', icon: 'type' },
    { key: 'saturday', label: 'Saturday Hours', type: 'text', icon: 'type' },
    { key: 'sunday', label: 'Sunday / Public Holidays', type: 'text', icon: 'type' },
  ],
  'Terms Text': [
    { key: 'heading', label: 'Section Heading', type: 'text', icon: 'type' },
    { key: 'content', label: 'Terms & Conditions Content', type: 'textarea', icon: 'align' },
    { key: 'last_updated', label: 'Last Updated Date', type: 'text', icon: 'type' },
  ],
  'Policy Text': [
    { key: 'heading', label: 'Section Heading', type: 'text', icon: 'type' },
    { key: 'content', label: 'Privacy Policy Content', type: 'textarea', icon: 'align' },
    { key: 'last_updated', label: 'Last Updated Date', type: 'text', icon: 'type' },
  ],
  'Promo Banner': [
    { key: 'tag', label: 'Tag Badge (e.g. "UP TO 50% OFF")', type: 'text', icon: 'tag' },
    { key: 'title', label: 'Banner Title', type: 'text', icon: 'type' },
    { key: 'subtitle', label: 'Subtitle Text', type: 'text', icon: 'type' },
    { key: 'description', label: 'Description', type: 'textarea', icon: 'align' },
    { key: 'href', label: 'Button Link (URL)', type: 'text', icon: 'link' },
    { key: 'emoji', label: 'Emoji Icon (e.g. 🛒) — used if no image', type: 'text', icon: 'type' },
    { key: 'color_theme', label: 'Color Theme (used if no image)', type: 'select', options: ['Green/Teal', 'Blue', 'Purple', 'Red'] },
    { key: 'image', label: 'Background Image (overrides color)', type: 'file' },
  ],
  'Products Grid': [
    { key: 'heading', label: 'Section Heading', type: 'text', icon: 'type' },
    { key: 'product_limit', label: 'Products to Show', type: 'text', icon: 'type' },
    { key: 'filter_by', label: 'Filter By', type: 'select', options: ['All Products', 'Sale Items', 'Featured', 'New Arrivals'] },
    { key: 'button_text', label: 'View All Button Text', type: 'text', icon: 'mouse' },
    { key: 'button_link', label: 'View All Link', type: 'text', icon: 'link' },
  ],
};
const DEFAULT_FIELDS = [
  { key: 'heading', label: 'Section Heading', type: 'text', icon: 'type' },
  { key: 'subtitle', label: 'Subtitle', type: 'text', icon: 'type' },
  { key: 'content', label: 'Content / Description', type: 'textarea', icon: 'align' },
  { key: 'button_text', label: 'Button Text', type: 'text', icon: 'mouse' },
  { key: 'button_link', label: 'Button Link (URL)', type: 'text', icon: 'link' },
  { key: 'media', label: 'Image / Video Upload', type: 'file' },
];

type SectionData = Record<string, string>;
type SectionItem = { id: string; content: SectionData; status: string; mediaUrl?: string };
type Section = { name: string; items: SectionItem[] };
type CmsPage = { id: string; title: string; slug: string; sections: Section[]; lastEdited: string; status: string };

function getItemPreview(sectionName: string, content: SectionData): string {
  const keys = ['title', 'promo_title', 'heading', 'mission_title', 'content'];
  for (const k of keys) { if (content[k]) return content[k]; }
  return sectionName + ' Item';
}
function getItemSub(content: SectionData): string {
  if (content.button_text && content.button_link) return content.button_text + ' • ' + content.button_link;
  if (content.button_text) return content.button_text;
  if (content.subheading) return content.subheading;
  if (content.subtitle) return content.subtitle;
  return '';
}
function getSectionIconType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('banner') || n.includes('hero')) return 'image';
  if (n.includes('product')) return 'tag';
  if (n.includes('promo')) return 'promo';
  if (n.includes('news') || n.includes('contact') || n.includes('form')) return 'mail';
  if (n.includes('map') || n.includes('location')) return 'map';
  if (n.includes('hour') || n.includes('time')) return 'clock';
  return 'text';
}
function sectionHasMedia(name: string): boolean {
  const fields = SECTION_FIELDS[name] || DEFAULT_FIELDS;
  return fields.some(f => f.type === 'file');
}

const INITIAL_PAGES: CmsPage[] = [
  { id: 'PG001', title: 'Home', slug: '/', lastEdited: '2025-05-25', status: 'Published',
    sections: [
      { name: 'Hero Banner', items: [{ id: 'i1a', content: { title: 'Welcome to KRYROS', subtitle: 'Premium Tech Products in Zambia', description: 'Discover the latest smartphones, laptops and accessories.', button_text: 'Shop Now', button_link: '/products', media: '' }, status: 'Active' }] },
      { name: 'Featured Products', items: [{ id: 'i2a', content: { heading: 'Featured Products', subheading: 'Hand-picked just for you', product_limit: '8', sort_by: 'Featured' }, status: 'Active' }] },
      { name: 'Promotions', items: [{ id: 'i3a', content: { heading: 'Special Offers', promo_title: 'Flash Sale', promo_text: 'Up to 40% off selected items', button_text: 'See All Deals', button_link: '/promotions', media: '' }, status: 'Active' }] },
      { name: 'Newsletter', items: [{ id: 'i4a', content: { heading: 'Stay Updated', subheading: 'Get deals and new arrivals straight to your inbox', placeholder: 'Enter your email', button_text: 'Subscribe' }, status: 'Active' }] },
    ],
  },
  { id: 'PG002', title: 'About Us', slug: '/about', lastEdited: '2025-04-10', status: 'Published',
    sections: [
      { name: 'Company Story', items: [{ id: 'i5a', content: { heading: 'Our Story', content: 'KRYROS Mobile Tech was founded in 2020 with a mission to make premium technology accessible to everyone in Zambia.', button_text: 'Learn More', button_link: '/about', media: '' }, status: 'Active' }] },
      { name: 'Team', items: [{ id: 'i6a', content: { heading: 'Meet Our Team', subheading: 'The people behind KRYROS', media: '' }, status: 'Active' }] },
      { name: 'Mission & Vision', items: [{ id: 'i7a', content: { mission_title: 'Our Mission', mission_text: 'To provide the best tech products and services at fair prices.', vision_title: 'Our Vision', vision_text: 'To be the leading tech retailer in Southern Africa.', media: '' }, status: 'Active' }] },
    ],
  },
  { id: 'PG003', title: 'Contact', slug: '/contact', lastEdited: '2025-03-20', status: 'Published',
    sections: [
      { name: 'Contact Form', items: [{ id: 'i8a', content: { heading: 'Get in Touch', subheading: "We'd love to hear from you", email: 'info@kryros.com', phone: '+260 97X XXX XXX', address: 'Lusaka, Zambia' }, status: 'Active' }] },
      { name: 'Location Map', items: [{ id: 'i9a', content: { heading: 'Find Us', address: 'Lusaka, Zambia', map_embed_url: '' }, status: 'Active' }] },
      { name: 'Business Hours', items: [{ id: 'i10a', content: { heading: 'Business Hours', mon_fri: '08:00 AM – 06:00 PM', saturday: '09:00 AM – 04:00 PM', sunday: 'Closed' }, status: 'Active' }] },
    ],
  },
  { id: 'PG004', title: 'Terms & Conditions', slug: '/terms', lastEdited: '2025-01-15', status: 'Published',
    sections: [{ name: 'Terms Text', items: [{ id: 'i11a', content: { heading: 'Terms & Conditions', content: 'By using our website you agree to these terms...', last_updated: '2025-01-15' }, status: 'Active' }] }],
  },
  { id: 'PG005', title: 'Privacy Policy', slug: '/privacy', lastEdited: '2025-01-15', status: 'Published',
    sections: [{ name: 'Policy Text', items: [{ id: 'i12a', content: { heading: 'Privacy Policy', content: 'We respect your privacy and are committed to protecting your data...', last_updated: '2025-01-15' }, status: 'Active' }] }],
  },
  { id: 'PG006', title: 'Flash Sale', slug: '/flash-sale', lastEdited: '2025-05-20', status: 'Draft',
    sections: [
      { name: 'Sale Banner', items: [{ id: 'i13a', content: { title: 'Flash Sale', subtitle: 'Limited Time Only', discount_text: '50% OFF', button_text: 'Shop Now', button_link: '/products', media: '' }, status: 'Active' }] },
      { name: 'Products Grid', items: [{ id: 'i14a', content: { heading: 'Sale Items', product_limit: '12', filter_by: 'Sale Items', button_text: 'View All Sale Items', button_link: '/products?sale=true' }, status: 'Active' }] },
    ],
  },
];

const EMPTY_PAGE_FORM = { title: '', slug: '', status: 'Published' };
const ADD_SECTION_NAMES = ['Hero Banner','Promo Banner','Featured Products','Promotions','Newsletter','Company Story','Team','Mission & Vision','Contact Form','Location Map','Business Hours','Terms Text','Policy Text','Products Grid','Sale Banner','Custom Section'];

function FileUpload({ value, onChange, onUrlChange, isDark, border, surface, textMuted }: {
  value: string; onChange: (v: string, name: string) => void; onUrlChange?: (url: string) => void;
  isDark: boolean; border: string; surface: string; textMuted: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ name: string; type: string; url: string } | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview({ name: file.name, type: isVideo ? 'video' : 'image', url: dataUrl });
      onChange(dataUrl, file.name);
      onUrlChange?.(dataUrl);
      setUrlInput('');
    };
    reader.readAsDataURL(file);
    toast.success(file.name + ' selected');
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    if (!url.trim()) { setPreview(null); onChange('', ''); onUrlChange?.(''); return; }
    const isVideo = /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(url);
    setPreview({ name: url, type: isVideo ? 'video' : 'image', url });
    onChange(url, url);
    onUrlChange?.(url);
  };

  const clearAll = () => { setPreview(null); setUrlInput(''); onChange('', ''); onUrlChange?.(''); };

  return (
    <div>
      {preview ? (
        <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px', border: `1px solid ${border}` }}>
          {preview.type === 'image' ? <img src={preview.url} alt="" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }} onError={(e:any)=>{e.target.style.opacity='0.3';}} />
            : <video src={preview.url} controls style={{ width: '100%', maxHeight: '180px', display: 'block' }} />}
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <button onClick={clearAll} style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={13} color="white" />
            </button>
          </div>
          <div style={{ padding: '6px 10px', background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)', fontSize: '11px', color: textMuted, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {preview.type === 'video' ? <Video size={11} /> : <ImageIcon size={11} />}
            {preview.name.startsWith('data:') ? 'Uploaded file' : preview.name.length > 50 ? preview.name.slice(0,50)+'...' : preview.name}
          </div>
        </div>
      ) : value ? (
        <div style={{ padding: '10px 12px', background: surface, border: `1px solid ${border}`, borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: textMuted }}>
          <ImageIcon size={14} /> {value.startsWith('data:') ? 'Uploaded file' : value.slice(0,60)}
          <button onClick={clearAll} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><X size={13} /></button>
        </div>
      ) : null}
      <div onClick={() => inputRef.current?.click()} style={{ border: `2px dashed ${border}`, borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: surface, transition: 'border-color 0.15s', marginBottom:'8px' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#1FA89A'} onMouseLeave={e => e.currentTarget.style.borderColor = border}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(31,168,154,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Upload size={16} color="#1FA89A" /></div>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={16} color="#6366f1" /></div>
        </div>
        <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 2px' }}><span style={{ color: '#1FA89A', fontWeight: 600 }}>Click to upload</span> image or video</p>
        <p style={{ fontSize: '11px', color: textMuted, margin: 0 }}>PNG, JPG, GIF, MP4, MOV — max 50MB</p>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
        <div style={{ flex:1, height:'1px', background:border }} />
        <span style={{ fontSize:'10px', color:textMuted, fontWeight:500, whiteSpace:'nowrap' }}>OR PASTE URL</span>
        <div style={{ flex:1, height:'1px', background:border }} />
      </div>
      <input type="text" value={urlInput} onChange={e => handleUrlChange(e.target.value)} placeholder="https://example.com/image.jpg or video.mp4"
        style={{ width:'100%', padding:'8px 10px', borderRadius:'7px', background:surface, border:`1px solid ${border}`, color:textMuted, fontSize:'12px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const }} />
      <input ref={inputRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}

function ItemFormModal({ sectionName, pageTitle, initialValues, onClose, onSave, isDark, border, textMain, textMuted, surface, isEdit }: {
  sectionName: string; pageTitle: string; initialValues: SectionData;
  onClose: () => void; onSave: (content: SectionData, mediaUrl?: string) => void;
  isDark: boolean; border: string; textMain: string; textMuted: string; surface: string; isEdit: boolean;
}) {
  const fields = SECTION_FIELDS[sectionName] || DEFAULT_FIELDS;
  const [values, setValues] = useState<SectionData>({ ...initialValues });
  const [mediaUrl, setMediaUrl] = useState('');
  const set = (k: string) => (v: string) => setValues(prev => ({ ...prev, [k]: v }));
  const bg = isDark ? '#0D1523' : '#FFFFFF';
  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: '8px', background: surface, border: `1px solid ${border}`, color: textMain, fontSize: '13.5px', outline: 'none', fontFamily: 'var(--font-inter)', boxSizing: 'border-box' };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(3px)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '92vh', overflow: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.45)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 14px', borderBottom: `1px solid ${border}` }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: textMain }}>{isEdit ? 'Edit' : 'Add New'} {sectionName}</div>
            <div style={{ fontSize: '11.5px', color: textMuted, marginTop: '2px' }}>{pageTitle} → {sectionName}</div>
          </div>
          <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '7px', background: isDark ? '#1E293B' : '#F1F5F9', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} color={textMuted} /></button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {fields.map(field => (
            <div key={field.key} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {field.icon === 'type' && <Type size={10} />}{field.icon === 'align' && <AlignLeft size={10} />}{field.icon === 'mouse' && <MousePointer size={10} />}{field.icon === 'link' && <Link2 size={10} />}
                {field.label}
              </label>
              {field.type === 'file' ? (
                <FileUpload value={values[field.key] || ''} onChange={(v) => set(field.key)(v)} onUrlChange={setMediaUrl} isDark={isDark} border={border} surface={surface} textMuted={textMuted} />
              ) : field.type === 'textarea' ? (
                <textarea value={values[field.key] || ''} onChange={e => set(field.key)(e.target.value)} rows={4} placeholder={'Enter ' + field.label.toLowerCase() + '...'} style={{ ...inputStyle, resize: 'vertical' }} />
              ) : field.type === 'select' ? (
                <div style={{ position: 'relative' }}>
                  <select value={values[field.key] || (field.options?.[0] || '')} onChange={e => set(field.key)(e.target.value)} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', paddingRight: '32px' }}>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><ChevronDown size={13} color={textMuted} /></div>
                </div>
              ) : (
                <input type="text" value={values[field.key] || ''} onChange={e => set(field.key)(e.target.value)} placeholder={'Enter ' + field.label.toLowerCase() + '...'} style={inputStyle} />
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: `1px solid ${border}` }}>
            <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '9px', background: isDark ? '#1E293B' : '#F1F5F9', border: `1px solid ${border}`, color: textMain, fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>Cancel</button>
            <button onClick={() => { onSave(values, mediaUrl || undefined); onClose(); toast.success((isEdit ? 'Saved: ' : 'Added: ') + sectionName); }} style={{ padding: '10px 20px', borderRadius: '9px', background: 'linear-gradient(135deg,#1FA89A,#27B9AF)', border: 'none', color: 'white', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isEdit ? 'Save Changes' : <><Plus size={14} /> Add {sectionName}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CMSContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';
  const accent = '#1FA89A';

  const [data, setData] = useState<CmsPage[]>(INITIAL_PAGES);
  type View = 'pages' | 'sections' | 'items';

  // ── Load real data from API on mount ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [pagesRes, bannersRes, hpRes] = await Promise.all([
          getCmsPages().catch(() => ({ data: [] })),
          getCmsBanners().catch(() => ({ data: [] })),
          getCmsHomepageSections().catch(() => ({ data: [] })),
        ]);
        const apiPages: any[] = Array.isArray(pagesRes.data) ? pagesRes.data : Array.isArray((pagesRes.data as any)?.data) ? (pagesRes.data as any).data : [];
        const banners: any[] = Array.isArray(bannersRes.data) ? bannersRes.data : Array.isArray((bannersRes.data as any)?.data) ? (bannersRes.data as any).data : [];
        const hpSecs: any[] = Array.isArray(hpRes.data) ? hpRes.data : Array.isArray((hpRes.data as any)?.data) ? (hpRes.data as any).data : [];
        if (apiPages.length === 0 && banners.length === 0 && hpSecs.length === 0) return;
        const HP_NAME: Record<string, string> = {
          HeroSlider: 'Hero Slider', Brands: 'Featured Brands', TrustBadges: 'Trust Badges',
          CategorySection: 'Category Section', FeaturedProducts: 'Featured Products',
          FlashSale: 'Flash Sale', PromoBanners: 'Promo Banners',
            promo_banners: 'Promo Banner',
          CategoryPromoBanners: 'Category Promo Banners', ProductSection: 'Products Section',
          RecentlyViewed: 'Recently Viewed', UpgradeBanner: 'Upgrade Banner',
        };
        const cmsPages: CmsPage[] = await Promise.all(apiPages.map(async (p: any) => {
          const isHome = p.slug === '/' || p.slug === 'home';
          const secs: Section[] = [];
          if (isHome) {
            if (banners.length > 0) {
              secs.push({ name: 'Hero Banner', items: banners.map((b: any) => ({ id: b.id, content: { title: b.title || '', subtitle: b.subtitle || '', description: '', button_text: b.linkText || '', button_link: b.link || '', media: b.image || '' }, status: b.isActive ? 'Active' : 'Inactive', mediaUrl: b.image })) });
            }
            [...hpSecs].sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).forEach((sec: any) => {
              const nm = HP_NAME[sec.type] || sec.type || 'Section';
              const newItem = { id: sec.id, content: Object.fromEntries(Object.entries(sec.config || {}).map(([k, v]) => [k, String(v)])), status: sec.isActive ? 'Active' : 'Inactive' };
              const existing = secs.find(s => s.name === nm);
              if (existing) { existing.items.push(newItem); }
              else { secs.push({ name: nm, items: [newItem] }); }
            });
          } else {
            try {
              const sr = await getCmsSections(p.slug).catch(() => ({ data: [] }));
              const ss: any[] = Array.isArray(sr.data) ? sr.data : Array.isArray((sr.data as any)?.data) ? (sr.data as any).data : [];
              const g: Record<string, SectionItem[]> = {};
              ss.forEach((s: any) => {
                const nm = s.name || s.type || 'Section';
                if (!g[nm]) g[nm] = [];
                g[nm].push({ id: s.id, content: Object.fromEntries(Object.entries((s.content || s.config || {})).map(([k, v]) => [k, String(v)])), status: s.isActive ? 'Active' : 'Inactive' });
              });
              Object.entries(g).forEach(([name, items]) => secs.push({ name, items }));
            } catch {}
          }
          return { id: p.id, title: p.title || p.slug, slug: p.slug, lastEdited: p.updatedAt ? String(p.updatedAt).split('T')[0] : '', status: p.status || 'Published', sections: secs };
        }));
        if (cmsPages.length > 0) setData(cmsPages);
        // Load trusted brands from site-config
        try {
          const cfgRes: any = await getCmsSiteConfigs().catch(() => ({ data: [] }));
          const configs: any[] = Array.isArray(cfgRes.data) ? cfgRes.data : Array.isArray(cfgRes?.data?.data) ? cfgRes.data.data : [];
          const tb = configs.find((c: any) => c.key === 'trusted-brands');
          if (tb?.value) {
            const parsed = typeof tb.value === 'string' ? JSON.parse(tb.value) : tb.value;
            if (Array.isArray(parsed)) setTrustedBrands(parsed);
          }
        } catch {}
      } catch {}
    };
    load();
  }, []);

  // ── API helpers (fire-and-forget, local state stays snappy) ──────────
  const _getPageSlug = (pageId: string) => data.find(p => p.id === pageId)?.slug || '/';
  const _isHome = (pageId: string) => { const s = _getPageSlug(pageId); return s === '/' || s === 'home'; };
  const _apiSave = (itemId: string, pageId: string, secName: string, content: SectionData, mediaUrl?: string) => {
    if (_isHome(pageId)) {
      if (secName === 'Hero Banner') {
        updateCmsBanner(itemId, { title: content.title, subtitle: content.subtitle, image: mediaUrl || content.media || content.image, link: content.button_link, linkText: content.button_text }).catch(() => {});
      } else {
        updateCmsHomepageSection(itemId, { config: { ...content, ...(mediaUrl ? { media: mediaUrl } : {}) } as any, isActive: true }).catch(() => {});
      }
    } else {
      updateCmsSection(itemId, { content: content as any, isActive: true }).catch(() => {});
    }
  };
  const HP_SECTION_TYPE: Record<string, string> = {
    'Hero Slider': 'HeroSlider', 'Featured Brands': 'Brands', 'Trust Badges': 'TrustBadges',
    'Category Section': 'CategorySection', 'Featured Products': 'FeaturedProducts',
    'Flash Sale': 'FlashSale', 'Promo Banners': 'PromoBanners', 'Promo Banner': 'promo_banners',
    'Category Promo Banners': 'CategoryPromoBanners', 'Products Section': 'ProductSection',
    'Recently Viewed': 'RecentlyViewed', 'Upgrade Banner': 'UpgradeBanner',
  };
  const _apiCreate = (pageId: string, secName: string, content: SectionData, mediaUrl?: string) => {
    if (_isHome(pageId)) {
      if (secName === 'Hero Banner') {
        createCmsBanner({ title: content.title, subtitle: content.subtitle, image: mediaUrl || content.media, link: content.button_link, linkText: content.button_text, isActive: true }).catch(() => {});
      } else {
        const type = HP_SECTION_TYPE[secName] || secName;
        createCmsHomepageSection({ type, config: { ...content, ...(mediaUrl ? { media: mediaUrl } : {}) }, isActive: true }).catch(() => {});
      }
    } else {
      createCmsSection({ name: secName, pageSlug: _getPageSlug(pageId), content: content as any, isActive: true }).catch(() => {});
    }
  };
  const _apiDelete = (itemId: string, pageId: string, secName: string) => {
    if (_isHome(pageId)) {
      if (secName === 'Hero Banner') { deleteCmsBanner(itemId).catch(() => {}); }
      else { deleteCmsHomepageSection(itemId).catch(() => {}); }
    } else { deleteCmsSection(itemId).catch(() => {}); }
  };
  const _apiToggle = (itemId: string, pageId: string, secName: string, active: boolean) => {
    if (_isHome(pageId)) {
      if (secName === 'Hero Banner') { updateCmsBanner(itemId, { isActive: active }).catch(() => {}); }
      else { updateCmsHomepageSection(itemId, { isActive: active }).catch(() => {}); }
    } else { updateCmsSection(itemId, { isActive: active }).catch(() => {}); }
  };
  const [view, setView] = useState<View>('pages');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const toggleSection = (secName: string) => {
    setSelectedSectionName(secName);
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(secName)) next.delete(secName); else next.add(secName);
      return next;
    });
  };
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedSectionName, setSelectedSectionName] = useState<string | null>(null);

  const selectedPage = selectedPageId ? data.find(p => p.id === selectedPageId) ?? null : null;
  const selectedSection = selectedPage && selectedSectionName
    ? selectedPage.sections.find(s => s.name === selectedSectionName) ?? null : null;

  const openPage = (pageId: string) => { setSelectedPageId(pageId); setView('sections'); };
  const openSection = (sectionName: string) => { setSelectedSectionName(sectionName); setView('items'); };
  const goBack = () => {
    if (view === 'items') { setView('sections'); setSelectedSectionName(null); }
    else if (view === 'sections') { setView('pages'); setSelectedPageId(null); }
  };

  const [addPageOpen, setAddPageOpen] = useState(false);
  const [editPage, setEditPage] = useState<CmsPage | null>(null);
  const [viewPage, setViewPage] = useState<CmsPage | null>(null);
  const [deletePage, setDeletePage] = useState<CmsPage | null>(null);
  const [pageForm, setPageForm] = useState({ ...EMPTY_PAGE_FORM });
  const pfp = (k: string) => (v: string) => setPageForm(f => ({ ...f, [k]: v }));

  const [addSectionPage, setAddSectionPage] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('Hero Banner');
  const [customSectionName, setCustomSectionName] = useState('');

  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<SectionItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<SectionItem | null>(null);

  // ── Trusted Brands ──────────────────────────────────────────────────────────────────────
  type TrustedBrand = { id: string; name: string; logo: string; slug: string };
  const [trustedBrands, setTrustedBrands] = useState<TrustedBrand[]>([]);
  const [tbOpen, setTbOpen] = useState(false);
  const [tbEditIdx, setTbEditIdx] = useState<number | null>(null);
  const [tbForm, setTbForm] = useState({ name: '', logo: '', slug: '' });
  const [tbSaving, setTbSaving] = useState(false);
  const [tbDeleteIdx, setTbDeleteIdx] = useState<number | null>(null);
  const toTbSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // ── Trusted Brands handlers ──────────────────────────────────────────────────────────────────────────
  const saveTrustedBrands = async (brands: TrustedBrand[]) => {
    setTbSaving(true);
    try {
      await upsertCmsSiteConfig('trusted-brands', brands);
      setTrustedBrands(brands);
      toast.success('Trusted brands saved');
    } catch { toast.error('Failed to save trusted brands'); }
    setTbSaving(false);
  };
  const handleTbSave = () => {
    if (!tbForm.name.trim()) { toast.error('Brand name required'); return; }
    const brand: TrustedBrand = {
      id: tbEditIdx !== null ? trustedBrands[tbEditIdx].id : 'tb-' + Date.now(),
      name: tbForm.name.trim(),
      logo: tbForm.logo,
      slug: tbForm.slug || toTbSlug(tbForm.name),
    };
    const updated = tbEditIdx !== null
      ? trustedBrands.map((b, i) => i === tbEditIdx ? brand : b)
      : [...trustedBrands, brand];
    saveTrustedBrands(updated);
    setTbOpen(false); setTbEditIdx(null); setTbForm({ name: '', logo: '', slug: '' });
  };
  const handleTbDelete = () => {
    if (tbDeleteIdx === null) return;
    saveTrustedBrands(trustedBrands.filter((_, i) => i !== tbDeleteIdx));
    setTbDeleteIdx(null);
  };

  const handleAddPage = () => {
    if (!pageForm.title.trim()) { toast.error('Title required'); return; }
    const p: CmsPage = { id: 'PG' + String(Date.now()).slice(-4), ...pageForm, sections: [], lastEdited: new Date().toISOString().split('T')[0] };
    setData(d => [...d, p]); toast.success('Page added'); setAddPageOpen(false);
  };
  const handleEditPage = () => {
    if (!editPage) return;
    setData(d => d.map(p => p.id === editPage.id ? { ...p, ...pageForm, lastEdited: new Date().toISOString().split('T')[0] } : p));
    toast.success('Page updated'); setEditPage(null);
  };
  const handleDeletePage = () => {
    if (!deletePage) return;
    setData(d => d.filter(p => p.id !== deletePage.id));
    toast.success('Page deleted'); setDeletePage(null);
    if (selectedPageId === deletePage.id) { setView('pages'); setSelectedPageId(null); }
  };
  const handleAddSection = () => {
    if (!addSectionPage) return;
    const name = newSectionName === 'Custom Section' ? customSectionName.trim() : newSectionName;
    if (!name) { toast.error('Section name required'); return; }
    setData(d => d.map(p => p.id === addSectionPage ? { ...p, sections: [...p.sections, { name, items: [] }], lastEdited: new Date().toISOString().split('T')[0] } : p));
    toast.success('"' + name + '" added'); setAddSectionPage(null); setCustomSectionName('');
  };
  const handleDeleteSection = (pageId: string, sectionName: string) => {
    setData(d => d.map(p => p.id !== pageId ? p : { ...p, sections: p.sections.filter(s => s.name !== sectionName), lastEdited: new Date().toISOString().split('T')[0] }));
    toast.success('Section removed');
    if (selectedSectionName === sectionName) { setView('sections'); setSelectedSectionName(null); }
  };
  const handleAddItem = (content: SectionData, mediaUrl?: string) => {
    if (!selectedPageId || !selectedSectionName) return;
    const item: SectionItem = { id: 'item_' + Date.now(), content, status: 'Active', mediaUrl };
    setData(d => d.map(p => p.id !== selectedPageId ? p : { ...p, lastEdited: new Date().toISOString().split('T')[0], sections: p.sections.map(s => s.name !== selectedSectionName ? s : { ...s, items: [...s.items, item] }) }));
    _apiCreate(selectedPageId, selectedSectionName, content, mediaUrl);
  };
  const handleSaveItem = (content: SectionData, mediaUrl?: string) => {
    if (!selectedPageId || !selectedSectionName || !editingItem) return;
    setData(d => d.map(p => p.id !== selectedPageId ? p : { ...p, lastEdited: new Date().toISOString().split('T')[0], sections: p.sections.map(s => s.name !== selectedSectionName ? s : { ...s, items: s.items.map(i => i.id !== editingItem.id ? i : { ...i, content, mediaUrl: mediaUrl || i.mediaUrl }) }) }));
    _apiSave(editingItem.id, selectedPageId, selectedSectionName, content, mediaUrl);
  };
  const handleDeleteItem = () => {
    if (!deletingItem || !selectedPageId || !selectedSectionName) return;
    _apiDelete(deletingItem.id, selectedPageId, selectedSectionName);
    setData(d => d.map(p => p.id !== selectedPageId ? p : { ...p, lastEdited: new Date().toISOString().split('T')[0], sections: p.sections.map(s => s.name !== selectedSectionName ? s : { ...s, items: s.items.filter(i => i.id !== deletingItem.id) }) }));
    toast.success('Deleted'); setDeletingItem(null);
  };
  const handleToggleItem = (itemId: string, cur: string, secNameOverride?: string, pageIdOverride?: string) => {
    const sn = secNameOverride ?? selectedSectionName;
    const pid = pageIdOverride ?? selectedPageId;
    if (!pid || !sn) return;
    const ns = cur === 'Active' ? 'Inactive' : 'Active';
    setData(d => d.map(p => p.id !== pid ? p : { ...p, lastEdited: new Date().toISOString().split('T')[0], sections: p.sections.map(s => s.name !== sn ? s : { ...s, items: s.items.map(i => i.id !== itemId ? i : { ...i, status: ns }) }) }));
    toast.success('Set to ' + ns);
    _apiToggle(itemId, pid, sn, ns === 'Active');
  };

  const Breadcrumb = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <button onClick={() => { setView('pages'); setSelectedPageId(null); setSelectedSectionName(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: view === 'pages' ? textMain : textMuted, fontSize: '13px', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-inter)' }}>
        <Layout size={14} /> CMS & Pages
      </button>
      {selectedPage && <><ChevronRight size={13} color={textMuted} />
        <button onClick={() => { if (view === 'items') { setView('sections'); setSelectedSectionName(null); } }} style={{ background: 'none', border: 'none', cursor: view === 'items' ? 'pointer' : 'default', color: view === 'items' ? textMuted : textMain, fontSize: '13px', fontWeight: 600, padding: 0, fontFamily: 'var(--font-inter)' }}>
          {selectedPage.title}
        </button>
      </>}
      {selectedSection && <><ChevronRight size={13} color={textMuted} /><span style={{ fontSize: '13px', fontWeight: 600, color: textMain }}>{selectedSection.name}</span></>}
    </div>
  );

  const iconMap = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      image: <ImageIcon size={18} color={accent} />, tag: <Tag size={18} color="#6366f1" />,
      mail: <Mail size={18} color="#FFC107" />, map: <MapPin size={18} color="#f59e0b" />,
      clock: <Clock size={18} color="#8b5cf6" />, text: <FileText size={18} color="#64748b" />, promo: <Eye size={18} color="#ec4899" />,
    };
    return map[type] || map.text;
  };

  const pageModalFields = (
    <>
      <FormField label="Page Title" value={pageForm.title} onChange={pfp('title')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. About Us" />
      <FormField label="Slug / URL" value={pageForm.slug} onChange={pfp('slug')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. /about" />
      <FormField label="Status" value={pageForm.status} onChange={pfp('status')} options={['Published', 'Draft']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
    </>
  );

  return (
    <div>
      {/* ── PAGES VIEW ── */}
      {view === 'pages' && (
        <div>
          <PageHeader title="CMS & Pages" subtitle="Manage your website pages and content" icon={Layout} onAdd={() => { setPageForm({ ...EMPTY_PAGE_FORM }); setAddPageOpen(true); }} addLabel="New Page" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '24px' }} className="sg">
            {[{ label: 'Total Pages', val: String(data.length), color: accent },
              { label: 'Published', val: String(data.filter(p => p.status === 'Published').length), color: accent },
              { label: 'Total Items', val: String(data.reduce((a, p) => a + p.sections.reduce((b, s) => b + s.items.length, 0), 0)), color: '#6366f1' }
            ].map(s => (
              <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: textMuted, marginBottom: '6px' }}>{s.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
          {/* ── Trusted Brands Panel ── */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: trustedBrands.length > 0 ? '12px' : '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(31,168,154,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Award size={17} color={accent} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: textMain }}>Trusted Brands</div>
                  <div style={{ fontSize: '11px', color: textMuted }}>Homepage logo section — {trustedBrands.length} brand{trustedBrands.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <button onClick={() => { setTbForm({ name: '', logo: '', slug: '' }); setTbEditIdx(null); setTbOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px', paddingInline: '12px', borderRadius: '8px', background: accent, border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'white', fontFamily: 'var(--font-inter)' }}>
                <Plus size={13} /> Add Brand
              </button>
            </div>
            {trustedBrands.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '12px 0 4px', color: textMuted, fontSize: '12px' }}>No trusted brands yet. Click &quot;Add Brand&quot; to add homepage logo entries.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {trustedBrands.map((brand, idx) => (
                  <div key={brand.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: surface, border: `1px solid ${border}`, borderRadius: '9px', padding: '10px 12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: isDark ? '#1e2a35' : '#f0f9ff', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {brand.logo ? <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} onError={(e: any) => { e.target.style.display = 'none'; }} /> : <Award size={16} color={accent} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: textMain }}>{brand.name}</div>
                      <div style={{ fontSize: '11px', color: accent, fontFamily: 'monospace' }}>/shop#brand-{brand.slug}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button onClick={() => { setTbForm({ name: brand.name, logo: brand.logo, slug: brand.slug }); setTbEditIdx(idx); setTbOpen(true); }} style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(31,168,154,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Edit size={12} color={accent} />
                      </button>
                      <button onClick={() => setTbDeleteIdx(idx)} style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={12} color='#ef4444' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.map(page => (
              <div key={page.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onClick={() => openPage(page.id)} onMouseEnter={e => (e.currentTarget.style.borderColor = accent)} onMouseLeave={e => (e.currentTarget.style.borderColor = border)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(31,168,154,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Layout size={17} color={accent} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: textMain, fontSize: '14.5px' }}>{page.title}</span>
                      <span style={{ padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: page.status === 'Published' ? 'rgba(31,168,154,0.12)' : 'rgba(255,193,7,0.12)', color: page.status === 'Published' ? accent : '#FFC107' }}>{page.status}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: textMuted, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <code style={{ fontSize: '11px', color: accent, background: 'rgba(31,168,154,0.1)', padding: '1px 6px', borderRadius: '4px' }}>{page.slug}</code>
                      <span>{page.sections.length} sections</span>
                      <span>Edited {page.lastEdited}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={e => { e.stopPropagation(); setPageForm({ title: page.title, slug: page.slug, status: page.status }); setEditPage(page); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '28px', paddingInline: '10px', borderRadius: '7px', background: 'rgba(31,168,154,0.1)', border: 'none', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, color: accent, fontFamily: 'var(--font-inter)' }}>
                        <Edit size={11} /> Edit
                      </button>
                      <button onClick={e => { e.stopPropagation(); setViewPage(page); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '28px', paddingInline: '10px', borderRadius: '7px', background: 'rgba(99,102,241,0.1)', border: 'none', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, color: '#6366f1', fontFamily: 'var(--font-inter)' }}>
                        <Eye size={11} /> View
                      </button>
                      <button onClick={e => { e.stopPropagation(); setDeletePage(page); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '28px', paddingInline: '10px', borderRadius: '7px', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, color: '#ef4444', fontFamily: 'var(--font-inter)' }}>
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                  <ChevronRight size={16} color={textMuted} style={{ flexShrink: 0, marginTop: '10px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTIONS VIEW ── */}
      {view === 'sections' && selectedPage && (
        <div>
          <Breadcrumb />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isDark ? '#1E293B' : '#F1F5F9', border: `1px solid ${border}`, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', color: textMain, fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-inter)', marginBottom: '10px' }}>
                <ChevronLeft size={14} /> Back to Pages
              </button>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: textMain, margin: 0 }}>{selectedPage.title}</h2>
              <p style={{ fontSize: '13px', color: textMuted, margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ fontSize: '11px', color: accent, background: 'rgba(31,168,154,0.1)', padding: '1px 7px', borderRadius: '4px' }}>{selectedPage.slug}</code>
                <span>{selectedPage.sections.length} sections</span>
              </p>
            </div>
            <button onClick={() => { setAddSectionPage(selectedPage.id); setNewSectionName('Hero Banner'); setCustomSectionName(''); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#1FA89A,#27B9AF)', border: 'none', borderRadius: '9px', color: 'white', fontSize: '13.5px', fontWeight: 600, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-inter)', boxShadow: '0 4px 12px rgba(31,168,154,0.25)' }}>
              <Plus size={15} /> Add Section
            </button>
          </div>
          {selectedPage.sections.length === 0 ? (
            <div style={{ padding: '48px 20px', background: card, border: `1px dashed ${border}`, borderRadius: '12px', textAlign: 'center', color: textMuted }}>
              <Layout size={32} color={textMuted} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>No sections yet</div>
              <div style={{ fontSize: '12.5px' }}>Click &quot;Add Section&quot; to start building this page.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedPage.sections.map((sec, idx) => {
                const active = sec.items.filter(i => i.status === 'Active').length;
                return (
                  <div key={idx} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onClick={() => openSection(sec.name)} onMouseEnter={e => (e.currentTarget.style.borderColor = accent)} onMouseLeave={e => (e.currentTarget.style.borderColor = border)}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: 'rgba(31,168,154,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {iconMap(getSectionIconType(sec.name))}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: textMain, fontSize: '14px' }}>{sec.name}</div>
                      <div style={{ fontSize: '12px', color: textMuted, marginTop: '3px', display: 'flex', gap: '10px' }}>
                        <span>{sec.items.length} {sec.items.length === 1 ? 'item' : 'items'}</span>
                        {sec.items.length > 0 && <span style={{ color: accent, fontWeight: 600 }}>{active} active</span>}
                        {sectionHasMedia(sec.name) && <span style={{ color: '#6366f1' }}>has media</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button onClick={e => { e.stopPropagation(); if (confirm('Remove "' + sec.name + '" section?')) handleDeleteSection(selectedPage.id, sec.name); }} style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(239,68,68,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={12} color="#ef4444" />
                      </button>
                      <ChevronRight size={16} color={textMuted} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ITEMS VIEW ── */}
      {view === 'items' && selectedPage && selectedSection && (
        <div>
          <Breadcrumb />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isDark ? '#1E293B' : '#F1F5F9', border: `1px solid ${border}`, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', color: textMain, fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-inter)', marginBottom: '10px' }}>
                <ChevronLeft size={14} /> Back to Sections
              </button>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: textMain, margin: 0 }}>{selectedSection.name}</h2>
              <p style={{ fontSize: '13px', color: textMuted, margin: '3px 0 0' }}>{selectedPage.title} — {selectedSection.items.length} {selectedSection.items.length === 1 ? 'item' : 'items'}</p>
            </div>
            <button onClick={() => setAddingItem(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#1FA89A,#27B9AF)', border: 'none', borderRadius: '9px', color: 'white', fontSize: '13.5px', fontWeight: 600, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-inter)', boxShadow: '0 4px 12px rgba(31,168,154,0.25)' }}>
              <Plus size={15} /> Add New {selectedSection.name}
            </button>
          </div>
          {selectedSection.items.length === 0 ? (
            <div style={{ padding: '48px 20px', background: card, border: `1px dashed ${border}`, borderRadius: '12px', textAlign: 'center', color: textMuted }}>
              <ImageIcon size={32} color={textMuted} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>No items yet</div>
              <div style={{ fontSize: '12.5px' }}>Click &quot;Add New {selectedSection.name}&quot; to upload your first item.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '14px' }} className="items-grid">
              {selectedSection.items.map(item => {
                const hasMedia = sectionHasMedia(selectedSection.name);
                return (
                  <div key={item.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {hasMedia && (
                      <div style={{ height: '160px', background: surface, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {item.mediaUrl ? (
                          item.content.media?.match(/\.(mp4|mov|avi|webm)$/i) ? (
                            <video src={item.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src={item.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          )
                        ) : item.content.media ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', textAlign: 'center' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(31,168,154,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageIcon size={22} color={accent} />
                            </div>
                            <span style={{ fontSize: '11px', color: textMuted, wordBreak: 'break-all' }}>{item.content.media}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.3 }}>
                            <ImageIcon size={36} color={textMuted} />
                            <span style={{ fontSize: '11.5px', color: textMuted }}>No image uploaded</span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: item.status === 'Active' ? 'rgba(31,168,154,0.9)' : 'rgba(100,116,139,0.85)', color: 'white' }}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    )}
                    <div style={{ padding: '12px 14px', flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: textMain, lineHeight: 1.3, marginBottom: '4px' }}>
                        {getItemPreview(selectedSection.name, item.content)}
                      </div>
                      {getItemSub(item.content) && (
                        <div style={{ fontSize: '12px', color: textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {getItemSub(item.content)}
                        </div>
                      )}
                      {!hasMedia && (
                        <span style={{ display: 'inline-block', marginTop: '6px', padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: item.status === 'Active' ? 'rgba(31,168,154,0.12)' : 'rgba(100,116,139,0.12)', color: item.status === 'Active' ? accent : '#8E9AAF' }}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', padding: '0 14px 14px' }}>
                      <button onClick={() => setEditingItem(item)} style={{ flex: 1, height: '34px', borderRadius: '8px', background: 'rgba(31,168,154,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, color: accent, fontFamily: 'var(--font-inter)' }}>
                        <Edit size={13} /> Edit
                      </button>
                      <button onClick={() => handleToggleItem(item.id, item.status)} style={{ flex: 1, height: '34px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, fontFamily: 'var(--font-inter)', background: item.status === 'Active' ? 'rgba(100,116,139,0.1)' : 'rgba(31,168,154,0.1)', color: item.status === 'Active' ? '#8E9AAF' : accent }}>
                        {item.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => setDeletingItem(item)} style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <Trash2 size={13} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <Modal open={addPageOpen} onClose={() => setAddPageOpen(false)} title="Add New Page">
        {pageModalFields}
        <ModalFooter onClose={() => setAddPageOpen(false)} onSubmit={handleAddPage} loading={false} submitLabel="Add Page" isDark={isDark} border={border} textMain={textMain} />
      </Modal>
      <Modal open={!!editPage} onClose={() => setEditPage(null)} title={'Edit: ' + (editPage?.title ?? '')}>
        {pageModalFields}
        <ModalFooter onClose={() => setEditPage(null)} onSubmit={handleEditPage} loading={false} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} />
      </Modal>
      <Modal open={!!viewPage} onClose={() => setViewPage(null)} title="Page Details">
        {viewPage && <>
          <FormField label="Title" value={viewPage.title} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Slug" value={viewPage.slug} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <FormField label="Status" value={viewPage.status} readOnly isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <button onClick={() => setViewPage(null)} style={{ width: '100%', padding: '10px', borderRadius: '9px', background: isDark ? '#1E293B' : '#F1F5F9', border: `1px solid ${border}`, color: textMain, fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>Close</button>
        </>}
      </Modal>
      <ConfirmDialog open={!!deletePage} onClose={() => setDeletePage(null)} onConfirm={handleDeletePage} loading={false} title="Delete Page" message={'Delete "' + deletePage?.title + '" permanently?'} />
      <Modal open={!!addSectionPage} onClose={() => setAddSectionPage(null)} title="Add Section">
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Section Type</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ADD_SECTION_NAMES.map(name => (
              <button key={name} onClick={() => setNewSectionName(name)} style={{ padding: '7px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-inter)', background: newSectionName === name ? accent : surface, border: `1px solid ${newSectionName === name ? accent : border}`, color: newSectionName === name ? 'white' : textMuted }}>{name}</button>
            ))}
          </div>
        </div>
        {newSectionName === 'Custom Section' && (
          <FormField label="Custom Section Name" value={customSectionName} onChange={setCustomSectionName} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. Testimonials" />
        )}
        <ModalFooter onClose={() => setAddSectionPage(null)} onSubmit={handleAddSection} loading={false} submitLabel="Add Section" isDark={isDark} border={border} textMain={textMain} />
      </Modal>
      {addingItem && selectedSection && selectedPage && (
        <ItemFormModal sectionName={selectedSection.name} pageTitle={selectedPage.title} initialValues={{}} onClose={() => setAddingItem(false)} onSave={handleAddItem} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} isEdit={false} />
      )}
      {editingItem && selectedSection && selectedPage && (
        <ItemFormModal sectionName={selectedSection.name} pageTitle={selectedPage.title} initialValues={editingItem.content} onClose={() => setEditingItem(null)} onSave={handleSaveItem} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} isEdit={true} />
      )}
      <ConfirmDialog open={!!deletingItem} onClose={() => setDeletingItem(null)} onConfirm={handleDeleteItem} loading={false} title="Delete Item" message={'Delete "' + (deletingItem ? getItemPreview(selectedSection?.name || '', deletingItem.content) : '') + '" permanently?'} />
      {/* ── Trusted Brands Modal ── */}
      <Modal open={tbOpen} onClose={() => { setTbOpen(false); setTbEditIdx(null); }} title={tbEditIdx !== null ? 'Edit Brand' : 'Add Trusted Brand'}>
        <FormField label="Brand Name *" value={tbForm.name} onChange={(v) => setTbForm(f => ({ ...f, name: v, ...(tbEditIdx === null ? { slug: toTbSlug(v) } : {}) }))} placeholder="e.g. Samsung" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: textMuted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Brand Logo</label>
          <FileUpload value={tbForm.logo} onChange={(v) => setTbForm(f => ({ ...f, logo: v }))} isDark={isDark} border={border} surface={surface} textMuted={textMuted} />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <FormField label="Shop Scroll Anchor" value={tbForm.slug} onChange={(v) => setTbForm(f => ({ ...f, slug: v }))} placeholder="e.g. samsung" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
          <p style={{ fontSize: '11px', color: textMuted, marginTop: '4px', marginBottom: 0 }}>When clicked on homepage → auto-scrolls to /shop#brand-{tbForm.slug || '...'}</p>
        </div>
        <ModalFooter onClose={() => { setTbOpen(false); setTbEditIdx(null); }} onSubmit={handleTbSave} loading={tbSaving} submitLabel={tbEditIdx !== null ? 'Save Changes' : 'Add Brand'} isDark={isDark} border={border} textMain={textMain} />
      </Modal>
      <ConfirmDialog open={tbDeleteIdx !== null} onClose={() => setTbDeleteIdx(null)} onConfirm={handleTbDelete} loading={tbSaving} title="Delete Brand" message={tbDeleteIdx !== null ? `Delete "${trustedBrands[tbDeleteIdx]?.name}" from trusted brands?` : 'Delete this brand?'} />

      <style>{`.sg{} @media(max-width:768px){.sg{grid-template-columns:1fr!important;}.items-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

export default function CMSPagesPage() { return <AdminShell><CMSContent /></AdminShell>; }

