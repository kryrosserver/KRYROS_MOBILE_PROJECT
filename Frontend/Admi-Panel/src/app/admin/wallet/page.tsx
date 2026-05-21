"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Banknote,
  Building,
  Users,
  Link as LinkIcon,
  Copy,
  Check,
  Trash2
} from "lucide-react";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentLinks, setPaymentLinks] = useState([
    { id: "PAY-123", amount: 500, description: "Consultation Fee", createdAt: new Date().toISOString(), status: "ACTIVE" },
  ]);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [newLink, setNewLink] = useState({ amount: "", description: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateLink = () => {
    const link = {
      id: `PAY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      amount: parseFloat(newLink.amount),
      description: newLink.description,
      createdAt: new Date().toISOString(),
      status: "ACTIVE",
    };
    setPaymentLinks([link, ...paymentLinks]);
    setNewLink({ amount: "", description: "" });
    setIsCreatingLink(false);
  };

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin.replace("admin.", "")}/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    load().finally(() => setTimeout(() => setIsRefreshing(false), 300));
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wRes, tRes] = await Promise.all([
        fetch("/internal/admin/wallets", { cache: "no-store" }),
        fetch("/internal/admin/wallets/transactions", { cache: "no-store" }),
      ]);
      const [w, t] = await Promise.all([wRes.json(), tRes.json()]);
      if (!wRes.ok) throw new Error(w?.error || "Failed to load wallets");
      if (!tRes.ok) throw new Error(t?.error || "Failed to load transactions");
      setWallets(Array.isArray(w) ? w : []);
      setTxns(Array.isArray(t) ? t : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);
    const today = new Date().toDateString();
    const todayTxns = txns.filter((x) => new Date(x.createdAt).toDateString() === today);
    const todayIncoming = todayTxns
      .filter((x) => x.type === "CREDIT")
      .reduce((s, x) => s + Number(x.amount), 0);
    const todayOutgoing = todayTxns
      .filter((x) => x.type === "DEBIT" || x.type === "PAYMENT")
      .reduce((s, x) => s + Number(x.amount), 0);
    return {
      totalBalance,
      todayIncoming,
      todayOutgoing,
      pendingTransactions: txns.filter((t) => t.status === "PENDING").length,
      activeWallets: wallets.length,
    };
  }, [wallets, txns]);

  const tabs = [
    { id: "transactions", label: "Wallet Transactions", icon: ArrowUpRight },
    { id: "links", label: "Payment Links", icon: LinkIcon },
    { id: "checkout_methods", label: "Checkout Methods", icon: CreditCard },
  ];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wallet & Payments</h1>
          <p className="mt-1 text-slate-600">Manage wallets, transactions, and payment settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm text-slate-500">Total Balance</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatAmount(stats.totalBalance)}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm text-green-600">+12%</span>
          </div>
          <p className="text-sm text-slate-500">Today's Incoming</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatAmount(stats.todayIncoming)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-sm text-red-600">-8%</span>
          </div>
          <p className="text-sm text-slate-500">Today's Outgoing</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatAmount(stats.todayOutgoing)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingTransactions}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-slate-500">Active Wallets</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.activeWallets.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {('count' in tab && typeof tab.count === 'number' && tab.count > 0) ? (
                <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <>
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
            <select className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white">
              <option>All Methods</option>
              <option>Paystack</option>
              <option>Flutterwave</option>
              <option>Bank Transfer</option>
              <option>Wallet</option>
            </select>
            <select className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white">
              <option>All Status</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Transaction</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">User</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Amount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Fee</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Method</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Date</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {txns
                  .filter((txn) =>
                    (txn.wallet?.user?.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (txn.wallet?.user?.lastName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (txn.wallet?.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (txn.reference || txn.id).toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          txn.type === "CREDIT" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {txn.type === "CREDIT" ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{txn.reference || txn.id}</p>
                          <p className="text-xs text-slate-500">{txn.description || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {(txn.wallet?.user && `${txn.wallet.user.firstName || ""} ${txn.wallet.user.lastName || ""}`.trim()) || txn.wallet?.user?.email || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${
                        txn.type === "CREDIT" ? "text-green-600" : "text-red-600"
                      }`}>
                        {txn.type === "CREDIT" ? "+" : "-"}{formatAmount(Number(txn.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {txn.metadata?.fee ? formatAmount(Number(txn.metadata.fee)) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {txn.metadata?.method || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        txn.status === "COMPLETED" 
                          ? "bg-green-100 text-green-700"
                          : txn.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {txn.status === "COMPLETED" && <CheckCircle className="h-3 w-3" />}
                        {txn.status === "PENDING" && <Clock className="h-3 w-3" />}
                        {txn.status === "FAILED" && <XCircle className="h-3 w-3" />}
                        {txn.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(txn.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm text-green-600 hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Checkout Methods Tab */}
      {activeTab === "checkout_methods" && (
        <CheckoutMethodsTab />
      )}

      {/* Payment Links Tab */}
      {activeTab === "links" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Payment Links</h2>
              <p className="text-slate-500">Generate secure, locked-amount payment links for clients</p>
            </div>
            <button onClick={() => setIsCreatingLink(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800">
              <Plus className="h-4 w-4" /> Create Link
            </button>
          </div>

          {isCreatingLink && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Generate New Payment Link</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Locked Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={newLink.amount}
                      onChange={(e) => setNewLink({...newLink, amount: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description / Purpose</label>
                  <input 
                    placeholder="e.g. Custom Order #552" 
                    value={newLink.description}
                    onChange={(e) => setNewLink({...newLink, description: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={handleCreateLink} disabled={!newLink.amount} className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
                  Generate Link
                </button>
                <button onClick={() => setIsCreatingLink(false)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-slate-600">Reference</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-600">Description</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-600">Amount</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-600">Created</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-600">Status</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paymentLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{link.id}</td>
                      <td className="px-6 py-4 text-slate-600">{link.description}</td>
                      <td className="px-6 py-4 font-semibold text-green-600">{formatAmount(link.amount)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(link.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          link.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {link.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => copyToClipboard(link.id)}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium ${
                              copiedId === link.id ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {copiedId === link.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copiedId === link.id ? "Copied" : "Copy"}
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function CheckoutMethodsTab() {
  const [methods, setMethods] = useState([
    { id: "WHATSAPP", name: "WhatsApp Payment", enabled: true, sortOrder: 1 },
    { id: "MOBILE_MONEY", name: "Mobile Money", enabled: true, sortOrder: 2 },
    { id: "BANK_TRANSFER", name: "Bank Transfer", enabled: true, sortOrder: 3 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/internal/admin/settings")
      .then(res => res.json())
      .then(data => {
        const item = data?.find?.((d: any) => d.key === "CHECKOUT_METHODS");
        if (item?.value) {
          try {
            setMethods(JSON.parse(item.value));
          } catch {}
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/internal/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "CHECKOUT_METHODS", value: JSON.stringify(methods) })
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("Checkout methods saved!");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = (id: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const updateSortOrder = (id: string, val: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, sortOrder: parseInt(val) || 0 } : m));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Checkout Methods</h3>
          <p className="text-sm text-slate-500">Enable/disable payment methods and set their display order at checkout.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-4">
        {methods.sort((a, b) => a.sortOrder - b.sortOrder).map(method => (
          <div key={method.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={method.enabled} onChange={() => toggleMethod(method.id)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
              <div>
                <h4 className="font-semibold text-slate-900">{method.name}</h4>
                <span className="text-xs text-slate-500 font-mono">{method.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sort Order:</label>
              <input 
                type="number" 
                value={method.sortOrder} 
                onChange={(e) => updateSortOrder(method.id, e.target.value)}
                className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-center font-bold"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
