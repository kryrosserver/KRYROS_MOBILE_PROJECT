"use client";

import { useState } from "react";
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
  Users
} from "lucide-react";

const walletStats = {
  totalBalance: 2450000,
  todayIncoming: 156000,
  todayOutgoing: 89000,
  pendingTransactions: 12,
  activeWallets: 1234,
};

const recentTransactions = [
  { 
    id: "TXN001", 
    type: "credit", 
    amount: 25000, 
    fee: 250,
    method: "Paystack",
    status: "completed",
    user: "John Chanda",
    date: "2024-01-15 10:30",
    ref: "PSK-123456"
  },
  { 
    id: "TXN002", 
    type: "debit", 
    amount: 12500, 
    fee: 125,
    method: "Flutterwave",
    status: "completed",
    user: "Mary Phiri",
    date: "2024-01-15 11:15",
    ref: "FLW-789012"
  },
  { 
    id: "TXN003", 
    type: "credit", 
    amount: 45000, 
    fee: 450,
    method: "Bank Transfer",
    status: "pending",
    user: "Peter Mwansa",
    date: "2024-01-15 12:00",
    ref: "TRF-345678"
  },
  { 
    id: "TXN004", 
    type: "debit", 
    amount: 8900, 
    fee: 89,
    method: "Wallet",
    status: "completed",
    user: "Sarah Banda",
    date: "2024-01-14 14:30",
    ref: "WLT-901234"
  },
  { 
    id: "TXN005", 
    type: "credit", 
    amount: 32000, 
    fee: 320,
    method: "Paystack",
    status: "failed",
    user: "James Kunda",
    date: "2024-01-14 16:45",
    ref: "PSK-567890"
  },
];

const topWallets = [
  { user: "John Chanda", email: "john@example.com", balance: 125000, transactions: 45, lastActive: "2 hours ago" },
  { user: "Mary Phiri", email: "mary@example.com", balance: 89000, transactions: 32, lastActive: "5 hours ago" },
  { user: "Peter Mwansa", email: "peter@example.com", balance: 67000, transactions: 28, lastActive: "1 day ago" },
  { user: "Sarah Banda", email: "sarah@example.com", balance: 45000, transactions: 21, lastActive: "3 hours ago" },
  { user: "James Kunda", email: "james@example.com", balance: 23000, transactions: 15, lastActive: "6 hours ago" },
];

const pendingApprovals = [
  { id: "TXN101", user: "John Chanda", amount: 50000, type: "withdrawal", method: "Bank Transfer", date: "2024-01-15 09:00" },
  { id: "TXN102", user: "Mary Phiri", amount: 25000, type: "topup", method: "Paystack", date: "2024-01-15 08:30" },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const tabs = [
    { id: "transactions", label: "Transactions", icon: ArrowUpRight },
    { id: "wallets", label: "Wallets", icon: Wallet },
    { id: "pending", label: "Pending", icon: Clock, count: pendingApprovals.length },
    { id: "settings", label: "Settings", icon: CreditCard },
  ];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(amount);
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
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatAmount(walletStats.totalBalance)}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm text-green-600">+12%</span>
          </div>
          <p className="text-sm text-slate-500">Today's Incoming</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatAmount(walletStats.todayIncoming)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-sm text-red-600">-8%</span>
          </div>
          <p className="text-sm text-slate-500">Today's Outgoing</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatAmount(walletStats.todayOutgoing)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{walletStats.pendingTransactions}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-slate-500">Active Wallets</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{walletStats.activeWallets.toLocaleString()}</p>
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
              {tab.count && (
                <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
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
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          txn.type === "credit" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {txn.type === "credit" ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{txn.id}</p>
                          <p className="text-xs text-slate-500">{txn.ref}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {txn.user}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${
                        txn.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}>
                        {txn.type === "credit" ? "+" : "-"}{formatAmount(txn.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatAmount(txn.fee)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {txn.method}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        txn.status === "completed" 
                          ? "bg-green-100 text-green-700"
                          : txn.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {txn.status === "completed" && <CheckCircle className="h-3 w-3" />}
                        {txn.status === "pending" && <Clock className="h-3 w-3" />}
                        {txn.status === "failed" && <XCircle className="h-3 w-3" />}
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {txn.date}
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

      {/* Wallets Tab */}
      {activeTab === "wallets" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">User</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Email</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Balance</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Transactions</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Last Active</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {topWallets.map((wallet) => (
                <tr key={wallet.user} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">{wallet.user[0]}</span>
                      </div>
                      <span className="font-medium text-slate-900">{wallet.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {wallet.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{formatAmount(wallet.balance)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {wallet.transactions}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {wallet.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm text-green-600 hover:underline">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Tab */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <div key={approval.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{approval.id}</p>
                    <p className="text-sm text-slate-500">{approval.user} • {approval.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{formatAmount(approval.amount)}</p>
                    <p className="text-sm text-slate-500">{approval.method}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Approve
                    </button>
                    <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Payment Settings</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Banknote className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Paystack</h4>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <input type="password" placeholder="Secret Key" defaultValue="sk_test_****" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              
              <div className="p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Flutterwave</h4>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <input type="password" placeholder="Secret Key" defaultValue="flw_test_****" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-4">Transaction Fees</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-600">Paystack (%)</label>
                  <input type="number" defaultValue="1.5" step="0.1" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Flutterwave (%)</label>
                  <input type="number" defaultValue="1.5" step="0.1" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Bank Transfer (%)</label>
                  <input type="number" defaultValue="1.0" step="0.1" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
