'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/admin-shell';
import DataTable, { Column } from '@/components/admin/data-table';
import PageHeader from '@/components/admin/page-header';
import { Modal, ConfirmDialog, FormField, ModalFooter } from '@/components/admin/modal';
import { useTheme } from '@/contexts/theme-context';
import { Tag } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory, getCategories } from '@/lib/api';
import toast from 'react-hot-toast';

type Category = {
  id: string; name: string; slug: string; products: number; status: string; parent: string;
  description: string; imageUrl: string; showOnHome: boolean;
};

// Category data loaded from API

const PARENT_OPTIONS = ['-', 'Electronics', 'Clothing', 'Food & Beverages', 'Sports'];
const EMPTY_FORM = { name: '', slug: '', parent: '-', status: 'Active', description: '', imageUrl: '', showOnHome: 'No' };

function toSlug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

function CategoriesContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const card = isDark ? '#0D1523' : '#FFFFFF'; const border = isDark ? '#1E293B' : '#E2E8F0';
  const textMain = isDark ? '#FFFFFF' : '#0F172A'; const textMuted = isDark ? '#8E9AAF' : '#64748B';
  const surface = isDark ? '#101826' : '#F1F5F9';

  const [data, setData] = useState<Category[]>([]);
  useEffect(() => {
    getCategories({ limit: 500 }).then((r: any) => {
      const raw: any[] = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [];
      const normalized: Category[] = raw.map((c: any) => ({
        id: c.id || '',
        name: c.name || '',
        slug: c.slug || '',
        parent: c.parent?.name || c.parentId || '-',
        status: c.isActive !== false ? 'Active' : 'Inactive',
        description: c.description || '',
        imageUrl: c.image || c.imageUrl || '',
        showOnHome: Boolean(c.showOnHome),
        products: c._count?.products ?? 0,
      }));
      setData(normalized);
    }).catch(() => {});
  }, []);
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Category | null>(null);
  const [deleteRow, setDeleteRow] = useState<Category | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  const fp = (k: string) => (v: string) => {
    setForm(f => {
      const updated = { ...f, [k]: v };
      if (k === 'name') updated.slug = toSlug(v);
      return updated;
    });
  };

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setAddOpen(true); };
  const openEdit = (row: Record<string, unknown>) => {
    const r = row as unknown as Category;
    setForm({ name: r.name, slug: r.slug, parent: r.parent, status: r.status, description: r.description || '', imageUrl: r.imageUrl || '', showOnHome: r.showOnHome ? 'Yes' : 'No' });
    setEditRow(r);
  };
  const openDelete = (row: Record<string, unknown>) => setDeleteRow(row as unknown as Category);

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setLoading(true);
    try {
      await createCategory(form);
      const newItem: Category = { id: `CAT${String(Date.now()).slice(-3)}`, ...form, products: 0, showOnHome: form.showOnHome === 'Yes' };
      setData(d => [...d, newItem]);
      toast.success('Category added'); setAddOpen(false);
    } catch { toast.error('Failed to add category — check your API connection'); }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!editRow) return;
    setLoading(true);
    try {
      await updateCategory(editRow.id, form);
      setData(d => d.map(c => c.id === editRow.id ? { ...c, ...form, showOnHome: form.showOnHome === 'Yes' } : c));
      toast.success('Category updated'); setEditRow(null);
    } catch { toast.error('Failed to update category — check your API connection'); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteRow) return;
    setLoading(true);
    try {
      await deleteCategory(deleteRow.id);
      setData(d => d.filter(c => c.id !== deleteRow.id));
      toast.success('Category deleted'); setDeleteRow(null);
    } catch { toast.error('Failed to delete category — check your API connection'); }
    setLoading(false);
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID', width: '90px' },
    { key: 'name', label: 'Category', render: (v) => <span style={{ fontWeight: 600, color: textMain }}>{String(v)}</span> },
    { key: 'slug', label: 'Slug', render: (v) => <code style={{ fontSize: '12px', color: '#1FA89A', background: 'rgba(31,168,154,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{String(v)}</code> },
    { key: 'parent', label: 'Parent' },
    { key: 'description', label: 'Description', render: (v) => <span style={{ color: textMuted, fontSize: '12px' }}>{String(v).slice(0, 40)}{String(v).length > 40 ? '...' : ''}</span> },
    { key: 'showOnHome', label: 'On Home', render: (v) => <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, background: v ? 'rgba(31,168,154,0.12)' : 'rgba(100,116,139,0.1)', color: v ? '#1FA89A' : '#8E9AAF' }}>{v ? 'Yes' : 'No'}</span> },
    { key: 'products', label: 'Products', render: (v) => <span style={{ fontWeight: 700, color: '#6366f1' }}>{String(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: v === 'Active' ? 'rgba(31,168,154,0.12)' : 'rgba(100,116,139,0.1)', color: v === 'Active' ? '#1FA89A' : '#8E9AAF' }}>{String(v)}</span> },
  ];

  const formFields = (
    <>
      <FormField label="Category Name *" value={form.name} onChange={fp('name')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="e.g. Electronics" />
      <FormField label="Slug (auto-generated)" value={form.slug} onChange={fp('slug')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="auto-generated" />
      <FormField label="Description" value={form.description} onChange={fp('description')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="Brief description of this category..." type="textarea" />
      <FormField label="Parent Category" value={form.parent} onChange={fp('parent')} options={PARENT_OPTIONS} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
      <FormField label="Image URL" value={form.imageUrl} onChange={fp('imageUrl')} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} placeholder="https://..." />
      <FormField label="Show on Homepage" value={form.showOnHome} onChange={fp('showOnHome')} options={['Yes', 'No']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
      <FormField label="Status" value={form.status} onChange={fp('status')} options={['Active', 'Inactive']} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} surface={surface} />
    </>
  );

  return (
    <div>
      <PageHeader title="Categories" subtitle="Manage product categories" icon={Tag} onAdd={openAdd} addLabel="Add Category" />
      <DataTable columns={columns} data={data as unknown as Record<string, unknown>[]} searchPlaceholder="Search categories..." onEdit={openEdit} onDelete={openDelete} />

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Category">
        {formFields}
        <ModalFooter onClose={() => setAddOpen(false)} onSubmit={handleAdd} loading={loading} submitLabel="Add Category" isDark={isDark} border={border} textMain={textMain} />
      </Modal>

      <Modal open={!!editRow} onClose={() => setEditRow(null)} title={`Edit Category: ${editRow?.name ?? ''}`}>
        {formFields}
        <ModalFooter onClose={() => setEditRow(null)} onSubmit={handleEdit} loading={loading} submitLabel="Save Changes" isDark={isDark} border={border} textMain={textMain} />
      </Modal>

      <ConfirmDialog open={!!deleteRow} onClose={() => setDeleteRow(null)} onConfirm={handleDelete} loading={loading} title="Delete Category" message={`Delete "${deleteRow?.name}" permanently?`} />
    </div>
  );
}

export default function CategoriesPage() { return <AdminShell><CategoriesContent /></AdminShell>; }
