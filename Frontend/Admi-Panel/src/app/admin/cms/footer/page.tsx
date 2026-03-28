"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Settings,
} from "lucide-react";

interface FooterSection {
  id: string;
  title: string;
  order: number;
  isActive: boolean;
  links: FooterLink[];
}

interface FooterLink {
  id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
}

interface FooterConfig {
  id?: string;
  logo?: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  copyrightText?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  paymentMethods?: Array<{ name: string }>;
  
  // Newsletter Popup Config
  newsletterPopupEnabled?: boolean;
  newsletterPopupTitle?: string;
  newsletterPopupSubtitle?: string;
  newsletterPopupImage?: string;
  newsletterPopupDelay?: number;

  // Announcement Bar Config
  announcementBarEnabled?: boolean;
  announcementBarText?: string;
  announcementBarLink?: string;
  announcementBarBgColor?: string;
  announcementBarTextColor?: string;
}

export default function FooterManagementPage() {
  const [activeTab, setActiveTab] = useState<"sections" | "config">("sections");
  const [footerSections, setFooterSections] = useState<FooterSection[]>([]);
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<FooterSection | null>(null);
  const [selectedLink, setSelectedLink] = useState<FooterLink | null>(null);

  // Form states
  const [sectionForm, setSectionForm] = useState({ title: "", order: 0, isActive: true });
  const [linkForm, setLinkForm] = useState({
    sectionId: "",
    label: "",
    href: "",
    order: 0,
    isActive: true,
  });
  const [configForm, setConfigForm] = useState<FooterConfig>({
    socialLinks: [],
    paymentMethods: [],
  });

  const [newSocial, setNewSocial] = useState({ platform: "facebook", url: "" });
  const [newPayment, setNewPayment] = useState("");

  // Load data
  useEffect(() => {
    loadFooterSections();
    loadFooterConfig();
  }, []);

  const loadFooterSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/footer/sections", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setFooterSections(Array.isArray(data) ? data : data?.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFooterConfig = async () => {
    try {
      const res = await fetch("/api/admin/cms/footer/config", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setFooterConfig(data);
        setConfigForm(data || { socialLinks: [], paymentMethods: [] });
      }
    } catch (err) {
      console.error("Failed to load footer config:", err);
    }
  };

  // Section operations
  const handleCreateSection = async () => {
    if (!sectionForm.title) {
      setError("Section title is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/footer/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(sectionForm),
      });

      if (res.ok) {
        setMessage("Section created successfully");
        setShowSectionModal(false);
        setSectionForm({ title: "", order: 0, isActive: true });
        loadFooterSections();
      } else {
        setError("Failed to create section");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSection = async () => {
    if (!selectedSection) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cms/footer/sections/${selectedSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(sectionForm),
      });

      if (res.ok) {
        setMessage("Section updated successfully");
        setShowSectionModal(false);
        loadFooterSections();
      } else {
        setError("Failed to update section");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      const res = await fetch(`/api/admin/cms/footer/sections/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (res.ok) {
        setMessage("Section deleted successfully");
        loadFooterSections();
      } else {
        setError("Failed to delete section");
      }
    } catch (err) {
      setError("Error deleting section");
    }
  };

  // Link operations
  const handleCreateLink = async () => {
    if (!linkForm.label || !linkForm.href || !linkForm.sectionId) {
      setError("All fields are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/footer/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(linkForm),
      });

      if (res.ok) {
        setMessage("Link created successfully");
        setShowLinkModal(false);
        setLinkForm({ sectionId: "", label: "", href: "", order: 0, isActive: true });
        loadFooterSections();
      } else {
        setError("Failed to create link");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLink = async () => {
    if (!selectedLink) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cms/footer/links/${selectedLink.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          label: linkForm.label,
          href: linkForm.href,
          order: linkForm.order,
          isActive: linkForm.isActive,
        }),
      });

      if (res.ok) {
        setMessage("Link updated successfully");
        setShowLinkModal(false);
        loadFooterSections();
      } else {
        setError("Failed to update link");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const res = await fetch(`/api/admin/cms/footer/links/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (res.ok) {
        setMessage("Link deleted successfully");
        loadFooterSections();
      } else {
        setError("Failed to delete link");
      }
    } catch (err) {
      setError("Error deleting link");
    }
  };

  // Config operations
  const handleSeedDefaults = async () => {
    if (!confirm("This will add default footer sections and links. Continue?")) return;
    setSaving(true);
    try {
      const defaultSections = [
        { title: "Shop", order: 1, links: [
          { label: "Smartphones", href: "/shop?category=smartphones", order: 1 },
          { label: "Laptops", href: "/shop?category=laptops", order: 2 },
          { label: "Tablets", href: "/shop?category=tablets", order: 3 },
          { label: "Accessories", href: "/shop?category=accessories", order: 4 },
        ]},
        { title: "Company", order: 2, links: [
          { label: "About Us", href: "/about", order: 1 },
          { label: "Contact Us", href: "/contact", order: 2 },
          { label: "Wholesale", href: "/wholesale", order: 3 },
          { label: "Credit Plans", href: "/credit", order: 4 },
        ]},
        { title: "Support", order: 3, links: [
          { label: "Track Order", href: "/track-order", order: 1 },
          { label: "Shipping Policy", href: "/shipping", order: 2 },
          { label: "Terms & Conditions", href: "/terms", order: 3 },
          { label: "Privacy Policy", href: "/privacy", order: 4 },
        ]},
      ];

      for (const sect of defaultSections) {
        const sRes = await fetch("/api/admin/cms/footer/sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ title: sect.title, order: sect.order, isActive: true }),
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          const sectionId = sData.id || sData.data?.id;
          if (sectionId) {
            for (const link of sect.links) {
              await fetch("/api/admin/cms/footer/links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ ...link, sectionId, isActive: true }),
              });
            }
          }
        }
      }

      // Default Config
      await fetch("/api/admin/cms/footer/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          description: "Your trusted source for quality mobile technology and accessories in Zambia. We provide flexible payment plans and wholesale opportunities.",
          contactPhone: "+260 971 234 567",
          contactEmail: "info@kryros.com",
          contactAddress: "Lusaka, Zambia",
          newsletterTitle: "Stay Updated",
          newsletterSubtitle: "Subscribe to get the latest tech deals and news.",
          copyrightText: "© {year} KRYROS MOBILE TECH LIMITED. All rights reserved.",
          socialLinks: [
            { platform: "facebook", url: "https://facebook.com/kryros" },
            { platform: "instagram", url: "https://instagram.com/kryros" },
            { platform: "twitter", url: "https://twitter.com/kryros" },
          ],
          paymentMethods: [
            { name: "Visa" },
            { name: "Mastercard" },
            { name: "Airtel Money" },
            { name: "MTN Money" },
          ]
        }),
      });

      setMessage("Default footer content restored successfully");
      loadFooterSections();
      loadFooterConfig();
    } catch (err) {
      setError("Failed to restore default content");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/footer/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(configForm),
      });

      if (res.ok) {
        setMessage("Footer configuration updated successfully");
        setShowConfigModal(false);
        loadFooterConfig();
      } else {
        setError("Failed to update configuration");
      }
    } finally {
      setSaving(false);
    }
  };

  const openSectionModal = (section?: FooterSection) => {
    if (section) {
      setSelectedSection(section);
      setSectionForm({ title: section.title, order: section.order, isActive: section.isActive });
    } else {
      setSelectedSection(null);
      setSectionForm({ title: "", order: 0, isActive: true });
    }
    setShowSectionModal(true);
  };

  const openLinkModal = (sectionId: string, link?: FooterLink) => {
    if (link) {
      setSelectedLink(link);
      setLinkForm({ sectionId, label: link.label, href: link.href, order: link.order, isActive: link.isActive });
    } else {
      setSelectedLink(null);
      setLinkForm({ sectionId, label: "", href: "", order: 0, isActive: true });
    }
    setShowLinkModal(true);
  };

  const openConfigModal = () => {
    setConfigForm(footerConfig || { socialLinks: [], paymentMethods: [] });
    setShowConfigModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Footer Management</h1>
            <p className="text-gray-600 mt-2">Manage your website footer content and configuration</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => handleSeedDefaults()}
              className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
            >
              <Plus className="h-4 w-4" />
              Restore Defaults
            </button>
            <button 
              onClick={() => openConfigModal()}
              className="inline-flex items-center gap-2 bg-kryros-primary text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg animate-pulse hover:animate-none"
            >
              <Settings className="h-5 w-5" />
              Manage Popups & Announcement Bar
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
            <span className="text-green-800">{message}</span>
            <button onClick={() => setMessage(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Sections */}
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Footer Sections</h2>
            <button 
              onClick={() => openSectionModal()}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : footerSections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No footer sections create yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {footerSections.map((section) => (
                <div key={section.id} className="bg-white rounded-lg shadow p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      <p className="text-sm text-gray-500">Order: {section.order}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openSectionModal(section)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-sm text-gray-700">Links ({section.links?.length || 0})</h4>
                      <button
                        onClick={() => openLinkModal(section.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Add Link
                      </button>
                    </div>

                    {section.links && section.links.length > 0 ? (
                      <div className="space-y-2">
                        {section.links.map((link) => (
                          <div key={link.id} className="flex items-center justify-between bg-gray-50 p-3 rounded group">
                            <div className="overflow-hidden">
                              <p className="font-medium text-sm truncate">{link.label}</p>
                              <p className="text-xs text-gray-500 truncate">{link.href}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openLinkModal(section.id, link)}
                                className="p-1 text-slate-400 hover:text-slate-900"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No links yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Modal */}
        {showSectionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedSection ? "Edit Section" : "Add Section"}
                </h3>
                <button onClick={() => setShowSectionModal(false)} className="text-gray-600 hover:text-gray-900">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                    placeholder="e.g., Shop, Services, Support"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    value={sectionForm.order}
                    onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sectionForm.isActive}
                    onChange={(e) => setSectionForm({ ...sectionForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSectionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedSection ? handleUpdateSection : handleCreateSection}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Link Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedLink ? "Edit Link" : "Add Link"}
                </h3>
                <button onClick={() => setShowLinkModal(false)} className="text-gray-600 hover:text-gray-900">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input
                    type="text"
                    value={linkForm.label}
                    onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                    placeholder="e.g., Smartphones"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input
                    type="text"
                    value={linkForm.href}
                    onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })}
                    placeholder="e.g., /shop?category=smartphones"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    value={linkForm.order}
                    onChange={(e) => setLinkForm({ ...linkForm, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={linkForm.isActive}
                    onChange={(e) => setLinkForm({ ...linkForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedLink ? handleUpdateLink : handleCreateLink}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Config Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Footer Configuration</h3>
                <button onClick={() => setShowConfigModal(false)} className="text-gray-600 hover:text-gray-900">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                    <input
                      type="text"
                      value={configForm.logo || ""}
                      onChange={(e) => setConfigForm({ ...configForm, logo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={configForm.description || ""}
                      onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={configForm.contactPhone || ""}
                      onChange={(e) => setConfigForm({ ...configForm, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="text"
                      value={configForm.contactEmail || ""}
                      onChange={(e) => setConfigForm({ ...configForm, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Address</label>
                    <input
                      type="text"
                      value={configForm.contactAddress || ""}
                      onChange={(e) => setConfigForm({ ...configForm, contactAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Newsletter & Popup</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="newsletterPopupEnabled"
                      checked={configForm.newsletterPopupEnabled || false}
                      onChange={(e) => setConfigForm({ ...configForm, newsletterPopupEnabled: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="newsletterPopupEnabled" className="text-sm font-medium text-gray-700">Enable Newsletter Popup</label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Popup Title</label>
                      <input
                        type="text"
                        value={configForm.newsletterPopupTitle || ""}
                        onChange={(e) => setConfigForm({ ...configForm, newsletterPopupTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Popup Delay (ms)</label>
                      <input
                        type="number"
                        value={configForm.newsletterPopupDelay || 3000}
                        onChange={(e) => setConfigForm({ ...configForm, newsletterPopupDelay: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Popup Subtitle</label>
                      <textarea
                        value={configForm.newsletterPopupSubtitle || ""}
                        onChange={(e) => setConfigForm({ ...configForm, newsletterPopupSubtitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Popup Image URL</label>
                      <input
                        type="text"
                        value={configForm.newsletterPopupImage || ""}
                        onChange={(e) => setConfigForm({ ...configForm, newsletterPopupImage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="border-t pt-4 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Footer Newsletter Title</label>
                      <input
                        type="text"
                        value={configForm.newsletterTitle || ""}
                        onChange={(e) => setConfigForm({ ...configForm, newsletterTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Footer Newsletter Subtitle</label>
                      <input
                        type="text"
                        value={configForm.newsletterSubtitle || ""}
                        onChange={(e) => setConfigForm({ ...configForm, newsletterSubtitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Announcement Bar</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="announcementBarEnabled"
                      checked={configForm.announcementBarEnabled || false}
                      onChange={(e) => setConfigForm({ ...configForm, announcementBarEnabled: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="announcementBarEnabled" className="text-sm font-medium text-gray-700">Enable Announcement Bar</label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Text</label>
                      <input
                        type="text"
                        value={configForm.announcementBarText || ""}
                        onChange={(e) => setConfigForm({ ...configForm, announcementBarText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (Optional)</label>
                      <input
                        type="text"
                        value={configForm.announcementBarLink || ""}
                        onChange={(e) => setConfigForm({ ...configForm, announcementBarLink: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="/shop, /credit, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background Class</label>
                      <input
                        type="text"
                        value={configForm.announcementBarBgColor || "bg-kryros-dark"}
                        onChange={(e) => setConfigForm({ ...configForm, announcementBarBgColor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="bg-kryros-dark, bg-red-600, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Text Color Class</label>
                      <input
                        type="text"
                        value={configForm.announcementBarTextColor || "text-kryros-green"}
                        onChange={(e) => setConfigForm({ ...configForm, announcementBarTextColor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="text-kryros-green, text-white, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800">Social Links</h4>
                  </div>
                  <div className="space-y-2 mb-3">
                    {configForm.socialLinks?.map((social, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium w-24 capitalize">{social.platform}</span>
                        <span className="text-sm text-gray-500 flex-1 truncate">{social.url}</span>
                        <button
                          onClick={() => {
                            const updated = configForm.socialLinks?.filter((_, i) => i !== idx);
                            setConfigForm({ ...configForm, socialLinks: updated });
                          }}
                          className="text-red-500 p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newSocial.platform}
                      onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="youtube">YouTube</option>
                    </select>
                    <input
                      type="text"
                      value={newSocial.url}
                      onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => {
                        if (!newSocial.url) return;
                        const updated = [...(configForm.socialLinks || []), newSocial];
                        setConfigForm({ ...configForm, socialLinks: updated });
                        setNewSocial({ platform: "facebook", url: "" });
                      }}
                      className="bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800">Payment Methods</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {configForm.paymentMethods?.map((pm, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm">
                        {pm.name}
                        <button
                          onClick={() => {
                            const updated = configForm.paymentMethods?.filter((_, i) => i !== idx);
                            setConfigForm({ ...configForm, paymentMethods: updated });
                          }}
                          className="hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPayment}
                      onChange={(e) => setNewPayment(e.target.value)}
                      placeholder="e.g., Visa, Airtel Money"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => {
                        if (!newPayment) return;
                        const updated = [...(configForm.paymentMethods || []), { name: newPayment }];
                        setConfigForm({ ...configForm, paymentMethods: updated });
                        setNewPayment("");
                      }}
                      className="bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
                  <input
                    type="text"
                    value={configForm.copyrightText || ""}
                    onChange={(e) => setConfigForm({ ...configForm, copyrightText: e.target.value })}
                    placeholder="Use {year} for current year"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateConfig}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
