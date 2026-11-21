import React from 'react';
import { X, Receipt, CheckCircle2, Clock, AlertCircle, ShoppingBag, ArrowRight, Printer } from 'lucide-react';

export default function OrderHistoryModal({ isOpen, onClose, orders = [], onCancelOrder }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#FFF5EB] w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#E9C7B7] relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#E9C7B7]/60 text-[#542747] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E9C7B7]">
          <div className="w-10 h-10 rounded-xl bg-[#542747] flex items-center justify-center text-[#FFF5EB] shadow-sm">
            <Receipt className="w-5 h-5 text-[#E58B51]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#A94F2C] uppercase tracking-wider">Account Purchases & Invoices</div>
            <h2 className="text-xl sm:text-2xl font-black text-[#542747]">
              Order History & Payment Receipts
            </h2>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E9C7B7] p-6 space-y-3">
            <ShoppingBag className="w-12 h-12 text-[#E9C7B7] mx-auto" />
            <h4 className="font-bold text-[#542747]">No Orders Placed Yet</h4>
            <p className="text-xs text-[#38302F]/70">Explore the circular marketplace and complete a checkout to see orders and receipts here.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-2xl border border-[#E9C7B7] shadow-xs space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E9C7B7]">
                  <div>
                    <span className="font-mono font-bold text-[#542747] text-sm">{order.orderNumber}</span>
                    <span className="text-[11px] text-[#38302F]/60 ml-2">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      order.orderStatus === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-sm text-[#542747]">{order.itemTitle}</h5>
                    <div className="text-[11px] text-[#38302F]/70">
                      Payment via: <strong>{order.paymentMethod === 'STRIPE_CARD' ? `Stripe Card (••• ${order.cardLast4 || '4242'})` : order.paymentMethod}</strong>
                    </div>
                    {order.stripePaymentIntentId && (
                      <div className="text-[10px] text-[#38302F]/50 font-mono">
                        Stripe Ref: {order.stripePaymentIntentId}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-[#A94F2C]">৳{order.totalAmount.toLocaleString()}</div>
                    <div className="text-[10px] text-[#38302F]/50">{order.deliveryOption.replace('_', ' ')}</div>
                  </div>
                </div>

                {/* Cancellation & Receipt Actions */}
                <div className="pt-2 border-t border-[#E9C7B7] flex justify-between items-center text-[11px]">
                  <div>
                    {order.orderStatus === 'CONFIRMED' ? (
                      <button
                        type="button"
                        onClick={() => onCancelOrder && onCancelOrder(order.id)}
                        className="text-red-600 font-bold hover:underline"
                      >
                        Cancel Order (2h Grace Window)
                      </button>
                    ) : (
                      <span className="text-red-700 font-semibold">Cancelled & Refunded</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-[#542747] font-bold hover:text-[#A94F2C]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#E9C7B7] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#542747] text-white font-bold text-xs hover:bg-[#A94F2C] transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
