import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Truck,
  Sparkles,
  Clock,
  Receipt,
  Lock,
  RefreshCw,
  ArrowRight,
  Printer,
  ChevronRight,
  MapPin,
  Phone,
  User,
  ShoppingBag
} from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, item, currentUser, onOrderSuccess }) {
  if (!isOpen || !item) return null;

  // Checkout Steps: 'details' -> 'payment' -> 'success'
  const [step, setStep] = useState('details');

  // Delivery Form
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState('01711223344');
  const [campus, setCampus] = useState('BRAC University (Kha-224, Merul Badda)');
  const [hallOrBuilding, setHallOrBuilding] = useState('Building 2, Level 5 Cafeteria');
  const [deliveryOption, setDeliveryOption] = useState('CAMPUS_PICKUP'); // 'CAMPUS_PICKUP' or 'STANDARD_DELIVERY'

  // Payment Form
  const [paymentMethod, setPaymentMethod] = useState('STRIPE_CARD'); // 'STRIPE_CARD', 'SWAP_CREDITS', 'CASH_ON_DELIVERY'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardZip, setCardZip] = useState('1212');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Confirmed Order State
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Cancellation confirmation inline state (replaces browser confirm/alert dialogs)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Financial Breakdown
  const numericPrice = parseInt(item.price.replace(/[^\d]/g, '')) || 1850;
  const deliveryFee = deliveryOption === 'CAMPUS_PICKUP' ? 0 : 60;
  const sustainableDiscount = 50; // Discount for choosing pre-owned circular clothing
  const totalAmount = Math.max(0, numericPrice + deliveryFee - sustainableDiscount);

  // Quick-fill Stripe Test Card
  const fillStripeTestCard = (type = 'success') => {
    if (type === 'success') {
      setCardNumber('4242 4242 4242 4242');
      setCardExp('12/28');
      setCardCvc('123');
      setCardZip('1212');
      setErrorMessage('');
    }
  };

  // Handle Payment Submission
  const handlePayNow = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (paymentMethod === 'STRIPE_CARD') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 16) {
        setErrorMessage('Please enter a valid 16-digit card number or click "Use Stripe Test Card".');
        return;
      }
      if (!cardExp || !cardCvc) {
        setErrorMessage('Please enter expiry date and CVC code.');
        return;
      }
    }

    if (paymentMethod === 'SWAP_CREDITS' && (currentUser?.swapCredits || 0) < Math.round(totalAmount / 40)) {
      setErrorMessage(`Insufficient Swap Credits. You need ${Math.round(totalAmount / 40)} credits.`);
      return;
    }

    setIsProcessing(true);

    // Simulated Stripe API Processing delay
    setTimeout(() => {
      setIsProcessing(false);
      const randomOrderNum = Math.floor(1000 + Math.random() * 9000);
      const newOrder = {
        id: `ord_${Date.now()}`,
        orderNumber: `ORD-2026-${randomOrderNum}`,
        itemTitle: item.title,
        itemBrand: item.brand,
        itemPrice: numericPrice,
        deliveryFee,
        discount: sustainableDiscount,
        totalAmount,
        deliveryAddress: {
          fullName,
          phone,
          campus,
          hallOrBuilding,
        },
        deliveryOption,
        paymentMethod,
        paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
        stripePaymentIntentId: paymentMethod === 'STRIPE_CARD' ? `pi_stripe_${Date.now()}_test` : null,
        cardLast4: paymentMethod === 'STRIPE_CARD' ? cardNumber.slice(-4) || '4242' : null,
        orderStatus: 'CONFIRMED',
        cancellationAllowedUntil: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2-hour window
        createdAt: new Date(),
      };

      setConfirmedOrder(newOrder);
      setStep('success');
      if (onOrderSuccess) onOrderSuccess(newOrder);
    }, 1200);
  };

  // Handle Order Cancellation (inline — no browser dialogs)
  const handleCancelOrder = () => {
    if (!confirmedOrder) return;
    setShowCancelConfirm(true);
  };

  const confirmCancellation = () => {
    setConfirmedOrder(prev => ({
      ...prev,
      orderStatus: 'CANCELLED',
      paymentStatus: 'REFUNDED'
    }));
    setShowCancelConfirm(false);
    setCancelSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#FFF5EB] w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#E9C7B7] relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#E9C7B7]/60 text-[#542747] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E9C7B7]">
          <div className="w-10 h-10 rounded-xl bg-[#542747] flex items-center justify-center text-[#FFF5EB] shadow-sm">
            <ShoppingBag className="w-5 h-5 text-[#E58B51]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#A94F2C] uppercase tracking-wider">Secure Campus Checkout</div>
            <h2 className="text-xl sm:text-2xl font-black text-[#542747]">
              Unified Checkout & Stripe Payment
            </h2>
          </div>
        </div>

        {/* STEP 1: DELIVERY & ITEM DETAILS */}
        {step === 'details' && (
          <div className="space-y-6">
            
            {/* Item Mini Card */}
            <div className="bg-white p-4 rounded-2xl border border-[#E9C7B7] flex items-center gap-4">
              <img src={item.image} alt={item.title} className="w-20 h-20 rounded-xl object-cover border border-[#E9C7B7]" />
              <div className="flex-1">
                <div className="text-xs text-[#38302F]/60">{item.brand} • Size {item.size}</div>
                <h4 className="font-bold text-sm sm:text-base text-[#542747]">{item.title}</h4>
                <div className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Saves {item.waterSaved}L Water
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-[#542747]">৳{numericPrice.toLocaleString()}</div>
                <div className="text-xs text-[#38302F]/50 line-through">Orig {item.originalPrice}</div>
              </div>
            </div>

            {/* Delivery Details Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#542747] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#A94F2C]" />
                <span>Campus Delivery / Pickup Location</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#542747] mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-white border border-[#E9C7B7] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#542747] mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-white border border-[#E9C7B7] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#542747] mb-1">University Campus</label>
                <input
                  type="text"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-white border border-[#E9C7B7] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#542747] mb-1">Drop-off Point / Hall / Floor</label>
                <input
                  type="text"
                  value={hallOrBuilding}
                  onChange={(e) => setHallOrBuilding(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-white border border-[#E9C7B7] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                />
              </div>

              {/* Delivery Option Selector */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliveryOption('CAMPUS_PICKUP')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    deliveryOption === 'CAMPUS_PICKUP'
                      ? 'border-[#542747] bg-[#542747] text-white shadow-xs'
                      : 'border-[#E9C7B7] bg-white text-[#38302F]'
                  }`}
                >
                  <div className="text-xs font-bold">🏫 Campus Booth Pickup</div>
                  <div className="text-[11px] opacity-80 mt-0.5">Free (0৳) • Same Day</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryOption('STANDARD_DELIVERY')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    deliveryOption === 'STANDARD_DELIVERY'
                      ? 'border-[#542747] bg-[#542747] text-white shadow-xs'
                      : 'border-[#E9C7B7] bg-white text-[#38302F]'
                  }`}
                >
                  <div className="text-xs font-bold">🛵 Direct Hall Delivery</div>
                  <div className="text-[11px] opacity-80 mt-0.5">৳60 Courier Fee • Next Day</div>
                </button>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4 border-t border-[#E9C7B7] flex justify-between items-center">
              <div>
                <div className="text-xs text-[#38302F]/60">Total Estimated:</div>
                <div className="text-lg font-black text-[#542747]">৳{totalAmount.toLocaleString()}</div>
              </div>
              <button
                onClick={() => setStep('payment')}
                className="px-6 py-2.5 rounded-xl bg-[#A94F2C] hover:bg-[#8c3e20] text-white font-bold text-sm flex items-center gap-1.5 shadow-md"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: STRIPE & PAYMENT METHOD SELECTION */}
        {step === 'payment' && (
          <form onSubmit={handlePayNow} className="space-y-6">
            
            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('STRIPE_CARD')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                  paymentMethod === 'STRIPE_CARD'
                    ? 'border-[#542747] bg-[#542747] text-white shadow-md'
                    : 'border-[#E9C7B7] bg-white text-[#38302F] hover:bg-[#E9C7B7]/20'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[#E58B51]" />
                <span className="text-xs font-bold">Stripe Card</span>
                <span className="text-[10px] opacity-75">Visa / Mastercard</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('SWAP_CREDITS')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                  paymentMethod === 'SWAP_CREDITS'
                    ? 'border-[#542747] bg-[#542747] text-white shadow-md'
                    : 'border-[#E9C7B7] bg-white text-[#38302F] hover:bg-[#E9C7B7]/20'
                }`}
              >
                <RefreshCw className="w-5 h-5 text-[#A94F2C]" />
                <span className="text-xs font-bold">Swap Credits</span>
                <span className="text-[10px] opacity-75">Pay with Points</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-[#542747] bg-[#542747] text-white shadow-md'
                    : 'border-[#E9C7B7] bg-white text-[#38302F] hover:bg-[#E9C7B7]/20'
                }`}
              >
                <Truck className="w-5 h-5 text-[#542747]" />
                <span className="text-xs font-bold">Cash On Pickup</span>
                <span className="text-[10px] opacity-75">Campus Handover</span>
              </button>
            </div>

            {/* STRIPE CARD SECTION */}
            {paymentMethod === 'STRIPE_CARD' && (
              <div className="bg-white p-5 rounded-2xl border-2 border-[#542747]/20 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#542747]" />
                    <span className="text-xs font-bold text-[#542747]">Stripe Secure Payment Elements</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillStripeTestCard('success')}
                    className="text-[11px] font-bold text-[#A94F2C] hover:underline bg-[#FFF5EB] px-2 py-0.5 rounded border border-[#E9C7B7]"
                  >
                    ⚡ Auto-fill Test Card (4242)
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#38302F] mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E9C7B7] focus:ring-2 focus:ring-[#A94F2C] font-mono tracking-wider"
                    />
                    <CreditCard className="w-4 h-4 text-[#A94F2C] absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#38302F] mb-1">MM / YY</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E9C7B7] focus:ring-2 focus:ring-[#A94F2C] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#38302F] mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E9C7B7] focus:ring-2 focus:ring-[#A94F2C] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#38302F] mb-1">Postal Code</label>
                    <input
                      type="text"
                      placeholder="1212"
                      value={cardZip}
                      onChange={(e) => setCardZip(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E9C7B7] focus:ring-2 focus:ring-[#A94F2C] font-mono"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-[#38302F]/70 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Zero-cost developer integration via Stripe API Test Credentials.</span>
                </div>
              </div>
            )}

            {/* SWAP CREDITS SECTION */}
            {paymentMethod === 'SWAP_CREDITS' && (
              <div className="bg-white p-5 rounded-2xl border border-[#E9C7B7] space-y-3">
                <div className="text-xs font-bold text-[#542747] flex items-center justify-between">
                  <span>Your Swap Credit Balance:</span>
                  <span className="text-[#A94F2C] text-sm font-extrabold">{currentUser?.swapCredits || 120} Credits</span>
                </div>
                <div className="text-xs text-[#38302F]/80 leading-relaxed">
                  Required for this transaction: <strong>{Math.round(totalAmount / 40)} Credits</strong>.
                  You will have {Math.max(0, (currentUser?.swapCredits || 120) - Math.round(totalAmount / 40))} Credits remaining.
                </div>
              </div>
            )}

            {/* CASH ON DELIVERY SECTION */}
            {paymentMethod === 'CASH_ON_DELIVERY' && (
              <div className="bg-white p-5 rounded-2xl border border-[#E9C7B7] space-y-2">
                <div className="text-xs font-bold text-[#542747]">Campus Handover Instructions</div>
                <p className="text-xs text-[#38302F]/80">
                  You will pay <strong>৳{totalAmount.toLocaleString()}</strong> in cash upon inspecting and receiving the garment at the campus delivery spot.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Order Summary Table */}
            <div className="bg-white p-4 rounded-xl border border-[#E9C7B7] space-y-1.5 text-xs text-[#38302F]">
              <div className="flex justify-between">
                <span>Garment Price:</span>
                <span className="font-semibold">৳{numericPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Campus Delivery:</span>
                <span className="font-semibold">{deliveryFee === 0 ? 'Free (0৳)' : `৳${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Circular Fashion Bonus Discount:</span>
                <span className="font-semibold">-৳{sustainableDiscount}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E9C7B7] text-sm font-black text-[#542747]">
                <span>Total Payable:</span>
                <span className="text-[#A94F2C]">৳{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-xs font-bold text-[#542747] hover:underline"
              >
                ← Back to Delivery
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-[#A94F2C] hover:bg-[#8c3e20] text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing with Stripe...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ৳{totalAmount.toLocaleString()} Now</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* STEP 3: ORDER CONFIRMATION & RECEIPT */}
        {step === 'success' && confirmedOrder && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-[#542747]">Payment Confirmed!</h3>
              <p className="text-xs text-[#38302F]/70">
                Your order has been verified and logged in the ReWear circular transaction registry.
              </p>
            </div>

            {/* Printable Receipt Card */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#E9C7B7] space-y-4 shadow-sm text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-[#E9C7B7]">
                <div>
                  <div className="font-mono text-xs font-bold text-[#542747]">{confirmedOrder.orderNumber}</div>
                  <div className="text-[10px] text-[#38302F]/50">{new Date(confirmedOrder.createdAt).toLocaleString()}</div>
                </div>
                <div className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                  confirmedOrder.orderStatus === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Status: {confirmedOrder.orderStatus}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#A94F2C] uppercase">Item Details</div>
                <div className="font-bold text-[#542747] text-sm">{confirmedOrder.itemTitle}</div>
                <div className="text-[#38302F]/70">Brand: {confirmedOrder.itemBrand}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-y border-[#E9C7B7]">
                <div>
                  <div className="text-[10px] font-bold text-[#38302F]/60 uppercase">Delivery Destination</div>
                  <div className="font-semibold text-[#542747] mt-0.5">{confirmedOrder.deliveryAddress.fullName}</div>
                  <div className="text-[#38302F]/70 text-[11px]">{confirmedOrder.deliveryAddress.campus}</div>
                  <div className="text-[#38302F]/70 text-[11px]">{confirmedOrder.deliveryAddress.hallOrBuilding}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#38302F]/60 uppercase">Payment Info</div>
                  <div className="font-semibold text-[#542747] mt-0.5">
                    {confirmedOrder.paymentMethod === 'STRIPE_CARD' ? `Stripe Card (••• ${confirmedOrder.cardLast4})` : confirmedOrder.paymentMethod}
                  </div>
                  <div className="text-emerald-700 font-bold">Payment Status: {confirmedOrder.paymentStatus}</div>
                  {confirmedOrder.stripePaymentIntentId && (
                    <div className="text-[10px] text-[#38302F]/50 font-mono mt-0.5 truncate">
                      Intent: {confirmedOrder.stripePaymentIntentId}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-[#542747]">
                <span>Total Amount Paid:</span>
                <span className="text-[#A94F2C]">৳{confirmedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Cancellation Window Policy Notice */}
            <div className="bg-[#FFF5EB] p-3 rounded-xl border border-[#E9C7B7] text-[11px] text-[#38302F]/80 flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#A94F2C] shrink-0 mt-0.5" />
              <div>
                <strong>Cancellation Rules:</strong> You can cancel this order online within <strong>2 hours of placement</strong> prior to campus dispatch.
                Charges will be credited back via Stripe / Swap Wallet.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
              {confirmedOrder.orderStatus === 'CONFIRMED' && !showCancelConfirm && !cancelSuccess && (
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                >
                  Cancel Order & Request Refund
                </button>
              )}

              {/* Inline Cancellation Confirmation Panel */}
              {showCancelConfirm && (
                <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-800">
                      <strong>Confirm Cancellation:</strong> Cancel order <strong>{confirmedOrder.orderNumber}</strong>? Any Stripe charges will be automatically refunded within 3–5 business days.
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#542747] bg-white border border-[#E9C7B7] hover:bg-[#E9C7B7]/30"
                    >
                      Keep Order
                    </button>
                    <button
                      type="button"
                      onClick={confirmCancellation}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700"
                    >
                      Yes, Cancel & Refund
                    </button>
                  </div>
                </div>
              )}

              {/* Cancellation Success Banner */}
              {cancelSuccess && (
                <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Order <strong>{confirmedOrder.orderNumber}</strong> cancelled successfully. Refund initiated.</span>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E9C7B7] text-[#542747] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#E9C7B7]/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-[#542747] text-white font-bold text-xs hover:bg-[#A94F2C] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
