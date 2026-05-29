'use client';
import { useState } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, ConfirmDialog, FormField, ModalFooter } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { Award } from 'lucide-react';
import { createBrand, updateBrand, deleteBrand } from '@/lib/api';
import toast from 'react-hot-toast';

type Brand = {
  id: string; name: string; slug: string; products: number; country: string; status: string;
  website: string; description: string; logoUrl: string;
};

const INITIAL: Brand[] = [
  { id: 'BRD001', name: 'Apple', slug: 'apple', products: 28, country: 'USA', status: 'Active', website: 'https://apple.com', description: 'Consumer electronics and software.', logoUrl: '' },
  { id: 'BRD002', name: 'Samsung', slug: 'samsung', products: 22, country: 'South Korea', status: 'Active', website: 'https://samsung.com', description: 'Electronics, semiconductors and more.', logoUrl: '' },
  { id: 'BRD003', name: 'Sony', slug: 'sony', products: 15, country: 'Japan', status: 'Active', website: 'https://sony.com', description: 'Audio, cameras and entertainment.', logoUrl: '' },
  { id: 'BRD004', name: 'Beats', slug: 'beats', products: 8, country: 'USA', status: 'Active', website: 'https://beatsbydre.com', description: 'Premium audio equipment.', logoUrl: '' },
  { id: 'BRD005', name: 'Bose', slug: 'bose', products: 6, country: 'USA', status: 'Active', website: 'https://bose.com', description: 'High-fidelity audio products.', logoUrl: '' },
  { id: 'BRD006', name: 'Dell', slug: 'dell', products: 10, country: 'USA', status: 'Inactive', website: 'https://dell.com', description: 'Computers and peripherals.', logoUrl: '' },
  { id: 'BRD007', name: 'LG', slug: 'lg', products: 12, country: 'South Korea', status: 'Active', website: 'https://lg.com', description: 'Home appliances and electronics.', logoUrl: '' },
  { id: 'BRD008', name: 'Huawei', slug: 'huawei', products: 5, country: 'China', status: 'Active', website: 'https://huawei.com', description: 'Smartphones and telecommunications.', logoUrl: '' },
];

const EMPTY_FORM = { name: '', slug: '', country: '', status: 'Active', website: '', description: '', logoUrl: '' };
const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function BrandsContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF'; const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A'; const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';

  const [data, setData] = useState<Brand[]>(INITIAL);
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
      await createBrand(form);
      const newItem: Brand = { id: `BRD${String(Date.now()).slice(-3)}`, ...form, products: 0 };
      setData(d => [...d, newItem]);
      toast.success('Brand added'); setAddOpen(false);
    } catch { toast.error('Failed to add brand — check your API connection'); }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!editRow) return;
    setLoading(true);
    try {
      await updateBrand(editRow.id, form);
      setData(d => d.map(b => b.id === editRow.id ? { ...b, ...form } : b));
      toast.success('Brand updated'); setEditRow(null);
    } catch { toast.error('Failed to update brand — check your API connection'); }
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
    { key: 'name', label: 'Brand', render: (v) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(31,168,154,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#1FA89A' }}>{String(v).charAt(0)}</div>
        <span style={{ fontWeight: 600, color: textMain }}>{String(v)}</span>
      </div>
    )},
    { key: 'slug', label: 'Slug', render: (v) => <code style={{ fontSize: '12px', color: '#1FA89A', background: 'rgba(31,168,154,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{String(v)}</code> },
    { key: 'country', label: 'Country' },
    { key: 'description', label: 'Description', render: (v) => <span style={{ color: textMuted, fontSize: '12px' }}>{String(v).slice(0, 40)}{String(v).length > 40 ? '...' : ''}</span> },
    { key: 'website', label: 'Website', render: (v) => v ? <a href={String(v)} target="_blank" rel="noreferrer" style={{ color: '#6366f1', fontSize: '12px' }}>{String(v).replace('https://', '')}</a> : <span style={{ color: textMuted }}>—</span> },
    { key: 'products', label: 'Products', render: (v) => <span style={{ fontWeight: 700, color: '#6366f1' }}>{String(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: v === 'Active' ? 'rgba(31,168,154,0.12)' : 'rgba(100,116,139,0.1)', color: v === 'Active' ? '#1FA89A' : '#8E9AAF' }}>{String(v)}</span> },
  ];

  const formFields = (
    <>
      <FormField label="Brand Name *" value={form.name} onChange={fp('name')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. Nike" />
      <FormField label="Slug (auto-generated)" value={form.slug} onChange={fp('slug')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="auto-generated" />
      <FormField label="Description" value={form.description} onChange={fp('description')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="Brief description of this brand..." type="textarea" />
      <FormField label="Country" value={form.country} onChange={fp('country')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. USA" />
      <FormField label="Website URL" value={form.website} onChange={fp('website')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="https://..." />
      <FormField label="Logo Image URL" value={form.logoUrl} onChange={fp('logoUrl')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="https://... (logo image link)" />
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
