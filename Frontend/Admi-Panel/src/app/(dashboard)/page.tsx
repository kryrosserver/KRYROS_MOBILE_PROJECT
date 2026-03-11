"use client";

import Link from "next/link";
import { 
  Plus, RefreshCw, Bell, Settings, FileText, FileEdit, Users, 
  Package, CreditCard, ShoppingBag, ShoppingCart, Truck, 
  Database, RotateCcw, DollarSign, BarChart3, RotateCw, UserCheck, ChevronRight 
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Summary = {
  sales: number;
  purchases: number;
  paymentReceived: number;
  paymentPaid: number;
  outstandingBalance: number;
  outstandingPayment: number;
  expense: number;
  profit: number;
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary>({
    sales: 0,
    purchases: 0,
    paymentReceived: 0,
    paymentPaid: 0,
    outstandingBalance: 0,
    outstandingPayment: 0,
    expense: 0,
    profit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/reports/summary?range=month", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (data && data.stats) {
        setSummary({
          sales: data.stats.totalRevenue || 0,
          purchases: 0,
          paymentReceived: data.stats.totalRevenue || 0,
          paymentPaid: 0,
          outstandingBalance: 0,
          outstandingPayment: 0,
          expense: 0,
          profit: data.stats.totalRevenue || 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const quickActions = [
    { title: "New Invoice", icon: Plus, href: "/admin/invoice/new" },
    { title: "New Estimate", icon: Plus, href: "/admin/estimate/new" },
    { title: "New Payment", icon: Plus, href: "/admin/payment/new" },
  ];

  const modules = [
    { title: "Invoice", icon: FileText, href: "/admin/invoice" },
    { title: "Estimate", icon: FileEdit, href: "/admin/estimate" },
    { title: "Client / Supplier", icon: Users, href: "/admin/contacts" },
    { title: "Product/Service", icon: Package, href: "/admin/products" },
    { title: "Payment", icon: CreditCard, href: "/admin/payments" },
    { title: "Purchase", icon: ShoppingBag, href: "/admin/purchases" },
    { title: "Sale Order", icon: FileText, href: "/admin/sale-orders" },
    { title: "Purchase Order", icon: ShoppingCart, href: "/admin/purchase-orders" },
    { title: "Delivery Note", icon: FileText, href: "/admin/delivery-notes" },
    { title: "Inventory", icon: Database, href: "/admin/inventory" },
    { title: "Sale Return", icon: RotateCcw, href: "/admin/sale-returns" },
    { title: "Expense", icon: DollarSign, href: "/admin/expenses" },
    { title: "Reports", icon: BarChart3, href: "/admin/reports" },
    { title: "Purchase Return", icon: RotateCw, href: "/admin/purchase-returns" },
    { title: "Agent", icon: UserCheck, href: "/admin/agents" },
  ];

  const summaryCards = [
    { title: "Sales", subtitle: "Sales this month", value: summary.sales, color: "text-orange-500", href: "/admin/reports/sales" },
    { title: "Purchases", subtitle: "Purchase this month", value: summary.purchases, color: "text-orange-500", href: "/admin/reports/purchases" },
    { title: "Payment Received", subtitle: "Received this month", value: summary.paymentReceived, color: "text-green-500", href: "/admin/reports/payments-received" },
    { title: "Payment Paid", subtitle: "Paid this month", value: summary.paymentPaid, color: "text-red-500", href: "/admin/reports/payments-paid" },
    { title: "Outstanding Balance", subtitle: "This Month", value: summary.outstandingBalance, color: "text-green-500", href: "/admin/reports/outstanding-balance" },
    { title: "Outstanding Payment", subtitle: "This Month", value: summary.outstandingPayment, color: "text-red-500", href: "/admin/reports/outstanding-payment" },
    { title: "Expense", subtitle: "Expense this month", value: summary.expense, color: "text-slate-900", href: "/admin/expenses" },
    { title: "Profit / Loss", subtitle: "This Month", value: summary.profit, color: "text-green-500", href: "/admin/reports/profit-loss" },
  ];

  const orderStats = [
    { label: "Booked", count: 0, color: "bg-slate-300" },
    { label: "Processing", count: 0, color: "bg-orange-300" },
    { label: "Completed", count: 0, color: "bg-green-300" },
    { label: "Delivered", count: 0, color: "bg-cyan-400" },
    { label: "Cancelled", count: 0, color: "bg-pink-300" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 max-w-4xl mx-auto shadow-sm">
      {/* Header */}
      <header className="bg-[#1e293b] text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-semibold">Uni Invoice</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => { setIsRefreshing(true); load().finally(() => setTimeout(() => setIsRefreshing(false), 300)); }}>
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button><Bell className="h-5 w-5" /></button>
          <button><Settings className="h-5 w-5" /></button>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="bg-[#1e293b] p-4 pt-0 grid grid-cols-3 gap-3">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.href} className="bg-[#334155] rounded-lg p-3 flex flex-col items-start gap-1 hover:bg-[#475569] transition-colors">
            <div className="h-6 w-6 rounded-full border border-white/30 flex items-center justify-center">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-white/90 leading-tight">{action.title}</span>
          </Link>
        ))}
      </div>

      {/* Feature Grid */}
      <div className="p-0.5 bg-slate-200">
        <div className="grid grid-cols-4 gap-[1px]">
          {modules.map((m, i) => (
            <Link key={i} href={m.href} className="bg-white p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors aspect-square">
              <div className="text-[#2dd4bf]">
                <m.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] text-center font-medium text-slate-700 leading-tight">{m.title}</span>
            </Link>
          ))}
          {/* Empty slot for layout if needed */}
          <div className="bg-white aspect-square"></div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-4 grid grid-cols-2 gap-[1px] bg-slate-200">
        {summaryCards.map((card, i) => (
          <Link key={i} href={card.href} className="bg-white p-4 flex flex-col justify-between group cursor-pointer hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                <p className="text-[10px] text-slate-400">{card.subtitle}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>
            <p className={`mt-2 text-base font-bold ${card.color}`}>ZMW {card.value.toFixed(2)}</p>
          </Link>
        ))}
      </div>

      {/* Order Statistics */}
      <div className="mt-4 bg-white p-4 border-t border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">Order Statistics</h3>
        <p className="text-[10px] text-slate-400">Order Statistics of current month</p>
        
        <div className="mt-4 space-y-2">
          {orderStats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${stat.color}`}></div>
              <span className="text-xs text-slate-700 font-medium">{stat.label} : {stat.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-20"></div> {/* Bottom spacing */}
    </div>
  );
}


