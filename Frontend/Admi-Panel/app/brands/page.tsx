'use client';
import { useState, useEffect, useRef } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, ConfirmDialog, FormField, ModalFooter } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { Award, Upload, X } from 'lucide-react';
import { createBrand, updateBrand, deleteBrand, getBrands } from '@/lib/api';
import toast from 'react-hot-toast';

type Brand = {
  id: string; name: string; slug: string; products: number; country: string; status: string;
  website: string; description: string; logoUrl: string;
};

const EMPTY_FORM = { name: '', slug: '', country: '', status: 'Active', website: '', description: '', logoUrl: '' };
const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Inline logo upload component — file picker + base64 + URL fallback */
function LogoUpload({
  value, onChange, isDark, border, textMain, textMuted, surface,
}: {
  value: string; onChange: (v: string) => void;
  isDark: boolean; border: string; textMain: string; textMuted: string; surface: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Brand Logo
      </div>

      {/* Preview + Remove */}
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: surface, border: `1px solid ${border}`, borderRadius: '10px', marginBottom: '10px' }}>
          <div style={{ width: '80px', height: '44px', background: isDark ? '#1a2535' : '#f8fafc', border: `1px solid ${border}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            <img src={value} alt="logo preview" style={{ maxWidth: '72px', maxHeight: '38px', objectFit: 'contain' }} onError={() => {}} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: textMain, fontSize: '12px', fontWeight: 600 }}>Logo preview</div>
            <div style={{ color: textMuted, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {value.startsWith('data:') ? 'Uploaded image' : value}
            </div>
          </div>
          <button onClick={() => { onChange(''); if (inputRef.current) inputRef.current.value = ''; }}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#ef4444', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <X size={11} /> Remove
          </button>
        </div>
      ) : null}

      {/* Upload button */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(31,168,154,0.1)', border: '1px solid rgba(31,168,154,0.4)', borderRadius: '8px', cursor: 'pointer', color: '#1FA89A', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
          <Upload size={13} /> Upload Image
        </button>
        <span style={{ color: textMuted, fontSize: '11px' }}>or</span>
        <input
          value={value.startsWith('data:') ? '' : value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste image URL..."
          style={{ flex: 1, padding: '8px 10px', background: surface, border: `1px solid ${border}`, borderRadius: '8px', color: textMain, fontSize: '12px', outline: 'none' }}
        />
      </div>
      <div style={{ fontSize: '11px', color: textMuted, marginTop: '5px' }}>
        JPG / PNG / WebP · max 2 MB. This logo shows on the homepage brands section.
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

function BrandsContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF'; const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A'; const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';

  const [data, setData] = useState<Brand[]>([]);
  useEffect(() => {
    getBrands({ limit: 200 }).then((r: any) => {
      const raw: any[] = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [];
      const normalized: Brand[] = raw.map((b: any) => ({
        id: b.id || '',
        name: b.name || '',
        slug: b.slug || '',
        country: b.country || '',
        status: b.isActive !== false ? 'Active' : 'Inactive',
        website: b.website || '',
        description: b.description || '',
        logoUrl: b.logo || b.logoUrl || b.imageUrl || '',
        products: b._count?.products ?? 0,
      }));
      setData(normalized);
    }).catch(() => {});
  }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Brand | null>(null);
  const [deleteRow, setDeleteRow] = useState<Brand | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  const fp = (k: string) => (v: string) => setForm(f => {
    const updated = { ...f, [k]: v };
    if (k === 'name') updated.slug = toSlug(v);
    return updated;
  });

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setAddOpen(true); };
  const openEdit = (row: Record<string, unknown>) => {
    const r = row as unknown as Brand;
    setForm({ name: r.name, slug: r.slug, country: r.country, status: r.status, website: r.website || '', description: r.description || '', logoUrl: r.logoUrl || '' });
    setEditRow(r);
  };
  const openDelete = (row: Record<string, unknown>) => setDeleteRow(row as unknown as Brand);

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error('Brand name is required'); return; }
    setLoading(true);
    try {
      await createBrand({
        name: form.name,
        slug: form.slug || toSlug(form.name),
        logo: form.logoUrl || undefined,
        country: form.country || undefined,
        description: form.description || undefined,
        website: form.website || undefined,
        isActive: form.status === 'Active',
      });
      // Reload from API to get real numeric ID from backend
      const refreshed = await getBrands({ limit: 200 });
      const raw2: any[] = Array.isArray(refreshed.data?.data) ? refreshed.data.data : Array.isArray(refreshed.data) ? refreshed.data : [];
      setData(raw2.map((b: any) => ({ id: String(b.id || ''), name: b.name || '', slug: b.slug || '', country: b.country || '', status: b.isActive !== false ? 'Active' : 'Inactive', website: b.website || '', description: b.description || '', logoUrl: b.logo || b.logoUrl || '', products: b._count?.products ?? 0 })));
      toast.success('Brand added'); setAddOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : (msg || 'Failed to add brand'));
    }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!editRow) return;
    setLoading(true);
    try {
      await updateBrand(String(editRow.id), {
        name: form.name,
        slug: form.slug || undefined,
        logo: form.logoUrl || undefined,
        country: form.country || undefined,
        description: form.description || undefined,
        website: form.website || undefined,
        isActive: form.status === 'Active',
      });
      setData(d => d.map(b => b.id === editRow.id ? { ...b, ...form } : b));
      toast.success('Brand updated'); setEditRow(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : (msg || 'Failed to update brand'));
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteRow) return;
    setLoading(true);
    try {
      await deleteBrand(deleteRow.id);
      setData(d => d.filter(b => b.id !== deleteRow.id));
      toast.success('Brand deleted'); setDeleteRow(null);
    } catch { toast.error('Failed to delete brand — check your API connection'); }
    setLoading(false);
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID', width: '90px' },
    { key: 'name', label: 'Brand', render: (v, row) => {
      const brand = row as unknown as Brand;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {brand.logoUrl ? (
            <div style={{ width: '44px', height: '32px', borderRadius: '6px', background: isDark ? '#1a2535' : '#f1f5f9', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src={brand.logoUrl} alt={brand.name} style={{ maxWidth: '40px', maxHeight: '28px', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          ) : (
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(31,168,154,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#1FA89A', flexShrink: 0 }}>
              {String(v).charAt(0)}
            </div>
          )}
          <span style={{ fontWeight: 600, color: textMain }}>{String(v)}</span>
        </div>
      );
    }},
    { key: 'slug', label: 'Slug', render: (v) => <code style={{ fontSize: '12px', color: '#1FA89A', background: 'rgba(31,168,154,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{String(v)}</code> },
    { key: 'description', label: 'Description', render: (v) => <span style={{ color: textMuted, fontSize: '12px' }}>{String(v).slice(0, 45)}{String(v).length > 45 ? '...' : ''}</span> },
    { key: 'website', label: 'Website', render: (v) => v ? <a href={String(v)} target="_blank" rel="noreferrer" style={{ color: '#6366f1', fontSize: '12px' }}>{String(v).replace('https://', '').replace('http://', '')}</a> : <span style={{ color: textMuted }}>—</span> },
    { key: 'products', label: 'Products', render: (v) => <span style={{ fontWeight: 700, color: '#6366f1' }}>{String(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: v === 'Active' ? 'rgba(31,168,154,0.12)' : 'rgba(100,116,139,0.1)', color: v === 'Active' ? '#1FA89A' : '#8E9AAF' }}>{String(v)}</span> },
  ];

  const formFields = (
    <>
      <FormField label="Brand Name *" value={form.name} onChange={fp('name')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. Nike" />
      <FormField label="Slug (auto-generated)" value={form.slug} onChange={fp('slug')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="auto-generated" />
      <FormField label="Description" value={form.description} onChange={fp('description')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="Brief description of this brand..." type="textarea" />
      <FormField label="Website URL" value={form.website} onChange={fp('website')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="https://..." />
      <FormField label="Country of Origin" value={form.country} onChange={fp('country')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. USA, Germany, Japan" />
      <LogoUpload value={form.logoUrl} onChange={fp('logoUrl')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
      <FormField label="Status" value={form.status} onChange={fp('status')} options={['Active', 'Inactive']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
    </>
  );

  return (
    <div>
      <PageHeader title="Brands" subtitle="Manage product brands" icon={Award} onAdd={openAdd} addLabel="Add Brand" />
      <DataTable columns={columns} data={data as unknown as Record<string, unknown>[]} searchPlaceholder="Search brands..." onEdit={openEdit} onDelete={openDelete} />

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Brand">
        {formFields}
        <ModalFooter onClose={() => setAddOpen(false)} onSubmit={handleAdd} loading={loading} submitLabel="Add Brand" isDark={isDark} border={border} textMain={textMain} />
      </Modal>

      <Modal open={!!editRow} onClose={() => setEditRow(null)} title={`Edit Brand: ${editRow?.name ?? ''}`}>
        {formFields}
        <ModalFooter onClose={() => setEditRow(null)} onSubmit={handleEdit} loading={loading} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} />
      </Modal>

      <ConfirmDialog open={!!deleteRow} onClose={() => setDeleteRow(null)} onConfirm={handleDelete} loading={loading} title="Delete Brand" message={`Delete "${deleteRow?.name}" permanently?`} />
    </div>
  );
}

export default function BrandsPage() { return <AdminShell><BrandsContent /></AdminShell>; }
