import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sliders,
  MessageSquare,
  Droplets,
  Award,
  ChevronRight,
  Send,
  Layers,
  Shirt
} from 'lucide-react';

export default function SmartSwapStudioModal({ isOpen, onClose, targetItem, currentUser, onOfferCreated }) {
  if (!isOpen) return null;

  // Active Tab: 'studio' (Matchmaker) or 'offers' (Escrow Manager)
  const [activeTab, setActiveTab] = useState('studio');

  // User Closet Items
  const userCloset = [
    {
      id: 'closet_01',
      title: 'Sustainable Raw Denim Cargo Pants',
      category: 'Pants & Jeans',
      brand: "Levi's Circular",
      size: '32',
      condition: 'Good',
      estimatedValueBDT: 2100,
      image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'closet_02',
      title: 'University Vintage Wool Blend Sweater',
      category: 'Knitwear',
      brand: 'Uniqlo Circular',
      size: 'M',
      condition: 'Like New',
      estimatedValueBDT: 1750,
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'closet_03',
      title: 'Hand-Woven Jamdani Accent Vest',
      category: 'Tops & Vests',
      brand: 'Aarong Heritage',
      size: 'M',
      condition: 'Brand New w/ Tags',
      estimatedValueBDT: 1950,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400',
    },
  ];

  const [selectedClosetItem, setSelectedClosetItem] = useState(userCloset[0]);

  // Target Item (from marketplace)
  const marketplaceItem = targetItem || {
    id: 'target_01',
    title: 'Vintage Corduroy Oversized Jacket',
    category: 'Outerwear',
    brand: 'Zara Eco-Line',
    size: 'M',
    condition: 'Like New',
    estimatedValueBDT: 1850,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=400',
    seller: 'Ayesha K. (BRACU)',
  };

  // Adjustments & Negotiation
  const [cashAdjustment, setCashAdjustment] = useState(0);
  const [creditAdjustment, setCreditAdjustment] = useState(10);
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiRationale, setAiRationale] = useState('');

  // Swap Offers In-Memory Ledger
  const [offersList, setOffersList] = useState([
    {
      id: 'swp_01',
      offerNumber: 'SWP-2026-3829',
      initiatorName: 'Mehedi Hasan (Member 3)',
      initiatorItemTitle: "Levi's Raw Denim Cargo Pants",
      receiverName: 'Ayesha Khan (BRACU)',
      receiverItemTitle: 'Vintage Corduroy Oversized Jacket',
      compatibilityScore: 92,
      status: 'ESCROW_LOCKED',
      cashAdjustment: 0,
      creditAdjustment: 15,
      isEscrowProtected: true,
      aiNote: 'High style compatibility. 5,900L of water saved through exchange.',
      createdAt: 'Today, 2:15 PM',
    },
    {
      id: 'swp_02',
      offerNumber: 'SWP-2026-5120',
      initiatorName: 'Tanvir Hossain (DU)',
      initiatorItemTitle: 'Embroidered Cotton Panjabi',
      receiverName: 'Mehedi Hasan',
      receiverItemTitle: 'Wool Blend Sweater',
      compatibilityScore: 78,
      status: 'PROPOSED',
      cashAdjustment: 100,
      creditAdjustment: 0,
      isEscrowProtected: false,
      aiNote: 'Seasonal disparity, compensated by +৳100 cash adjustment.',
      createdAt: 'Yesterday, 6:40 PM',
    },
  ]);

  // 1. Calculate 4-Factor Compatibility
  const calculateScore = () => {
    let cat = 15;
    if (selectedClosetItem.category === marketplaceItem.category) cat = 25;
    else if (selectedClosetItem.category.includes('Pants') && marketplaceItem.category.includes('Outerwear')) cat = 22;

    let sz = 15;
    if (selectedClosetItem.size === marketplaceItem.size) sz = 25;
    else if (['32', 'M'].includes(selectedClosetItem.size) && ['32', 'M'].includes(marketplaceItem.size)) sz = 24;

    const delta = Math.abs(selectedClosetItem.estimatedValueBDT - marketplaceItem.estimatedValueBDT);
    let val = delta <= 150 ? 25 : delta <= 350 ? 21 : 14;

    let cond = selectedClosetItem.condition === marketplaceItem.condition ? 25 : 20;

    const total = Math.min(100, cat + sz + val + cond);
    return { cat, sz, val, cond, total, delta };
  };

  const comp = calculateScore();

  // 2. Trigger AI Analysis
  const handleGenerateAiInsight = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setIsAiGenerating(false);
      const rationaleText = `AI Circular Trade Analysis (${comp.total}% Match):
"${selectedClosetItem.title}" and "${marketplaceItem.title}" represent high-synergy campus style. Size match is ideal for comfortable layering. The value delta is ৳${comp.delta}, which is balanced by ${creditAdjustment} Swap Credits. By choosing to swap rather than purchasing retail, you both prevent ~5,200L of industrial water runoff!`;

      const suggestedMessage = `Hi ${marketplaceItem.seller || 'there'}! I’d love to trade my ${selectedClosetItem.title} (${selectedClosetItem.condition}) for your ${marketplaceItem.title}. ReWear calculates our trade at ${comp.total}% compatibility. I've added ${creditAdjustment} Swap Credits to keep things equitable. Let me know if you’d like to meet on campus!`;

      setAiRationale(rationaleText);
      setNegotiationMessage(suggestedMessage);
    }, 800);
  };

  // 3. Send Swap Offer
  const handleSendOffer = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOffer = {
      id: `swp_${Date.now()}`,
      offerNumber: `SWP-2026-${randomNum}`,
      initiatorName: currentUser?.name || 'Mehedi Hasan (Member 3)',
      initiatorItemTitle: selectedClosetItem.title,
      receiverName: marketplaceItem.seller || 'Ayesha K. (BRACU)',
      receiverItemTitle: marketplaceItem.title,
      compatibilityScore: comp.total,
      status: 'PROPOSED',
      cashAdjustment,
      creditAdjustment,
      isEscrowProtected: false,
      aiNote: aiRationale || `Automated trade proposal with ${comp.total}% algorithmic compatibility.`,
      createdAt: 'Just now',
    };

    setOffersList(prev => [newOffer, ...prev]);
    setActiveTab('offers');
    alert(`Swap Offer ${newOffer.offerNumber} submitted! Item marked as pending negotiation.`);
    if (onOfferCreated) onOfferCreated(newOffer);
  };

  // 4. Accept Offer & Trigger Escrow Lock
  const handleAcceptOffer = (offerId) => {
    setOffersList(prev =>
      prev.map(item => {
        if (item.id === offerId) {
          return {
            ...item,
            status: 'ESCROW_LOCKED',
            isEscrowProtected: true,
          };
        }
        return item;
      })
    );
    alert('Offer accepted! Both garments are now ESCROW-LOCKED to prevent double-swaps.');
  };

  // 5. Reject Offer
  const handleRejectOffer = (offerId) => {
    setOffersList(prev =>
      prev.map(item => {
        if (item.id === offerId) {
          return { ...item, status: 'REJECTED', isEscrowProtected: false };
        }
        return item;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#FFF5EB] w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#E9C7B7] relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#E9C7B7]/60 text-[#542747] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E9C7B7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#542747] flex items-center justify-center text-[#FFF5EB] shadow-sm">
              <RefreshCw className="w-5 h-5 text-[#E58B51]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#A94F2C] uppercase tracking-wider">Member 3 • Feature 12 (AI Integrated)</div>
              <h2 className="text-xl sm:text-2xl font-black text-[#542747]">
                AI Swap Matchmaker & Escrow State Machine
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-[#E9C7B7]/50 p-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'studio' ? 'bg-[#542747] text-white shadow-xs' : 'text-[#38302F]'
              }`}
            >
              Matchmaker Studio
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'offers' ? 'bg-[#542747] text-white shadow-xs' : 'text-[#38302F]'
              }`}
            >
              <span>Escrow Offers</span>
              <span className="w-4 h-4 rounded-full bg-[#A94F2C] text-white text-[10px] flex items-center justify-center font-bold">
                {offersList.filter(o => o.status === 'ESCROW_LOCKED').length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: MATCHMAKER STUDIO */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            
            {/* 1. Comparison Board */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Left Item: From User Closet */}
              <div className="md:col-span-5 bg-white p-4 rounded-2xl border border-[#E9C7B7] space-y-2">
                <div className="text-xs font-bold text-[#A94F2C] uppercase flex items-center justify-between">
                  <span>Your Closet Garment</span>
                  <span className="text-[10px] font-normal text-[#38302F]/60">Choose item below</span>
                </div>
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#FFF5EB]">
                  <img src={selectedClosetItem.image} alt={selectedClosetItem.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-sm text-[#542747]">{selectedClosetItem.title}</h4>
                <div className="flex justify-between text-xs text-[#38302F]/70">
                  <span>Size {selectedClosetItem.size} • {selectedClosetItem.condition}</span>
                  <span className="font-bold text-[#542747]">Est. ৳{selectedClosetItem.estimatedValueBDT}</span>
                </div>

                {/* Closet Selector Pill */}
                <div className="pt-2 border-t border-[#E9C7B7] space-y-1">
                  <div className="text-[10px] font-bold text-[#38302F]/60 uppercase">Switch closet piece:</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {userCloset.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedClosetItem(c)}
                        className={`text-[10px] p-1.5 rounded-lg border text-left truncate transition-colors ${
                          selectedClosetItem.id === c.id
                            ? 'border-[#542747] bg-[#542747] text-white font-bold'
                            : 'border-[#E9C7B7] bg-[#FFF5EB] hover:bg-[#E9C7B7]/40'
                        }`}
                      >
                        {c.title.split(' ')[0]} {c.title.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle: Compatibility Gauge */}
              <div className="md:col-span-2 flex flex-col items-center justify-center text-center p-2 space-y-2">
                <div className="w-16 h-16 rounded-full bg-[#542747] text-[#FFF5EB] flex flex-col items-center justify-center shadow-lg border-2 border-[#E58B51]">
                  <span className="text-xl font-black">{comp.total}%</span>
                  <span className="text-[9px] uppercase font-bold text-[#E9C7B7]">Match</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {comp.total >= 90 ? 'High Synergy' : 'Fair Exchange'}
                </div>
                <RefreshCw className="w-5 h-5 text-[#A94F2C] animate-spin-slow hidden md:block" />
              </div>

              {/* Right Item: Marketplace Target */}
              <div className="md:col-span-5 bg-white p-4 rounded-2xl border border-[#E9C7B7] space-y-2">
                <div className="text-xs font-bold text-[#542747] uppercase flex items-center justify-between">
                  <span>Marketplace Garment</span>
                  <span className="text-[10px] text-[#A94F2C] font-semibold">{marketplaceItem.seller}</span>
                </div>
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#FFF5EB]">
                  <img src={marketplaceItem.image} alt={marketplaceItem.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-sm text-[#542747]">{marketplaceItem.title}</h4>
                <div className="flex justify-between text-xs text-[#38302F]/70">
                  <span>Size {marketplaceItem.size} • {marketplaceItem.condition}</span>
                  <span className="font-bold text-[#542747]">Est. ৳{marketplaceItem.estimatedValueBDT}</span>
                </div>

                <div className="pt-2 border-t border-[#E9C7B7] text-[11px] text-[#38302F]/70 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified seller with condition disclosure</span>
                </div>
              </div>

            </div>

            {/* 2. 4-Factor Breakdown Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-2xl border border-[#E9C7B7] text-xs">
              <div className="p-2 rounded-xl bg-[#FFF5EB] border border-[#E9C7B7]/50">
                <div className="text-[10px] font-bold text-[#38302F]/60 uppercase">Category Match</div>
                <div className="text-sm font-extrabold text-[#542747]">{comp.cat} / 25 pts</div>
              </div>
              <div className="p-2 rounded-xl bg-[#FFF5EB] border border-[#E9C7B7]/50">
                <div className="text-[10px] font-bold text-[#38302F]/60 uppercase">Size Parity</div>
                <div className="text-sm font-extrabold text-[#542747]">{comp.sz} / 25 pts</div>
              </div>
              <div className="p-2 rounded-xl bg-[#FFF5EB] border border-[#E9C7B7]/50">
                <div className="text-[10px] font-bold text-[#38302F]/60 uppercase">Valuation Delta</div>
                <div className="text-sm font-extrabold text-[#542747]">{comp.val} / 25 pts (৳{comp.delta})</div>
              </div>
              <div className="p-2 rounded-xl bg-[#FFF5EB] border border-[#E9C7B7]/50">
                <div className="text-[10px] font-bold text-[#38302F]/60 uppercase">Condition Alignment</div>
                <div className="text-sm font-extrabold text-[#542747]">{comp.cond} / 25 pts</div>
              </div>
            </div>

            {/* 3. AI Rationale & Negotiation Pitch Box */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#542747]/20 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#A94F2C]" />
                  <span className="text-sm font-bold text-[#542747]">AI Fashion Match & Negotiation Engine</span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAiInsight}
                  disabled={isAiGenerating}
                  className="px-3.5 py-1.5 bg-[#FFF5EB] hover:bg-[#E9C7B7]/50 border border-[#E9C7B7] rounded-xl text-xs font-bold text-[#542747] flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E58B51]" />
                  <span>{isAiGenerating ? 'Consulting Gemini AI...' : 'Generate AI Trade Analysis'}</span>
                </button>
              </div>

              {aiRationale ? (
                <div className="bg-[#FFF5EB] p-3.5 rounded-xl border border-[#E9C7B7] text-xs space-y-2 text-[#38302F]">
                  <p className="leading-relaxed font-medium">{aiRationale}</p>
                </div>
              ) : (
                <div className="bg-[#FFF5EB] p-3 rounded-xl border border-dashed border-[#E9C7B7] text-xs text-[#38302F]/60 text-center">
                  Click "Generate AI Trade Analysis" to run the intelligent fashion pairing & negotiation generator.
                </div>
              )}

              {/* Negotiation Message Editor */}
              <div>
                <label className="block text-xs font-semibold text-[#542747] mb-1">
                  Negotiation Message (Sent with Swap Offer)
                </label>
                <textarea
                  rows="3"
                  value={negotiationMessage}
                  onChange={(e) => setNegotiationMessage(e.target.value)}
                  placeholder="e.g. Hi! Would you like to swap your jacket for my cargo pants? Happy to meet up at the university cafeteria!"
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[#E9C7B7] focus:ring-2 focus:ring-[#A94F2C] focus:outline-none"
                ></textarea>
              </div>

              {/* Economic Adjustment (Cash / Credits) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#38302F] mb-1">
                    Cash Adjustment (Optional): +৳{cashAdjustment}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="50"
                    value={cashAdjustment}
                    onChange={(e) => setCashAdjustment(parseInt(e.target.value))}
                    className="w-full accent-[#A94F2C] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#38302F]/60">
                    <span>Direct 1:1 (৳0)</span>
                    <span>৳250</span>
                    <span>৳500</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#38302F] mb-1">
                    Swap Credits Adjustment: +{creditAdjustment} Credits
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="5"
                    value={creditAdjustment}
                    onChange={(e) => setCreditAdjustment(parseInt(e.target.value))}
                    className="w-full accent-[#542747] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#38302F]/60">
                    <span>0 Credits</span>
                    <span>20 Credits</span>
                    <span>40 Credits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-1.5 text-xs text-[#542747] font-semibold">
                <Lock className="w-4 h-4 text-[#A94F2C]" />
                <span>Accepted offers automatically trigger Escrow Item Lock</span>
              </div>

              <button
                type="button"
                onClick={handleSendOffer}
                className="px-6 py-3 rounded-xl bg-[#542747] hover:bg-[#A94F2C] text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Propose Swap Offer</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: ACTIVE OFFERS & ESCROW MANAGER */}
        {activeTab === 'offers' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-[#542747] text-white p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#E58B51]" />
                <div>
                  <div className="text-xs font-bold">ReWear Circular Escrow Protection Active</div>
                  <div className="text-[11px] text-[#E9C7B7]">Items with active swaps are locked in escrow to prevent double-swaps or conflicting purchases.</div>
                </div>
              </div>
              <span className="text-xs bg-[#A94F2C] px-2.5 py-1 rounded-full font-bold">
                {offersList.filter(o => o.status === 'ESCROW_LOCKED').length} Locked in Escrow
              </span>
            </div>

            {/* Offers List */}
            <div className="space-y-3">
              {offersList.map(offer => (
                <div
                  key={offer.id}
                  className={`bg-white p-4 rounded-2xl border transition-all ${
                    offer.status === 'ESCROW_LOCKED'
                      ? 'border-2 border-emerald-500 shadow-sm'
                      : 'border-[#E9C7B7]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E9C7B7]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#542747]">{offer.offerNumber}</span>
                        <span className="text-[10px] text-[#38302F]/50">• {offer.createdAt}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#38302F] mt-0.5">
                        Initiator: <strong>{offer.initiatorName}</strong> ↔ Receiver: <strong>{offer.receiverName}</strong>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {offer.status === 'ESCROW_LOCKED' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" /> ESCROW LOCKED (Safe Trade)
                        </span>
                      )}
                      {offer.status === 'PROPOSED' && (
                        <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full">
                          Pending Review
                        </span>
                      )}
                      {offer.status === 'REJECTED' && (
                        <span className="bg-red-100 text-red-800 text-[11px] font-bold px-3 py-1 rounded-full">
                          Offer Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Trade Exchange Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-[#A94F2C] uppercase">Offered Garment:</div>
                      <div className="font-bold text-[#542747] text-sm mt-0.5">{offer.initiatorItemTitle}</div>
                      {(offer.cashAdjustment > 0 || offer.creditAdjustment > 0) && (
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          Adjustment: {offer.cashAdjustment > 0 ? `+৳${offer.cashAdjustment} cash ` : ''}
                          {offer.creditAdjustment > 0 ? `+${offer.creditAdjustment} Swap Credits` : ''}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-[#542747] uppercase">Requested Garment:</div>
                      <div className="font-bold text-[#542747] text-sm mt-0.5">{offer.receiverItemTitle}</div>
                      <div className="text-[11px] text-[#38302F]/60 mt-0.5">Compatibility: <strong>{offer.compatibilityScore}%</strong></div>
                    </div>
                  </div>

                  <div className="bg-[#FFF5EB] p-2.5 rounded-xl border border-[#E9C7B7] text-[11px] text-[#38302F]/80">
                    <span className="font-bold text-[#542747]">AI Insight: </span>
                    {offer.aiNote}
                  </div>

                  {/* Action Buttons */}
                  {offer.status === 'PROPOSED' && (
                    <div className="flex justify-end gap-2 pt-3 border-t border-[#E9C7B7] mt-3">
                      <button
                        type="button"
                        onClick={() => handleRejectOffer(offer.id)}
                        className="px-3.5 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition-colors"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcceptOffer(offer.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Accept & Lock in Escrow</span>
                      </button>
                    </div>
                  )}

                  {offer.status === 'ESCROW_LOCKED' && (
                    <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                      <span>🔒 Both items removed from public sale/swap during exchange.</span>
                      <button
                        type="button"
                        onClick={() => alert(`Exchange details: Arrange meetup at ${offer.receiverName}'s campus booth or dispatch via Campus Courier.`)}
                        className="text-[#542747] underline hover:text-[#A94F2C]"
                      >
                        Arrange Campus Handover
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
