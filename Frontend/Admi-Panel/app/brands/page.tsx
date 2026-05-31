'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, ConfirmDialog, FormField, ModalFooter } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { Award } from 'lucide-react';
import { createBrand, updateBrand, deleteBrand, getBrands } from '@/lib/api';
import toast from 'react-hot-toast';

type Brand = {
  id: string; name: string; slug: string; products: number; country: string; status: string;
  website: string; description: string;
};

const EMPTY_FORM = { name: '', slug: '', country: '', status: 'Active', website: '', description: '' };
const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function BrandsPage() {
  const { isDark, colors } = useTheme();
  const { bg, surface, border, textMain, textMuted, accent } = colors;

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<Brand | null>(null);
  const [deleteRow, setDeleteRow] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const load = () => {
    setLoading(true);
    getBrands().then((data: any) => {
      setBrands(
        (data || []).map((b: any) => ({
          id: String(b.id ?? b._id ?? ''),
          name: b.name ?? '',
          slug: b.slug ?? '',
          products: b._count?.products ?? b.products ?? 0,
          country: b.country ?? '',
          status: b.isActive === false ? 'Inactive' : 'Active',
          website: b.website ?? '',
          description: b.description ?? '',
        }))
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditRow(null); setModalOpen(true); };
  const openEdit = (row: Brand) => { setForm({ name: row.name, slug: row.slug, country: row.country, status: row.status, website: row.website, description: row.description }); setEditRow(row); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Brand name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug || toSlug(form.name),
        country: form.country,
        isActive: form.status === 'Active',
        website: form.website,
        description: form.description,
      };
      if (editRow) { await updateBrand(editRow.id, payload); toast.success('Brand updated'); }
      else { await createBrand(payload); toast.success('Brand created'); }
      setModalOpen(false);
      load();
    } catch (e: any) { toast.error(e?.message ?? 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteRow) return;
    setDeleting(true);
    try { await deleteBrand(deleteRow.id); toast.success('Brand deleted'); setDeleteRow(null); load(); }
    catch (e: any) { toast.error(e?.message ?? 'Delete failed'); }
    setDeleting(false);
  };

  const f = (k: keyof typeof form, v: string) => {
    setForm((p) => ({
      ...p,
      [k]: v,
      ...(k === 'name' && !editRow ? { slug: toSlug(v) } : {}),
    }));
  };

  const COLS: Column<Brand>[] = [
    { key: 'name', label: 'Brand Name', render: (v, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: isDark ? '#1e2a35' : '#f0f9ff', border: `1px solid ${border}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Award size={14} style={{ color: accent }} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: textMain }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: textMuted }}>/{row.slug}</div>
        </div>
      </div>
    )},
    { key: 'products', label: 'Products', render: (v) => (
      <span style={{ background: isDark ? '#1e2a35' : '#f0f9ff', color: accent, fontWeight: 700, fontSize: '12px', padding: '2px 10px', borderRadius: '20px' }}>{v ?? 0}</span>
    )},
    { key: 'country', label: 'Country', render: (v) => <span style={{ color: textMuted, fontSize: '12px' }}>{v || '—'}</span> },
    { key: 'status', label: 'Status', render: (v) => (
      <span style={{ background: v === 'Active' ? (isDark ? '#0d2e1a' : '#dcfce7') : (isDark ? '#2e1515' : '#fee2e2'), color: v === 'Active' ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '11px', padding: '2px 10px', borderRadius: '20px' }}>{v}</span>
    )},
    { key: 'slug', label: 'Shop Anchor', render: (v) => (
      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: accent, background: isDark ? '#0d1a2e' : '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>#{v}</span>
    )},
  ];

  return (
    <AdminShell>
      <div style={{ padding: '24px', background: bg, minHeight: '100vh' }}>
        <PageHeader
          title="Brands"
          description="Manage brands for product organisation and shop navigation"
          icon={<Award size={20} style={{ color: accent }} />}
          action={{ label: 'Add Brand', onClick: openAdd }}
        />

        <DataTable
          columns={COLS}
          data={brands}
          loading={loading}
          onEdit={openEdit}
          onDelete={(row) => setDeleteRow(row)}
          emptyMessage="No brands yet. Add your first brand."
        />

        {/* Add / Edit Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editRow ? 'Edit Brand' : 'Add Brand'}>
          <FormField label="Brand Name *" value={form.name} onChange={(v) => f('name', v)} placeholder="e.g. Samsung" />
          <FormField
            label="Shop Scroll Anchor (auto-generated from name)"
            value={form.slug}
            onChange={(v) => f('slug', v)}
            placeholder="e.g. samsung"
            hint="Used to auto-scroll to this brand section in the shop when clicked"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Country" value={form.country} onChange={(v) => f('country', v)} placeholder="e.g. South Korea" />
            <FormField label="Status" type="select" value={form.status} onChange={(v) => f('status', v)} options={['Active', 'Inactive']} />
          </div>
          <FormField label="Website" value={form.website} onChange={(v) => f('website', v)} placeholder="https://samsung.com" />
          <FormField label="Description" type="textarea" value={form.description} onChange={(v) => f('description', v)} placeholder="Short description of this brand" />
          <ModalFooter onCancel={() => setModalOpen(false)} onSave={handleSave} saving={saving} />
        </Modal>

        <ConfirmDialog open={!!deleteRow} onCancel={() => setDeleteRow(null)} onConfirm={handleDelete} loading={deleting} title="Delete Brand" message={`Delete "${deleteRow?.name}" permanently?`} />
      </div>
    </AdminShell>
  );
}
