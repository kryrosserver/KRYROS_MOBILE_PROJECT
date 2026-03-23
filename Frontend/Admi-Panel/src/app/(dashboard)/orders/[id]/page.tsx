"use client";

import { useEffect, useState, use } from "react";
import { formatPrice } from "@/lib/utils";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  User, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    name: string;
    images?: { url: string }[];
  };
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  notes: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string; phone?: string };
  shippingAddress?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    cityName?: string;
    stateName?: string;
    country: string;
    manual: boolean;
  };
  items: OrderItem[];
};

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/internal/admin/orders/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch order");
      setOrder(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const updateOrder = async (status: string, paymentStatus?: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/internal/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update order");
      }
      await fetchOrder();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><AlertCircle className="h-5 w-5" /> {error}</div>;
  if (!order) return null;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/orders" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Actions */}
          <div className="admin-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" /> Management Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Order Status</label>
                <select 
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={order.status}
                  onChange={(e) => updateOrder(e.target.value)}
                  disabled={updating}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Payment Status</label>
                <select 
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={order.paymentStatus}
                  onChange={(e) => updateOrder(order.status, e.target.value)}
                  disabled={updating}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="admin-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-slate-400" /> Order Items</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                    {item.product.images?.[0] && <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-sm text-slate-500">{item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-bold text-slate-900">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50/50 space-y-2 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span className="font-medium">{formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax (16%)</span>
                <span className="font-medium">{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="admin-card p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="h-4 w-4" /> Customer Details
            </h3>
            {order.user ? (
              <div className="space-y-3">
                <p className="font-bold text-slate-900">{order.user.firstName} {order.user.lastName}</p>
                <p className="text-sm text-slate-600">{order.user.email}</p>
                {order.user.phone && <p className="text-sm text-slate-600">{order.user.phone}</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-bold text-slate-900">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                <p className="text-sm text-slate-600">{order.shippingAddress?.email}</p>
                <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">Guest Order</p>
              </div>
            )}
          </div>

          {/* Shipping Address */}
          <div className="admin-card p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Shipping Address
            </h3>
            {order.shippingAddress ? (
              <div className="space-y-2 text-sm text-slate-600">
                <p className="font-medium text-slate-900">{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.cityName}, {order.shippingAddress.stateName}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2 font-bold text-slate-900">{order.shippingAddress.phone}</p>
                {order.shippingAddress.manual && (
                  <p className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded inline-block">Manual Address Entry</p>
                )}
              </div>
            ) : <p className="text-sm text-slate-400">No address provided</p>}
          </div>

          {/* Payment Info */}
          <div className="admin-card p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment Info
            </h3>
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-900">{order.paymentMethod || "Not Selected"}</p>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span className="text-sm font-medium text-slate-600">{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
