"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [configForm, setConfigForm] = useState<FooterConfig>({});

  // Load data
  useEffect(() => {
    loadFooterSections();
    loadFooterConfig();
  }, []);

  const loadFooterSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/cms/footer/sections", {
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
      const res = await fetch("/internal/admin/cms/footer/config", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setFooterConfig(data);
        setConfigForm(data || {});
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
      const res = await fetch("/internal/admin/cms/footer/sections", {
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
      const res = await fetch(`/internal/admin/cms/footer/sections/${selectedSection.id}`, {
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
      const res = await fetch(`/internal/admin/cms/footer/sections/${id}`, {
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
      const res = await fetch("/internal/admin/cms/footer/links", {
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
      const res = await fetch(`/internal/admin/cms/footer/links/${selectedLink.id}`, {
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
      const res = await fetch(`/internal/admin/cms/footer/links/${id}`, {
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
  const handleUpdateConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch("/internal/admin/cms/footer/config", {
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Footer Management</h1>
          <p className="text-gray-600 mt-2">Manage your website footer content and configuration</p>
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

        {/* Tabs */}
        <div className="mb-8 flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("sections")}
            className={`px-6 py-3 font-medium ${
              activeTab === "sections"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Footer Sections
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`px-6 py-3 font-medium ${
              activeTab === "config"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Configuration
          </button>
        </div>

        {/* Sections Tab */}
        {activeTab === "sections" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Footer Sections</h2>
              <Button onClick={() => openSectionModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : footerSections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No footer sections create yet</div>
            ) : (
              <div className="space-y-4">
                {footerSections.map((section) => (
                  <div key={section.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{section.title}</h3>
                        <p className="text-sm text-gray-500">Order: {section.order}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSectionModal(section)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-sm">Links ({section.links?.length || 0})</h4>
                        <Button
                          size="sm"
                          onClick={() => openLinkModal(section.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Link
                        </Button>
                      </div>

                      {section.links && section.links.length > 0 ? (
                        <div className="space-y-2">
                          {section.links.map((link) => (
                            <div key={link.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                              <div>
                                <p className="font-medium text-sm">{link.label}</p>
                                <p className="text-xs text-gray-500">{link.href}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openLinkModal(section.id, link)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteLink(link.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
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
        )}

        {/* Config Tab */}
        {activeTab === "config" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Footer Configuration</h2>
              <Button onClick={() => setShowConfigModal(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Configuration
              </Button>
            </div>

            {footerConfig ? (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">Description</h3>
                  <p className="text-gray-900">{footerConfig.description || "Not set"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 mb-2">Contact Phone</h3>
                    <p className="text-gray-900">{footerConfig.contactPhone || "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 mb-2">Contact Email</h3>
                    <p className="text-gray-900">{footerConfig.contactEmail || "Not set"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">Contact Address</h3>
                  <p className="text-gray-900">{footerConfig.contactAddress || "Not set"}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No configuration set</div>
            )}
          </div>
        )}

        {/* Section Modal */}
        {showSectionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedSection ? "Edit Section" : "Add Section"}
                </h3>
                <button onClick={() => setShowSectionModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                  <Input
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                    placeholder="e.g., Shop, Services, Support"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <Input
                    type="number"
                    value={sectionForm.order}
                    onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sectionForm.isActive}
                    onChange={(e) => setSectionForm({ ...sectionForm, isActive: e.target.checked })}
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowSectionModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={selectedSection ? handleUpdateSection : handleCreateSection}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
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
                <button onClick={() => setShowLinkModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <Input
                    value={linkForm.label}
                    onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                    placeholder="e.g., Smartphones"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <Input
                    value={linkForm.href}
                    onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })}
                    placeholder="e.g., /shop?category=smartphones"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <Input
                    type="number"
                    value={linkForm.order}
                    onChange={(e) => setLinkForm({ ...linkForm, order: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={linkForm.isActive}
                    onChange={(e) => setLinkForm({ ...linkForm, isActive: e.target.checked })}
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowLinkModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={selectedLink ? handleUpdateLink : handleCreateLink}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
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
                <button onClick={() => setShowConfigModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
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
                  <Input
                    value={configForm.contactPhone || ""}
                    onChange={(e) => setConfigForm({ ...configForm, contactPhone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <Input
                    value={configForm.contactEmail || ""}
                    onChange={(e) => setConfigForm({ ...configForm, contactEmail: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Address</label>
                  <Input
                    value={configForm.contactAddress || ""}
                    onChange={(e) => setConfigForm({ ...configForm, contactAddress: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Newsletter Title</label>
                  <Input
                    value={configForm.newsletterTitle || ""}
                    onChange={(e) => setConfigForm({ ...configForm, newsletterTitle: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Newsletter Subtitle</label>
                  <textarea
                    value={configForm.newsletterSubtitle || ""}
                    onChange={(e) => setConfigForm({ ...configForm, newsletterSubtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
                  <Input
                    value={configForm.copyrightText || ""}
                    onChange={(e) => setConfigForm({ ...configForm, copyrightText: e.target.value })}
                    placeholder="Use {year} for current year"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowConfigModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateConfig}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
