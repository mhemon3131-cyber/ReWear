import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  X,
  CheckCircle2,
  Tag,
  ShoppingBag,
  RefreshCw,
  Calendar,
  Layers,
  ShieldAlert,
  Check,
  Lock,
  PauseCircle,
  PlayCircle,
  Trash2,
} from 'lucide-react';
import { requestAiCopilotDraft, createBackendListing, updateBackendListingStatus } from '../services/listingService';

// Pre-set sample garments for easy instant demonstration
const SAMPLE_GARMENTS = [
  {
    id: 'sample_1',
    label: 'Corduroy Jacket',
    categoryHint: 'vintage corduroy jacket outerwear',
    brand: 'Zara Eco-Line',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'sample_2',
    label: 'Jamdani Vest',
    categoryHint: 'handloom jamdani fusion vest ethnic',
    brand: 'Aarong Heritage',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'sample_3',
    label: 'Raw Denim Jeans',
    categoryHint: 'relaxed raw denim cargo pants',
    brand: "Levi's Circular",
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'sample_4',
    label: 'Winter Knitwear',
    categoryHint: 'chunky oversized turtleneck knit sweater',
    brand: 'H&M Conscious',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600',
  },
];

export default function SellerStudioModal({
  isOpen,
  onClose,
  currentUser,
  listings,
  onListingCreated,
  onListingUpdated,
  onListingDeleted,
}) {
  // Main Tab: 'create' (Listing Copilot) or 'inventory' (Inventory Management)
  const [activeTab, setActiveTab] = useState('create');

  // Listing Copilot State
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_GARMENTS[0].image);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [copilotGenerated, setCopilotGenerated] = useState(false);

  // Form State (Editable by seller after AI Copilot draft)
  const [title, setTitle] = useState('Vintage Corduroy Oversized Utility Jacket');
  const [category, setCategory] = useState('Outerwear');
  const [brand, setBrand] = useState('Zara Eco-Line');
  const [size, setSize] = useState('M');
  const [description, setDescription] = useState(
    'Elevated 90s vintage silhouette with structured dropped shoulders and deep utility cargo pockets. Crafted from durable textured corduroy. Ideal for university campus layering.'
  );
  const [colors, setColors] = useState(['Deep Plum', 'Burnt Orange']);
  const [tags, setTags] = useState(['Vintage', 'Corduroy', 'Outerwear', 'CampusThrift']);
  const [condition, setCondition] = useState('Like New');
  const [hasAuthenticityProof, setHasAuthenticityProof] = useState(true);

  // Multi-Mode Configuration State
  const [enableBuy, setEnableBuy] = useState(true);
  const [salePrice, setSalePrice] = useState(1850);

  const [enableSwap, setEnableSwap] = useState(true);
  const [swapCredits, setSwapCredits] = useState(45);

  const [enableRent, setEnableRent] = useState(true);
  const [rentPricePerDay, setRentPricePerDay] = useState(250);
  const [rentalDeposit, setRentalDeposit] = useState(600);

  // Inventory Filter State
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState('ALL');

  if (!isOpen) return null;

  // Run AI Copilot scanning simulation
  const handleRunCopilotScan = async () => {
    setIsScanning(true);
    setScanStep(1);

    setTimeout(() => setScanStep(2), 600);
    setTimeout(() => setScanStep(3), 1200);

    const activePhoto = customPhotoUrl.trim() || selectedPhoto;
    const result = await requestAiCopilotDraft(activePhoto, brand, description);

    setTimeout(() => {
      setTitle(result.suggestedTitle);
      setCategory(result.suggestedCategory);
      setDescription(result.suggestedDescription);
      setColors(result.suggestedColors || ['Deep Plum', 'Burnt Orange']);
      setTags(result.suggestedTags || ['Sustainable', 'CampusThrift']);
      setSalePrice(result.estimatedResaleRange?.recommended || 1850);
      setSwapCredits(result.recommendedSwapCredits || 45);
      setRentPricePerDay(result.recommendedDailyRentalFee || 250);
      setIsScanning(false);
      setCopilotGenerated(true);
    }, 1800);
  };

  // Submit Listing as either DRAFT or ACTIVE
  const handleSaveListing = async (targetStatus) => {
    // Validate modes
    const modes = [];
    if (enableBuy) modes.push('buy');
    if (enableSwap) modes.push('swap');
    if (enableRent) modes.push('rent');

    if (modes.length === 0) {
      alert('Please enable at least one transaction mode: Buy, Swap, or Rent.');
      return;
    }

    if (enableBuy && (!salePrice || Number(salePrice) <= 0)) {
      alert('Please enter a valid sale price in BDT.');
      return;
    }

    const newListing = {
      title,
      description,
      brand: brand || 'Vintage Discovery',
      category,
      size,
      color: colors,
      images: [customPhotoUrl.trim() || selectedPhoto],
      condition,
      defectDisclosure: 'Condition verified by seller; all structural components inspected.',
      modes,
      salePrice: enableBuy ? Number(salePrice) : undefined,
      swapCredits: enableSwap ? Number(swapCredits) : undefined,
      rentalPricePerDay: enableRent ? Number(rentPricePerDay) : undefined,
      rentalDeposit: enableRent ? Number(rentalDeposit) : undefined,
      status: targetStatus, // 'DRAFT' or 'ACTIVE'
      sellerId: currentUser?.email || 'usr_02',
      sellerName: currentUser?.name || 'Zerin Tasnim (Seller)',
      sellerUniversity: 'Dhaka University',
      isVerifiedSeller: true,
      waterSavingsLiters: 2800,
      co2AvoidedKg: 3.4,
    };

    const saved = await createBackendListing(newListing);
    onListingCreated(saved);

    alert(
      targetStatus === 'DRAFT'
        ? `Listing saved as DRAFT in your inventory! It is hidden from public buyers until you publish.`
        : `Listing successfully PUBLISHED to ReWear Marketplace as ACTIVE!`
    );

    setActiveTab('inventory');
  };

  // Status transitions for Inventory Management
  const handleStatusChange = async (itemId, nextStatus, label) => {
    await updateBackendListingStatus(itemId, nextStatus, label);
    onListingUpdated(itemId, nextStatus);
  };

  // Filter seller's listings for inventory tab
  const sellerListings = listings.filter(
    (item) => !currentUser || item.seller === currentUser.name || item.sellerId === currentUser.email || item.sellerId === 'usr_02'
  );

  const filteredInventory = sellerListings.filter((item) => {
    if (inventoryStatusFilter === 'ALL') return true;
    return (item.status || 'ACTIVE').toUpperCase() === inventoryStatusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#FFF5EB] w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border-2 border-[#E9C7B7] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-[#542747] text-white flex items-center justify-between border-b border-[#E9C7B7]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A94F2C] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-[#FFF5EB]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-[#FFF5EB]">
                  Seller Studio & AI Copilot
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E58B51] text-white">
                  Seller Studio
                </span>
              </div>
              <p className="text-xs text-[#E9C7B7]/80">
                AI Listing Intelligence & Multi-Mode Inventory Manager
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#FFF5EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex border-b border-[#E9C7B7] bg-white px-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'create'
                ? 'border-[#A94F2C] text-[#A94F2C]'
                : 'border-transparent text-[#38302F]/60 hover:text-[#542747]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>1. AI Listing Copilot (Snap & Sell)</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-[#A94F2C] text-[#A94F2C]'
                : 'border-transparent text-[#38302F]/60 hover:text-[#542747]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Multi-Mode Inventory Management</span>
            <span className="bg-[#E9C7B7] text-[#542747] text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              {sellerListings.length}
            </span>
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ============================================================ */}
          {/* TAB 1: AI LISTING COPILOT & MULTI-MODE DRAFTING */}
          {/* ============================================================ */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              
              {/* Step 1: Photo Upload / Selection */}
              <div className="bg-white p-5 rounded-2xl border border-[#E9C7B7] space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#542747] uppercase tracking-wider">
                    <Camera className="w-4 h-4 text-[#A94F2C]" />
                    <span>Step 1: Upload or Choose Garment Photo</span>
                  </div>
                  <span className="text-[11px] text-[#A94F2C] font-semibold">
                    Computer Vision Input
                  </span>
                </div>

                {/* Preset Garment Quick Pickers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SAMPLE_GARMENTS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(g.image);
                        setCustomPhotoUrl('');
                        setCopilotGenerated(false);
                      }}
                      className={`relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                        selectedPhoto === g.image && !customPhotoUrl
                          ? 'border-[#A94F2C] ring-2 ring-[#A94F2C]/30 shadow-md scale-102'
                          : 'border-[#E9C7B7] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={g.image} alt={g.label} className="w-full h-24 object-cover" />
                      <div className="p-2 bg-[#FFF5EB] text-[11px] font-bold text-[#542747] truncate">
                        {g.label}
                      </div>
                      {selectedPhoto === g.image && !customPhotoUrl && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#A94F2C] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Photo URL Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="Or paste an image URL here..."
                    value={customPhotoUrl}
                    onChange={(e) => {
                      setCustomPhotoUrl(e.target.value);
                      setCopilotGenerated(false);
                    }}
                    className="flex-1 px-3.5 py-2 bg-[#FFF5EB] rounded-xl border border-[#E9C7B7] text-xs text-[#38302F] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                  />
                  <button
                    type="button"
                    onClick={handleRunCopilotScan}
                    disabled={isScanning}
                    className="px-5 py-2.5 rounded-xl bg-[#542747] hover:bg-[#A94F2C] text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-[#E58B51]" />
                    <span>{isScanning ? 'AI Scanning...' : 'Run AI Listing Copilot'}</span>
                  </button>
                </div>

                {/* Scanning Progress Animation */}
                {isScanning && (
                  <div className="bg-[#FFF5EB] p-4 rounded-xl border border-[#E9C7B7] space-y-2 animate-pulse">
                    <div className="flex items-center justify-between text-xs font-bold text-[#542747]">
                      <span>AI Model Analyzing Garment Attributes...</span>
                      <span className="text-[#A94F2C]">Step {scanStep} of 3</span>
                    </div>
                    <div className="w-full bg-[#E9C7B7]/50 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#A94F2C] h-full transition-all duration-500"
                        style={{ width: `${(scanStep / 3) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-[11px] text-[#38302F]/70">
                      {scanStep === 1 && 'Extracting garment silhouette, weave texture, and neckline...'}
                      {scanStep === 2 && 'Mapping category, seasonal demand, and color tones...'}
                      {scanStep === 3 && 'Drafting SEO title, description, and searchable tags...'}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: AI Guardrail Disclaimer (PDF Constraint Compliance) */}
              <div className="bg-[#FFF5EB] p-4 rounded-2xl border border-[#E58B51]/60 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-[#A94F2C] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-[#542747]">
                    Quality & Authenticity Disclosure Policy
                  </div>
                  <p className="text-[#38302F]/80 leading-relaxed text-[11px]">
                    The AI Copilot extracts visible aesthetics, silhouette, and tags from images. 
                    <strong> AI does not assert an exact brand or fabric authenticity</strong> unless the seller supplies verified proof (e.g., brand tag, purchase receipt).
                  </p>
                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAuthenticityProof}
                      onChange={(e) => setHasAuthenticityProof(e.target.checked)}
                      className="accent-[#A94F2C] rounded"
                    />
                    <span className="text-[11px] font-bold text-[#542747]">
                      I confirm the brand tag / authenticity of this garment.
                    </span>
                  </label>
                </div>
              </div>

              {/* Step 3: Review & Edit Draft Listing */}
              <div className="bg-white p-5 rounded-2xl border border-[#E9C7B7] space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E9C7B7]/60 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#542747] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#A94F2C]" />
                    <span>Step 2: Review & Edit AI-Drafted Attributes</span>
                  </div>
                  {copilotGenerated && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> AI Copilot Generated
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#542747] mb-1">
                      Listing Title (AI-Drafted, Seller Reviewed)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FFF5EB] rounded-xl border border-[#E9C7B7] text-xs sm:text-sm text-[#38302F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-[#542747] mb-1">
                      Category Mapping
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FFF5EB] rounded-xl border border-[#E9C7B7] text-xs text-[#38302F] font-medium focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                    >
                      <option value="Outerwear">Outerwear (Jackets, Coats)</option>
                      <option value="Ethnic & Fusion">Ethnic & Fusion (Vests, Kurtis, Sarees)</option>
                      <option value="Denim">Denim (Jeans, Dungarees)</option>
                      <option value="Knitwear">Knitwear (Sweaters, Cardigans)</option>
                      <option value="Tops & Shirts">Tops & Shirts</option>
                      <option value="Dresses">Dresses & Jumpsuits</option>
                    </select>
                  </div>

                  {/* Brand, Size & Condition */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#542747] mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#FFF5EB] rounded-xl border border-[#E9C7B7] text-xs text-[#38302F] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#542747] mb-1">
                        Size
                      </label>
                      <input
                        type="text"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#FFF5EB] rounded-xl border border-[#E9C7B7] text-xs text-[#38302F] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#542747] mb-1">
                        Condition Grade
                      </label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full px-2 py-2.5 bg-[#FFF5EB] rounded-xl border border-[#E9C7B7] text-xs text-[#38302F] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                      >
                        <option value="Brand New w/ Tags">Brand New w/ Tags</option>
                        <option value="Like New">Like New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#542747] mb-1">
                      Product Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FFF5EB] rounded-xl border border-[#E9C7B7] text-xs text-[#38302F] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                    />
                  </div>

                  {/* Searchable Tags Preview */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#542747] mb-1">
                      AI Generated Search Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="bg-[#E9C7B7]/50 text-[#542747] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#E9C7B7]"
                        >
                          <Tag className="w-3 h-3 text-[#A94F2C]" />
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Multi-Mode Pricing & Inventory Settings */}
              <div className="bg-white p-5 rounded-2xl border border-[#E9C7B7] space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E9C7B7]/60 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#542747] uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-[#A94F2C]" />
                    <span>Step 3: Multi-Mode Product Configuration (Sell, Swap, Rent)</span>
                  </div>
                  <span className="text-[11px] text-[#A94F2C] font-semibold">
                    Dynamic Availability Control
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Mode 1: Buy / Sell */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      enableBuy
                        ? 'border-[#A94F2C] bg-[#FFF5EB]'
                        : 'border-[#E9C7B7]/60 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#542747]">
                        <input
                          type="checkbox"
                          checked={enableBuy}
                          onChange={(e) => setEnableBuy(e.target.checked)}
                          className="accent-[#A94F2C] rounded"
                        />
                        <ShoppingBag className="w-4 h-4 text-[#A94F2C]" />
                        <span>Sell Pre-Owned</span>
                      </label>
                    </div>
                    {enableBuy && (
                      <div className="mt-2 space-y-1">
                        <label className="text-[11px] font-semibold text-[#38302F]/70">
                          Sale Price (BDT ৳)
                        </label>
                        <input
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-[#E9C7B7] text-xs font-black text-[#542747] focus:outline-none focus:ring-1 focus:ring-[#A94F2C]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Mode 2: Swap Credits */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      enableSwap
                        ? 'border-[#542747] bg-[#FFF5EB]'
                        : 'border-[#E9C7B7]/60 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#542747]">
                        <input
                          type="checkbox"
                          checked={enableSwap}
                          onChange={(e) => setEnableSwap(e.target.checked)}
                          className="accent-[#542747] rounded"
                        />
                        <RefreshCw className="w-4 h-4 text-[#E58B51]" />
                        <span>Swap Exchange</span>
                      </label>
                    </div>
                    {enableSwap && (
                      <div className="mt-2 space-y-1">
                        <label className="text-[11px] font-semibold text-[#38302F]/70">
                          Required Swap Credits
                        </label>
                        <input
                          type="number"
                          value={swapCredits}
                          onChange={(e) => setSwapCredits(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-[#E9C7B7] text-xs font-black text-[#A94F2C] focus:outline-none focus:ring-1 focus:ring-[#542747]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Mode 3: Occasion Rent */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      enableRent
                        ? 'border-[#E58B51] bg-[#FFF5EB]'
                        : 'border-[#E9C7B7]/60 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#542747]">
                        <input
                          type="checkbox"
                          checked={enableRent}
                          onChange={(e) => setEnableRent(e.target.checked)}
                          className="accent-[#E58B51] rounded"
                        />
                        <Calendar className="w-4 h-4 text-[#E58B51]" />
                        <span>Occasion Rental</span>
                      </label>
                    </div>
                    {enableRent && (
                      <div className="mt-2 space-y-2">
                        <div>
                          <label className="text-[11px] font-semibold text-[#38302F]/70">
                            Rate / Day (৳)
                          </label>
                          <input
                            type="number"
                            value={rentPricePerDay}
                            onChange={(e) => setRentPricePerDay(e.target.value)}
                            className="w-full px-3 py-1 bg-white rounded-lg border border-[#E9C7B7] text-xs font-bold text-[#542747] focus:outline-none focus:ring-1 focus:ring-[#E58B51]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#38302F]/70">
                            Deposit (৳)
                          </label>
                          <input
                            type="number"
                            value={rentalDeposit}
                            onChange={(e) => setRentalDeposit(e.target.value)}
                            className="w-full px-3 py-1 bg-white rounded-lg border border-[#E9C7B7] text-xs font-bold text-[#542747] focus:outline-none focus:ring-1 focus:ring-[#E58B51]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: DRAFT vs PUBLISH */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-[#38302F]/70">
                  <span>Status on save: </span>
                  <strong>Draft</strong> (Private in inventory) or <strong>Active</strong> (Live in marketplace).
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSaveListing('DRAFT')}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-white hover:bg-[#E9C7B7]/40 text-[#542747] border border-[#E9C7B7] font-bold text-xs transition-colors shadow-2xs"
                  >
                    Save as Draft (Unpublished)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveListing('ACTIVE')}
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#A94F2C] hover:bg-[#8c3e20] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish to Marketplace (Active)</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: MULTI-MODE INVENTORY MANAGEMENT */}
          {/* ============================================================ */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              
              {/* Inventory Header & Status Filter Pills */}
              <div className="bg-white p-5 rounded-2xl border border-[#E9C7B7] space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#542747]">
                      Seller Inventory & Transaction States
                    </h3>
                    <p className="text-xs text-[#38302F]/70">
                      ReWear tracks <strong>Draft</strong>, <strong>Active</strong>, <strong>Reserved</strong>, and <strong>Sold/Rented</strong> items to ensure accurate availability across all modes.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-[#A94F2C] hover:bg-[#8c3e20] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create New Listing</span>
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E9C7B7]/60">
                  {['ALL', 'ACTIVE', 'DRAFT', 'RESERVED', 'SOLD'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setInventoryStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        inventoryStatusFilter === st
                          ? 'bg-[#542747] text-white shadow-xs'
                          : 'bg-[#FFF5EB] hover:bg-[#E9C7B7]/40 text-[#38302F]'
                      }`}
                    >
                      {st === 'ALL' ? 'All Items' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inventory Table / Cards */}
              <div className="space-y-3">
                {filteredInventory.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-[#E9C7B7] space-y-2">
                    <Layers className="w-8 h-8 text-[#A94F2C] mx-auto opacity-60" />
                    <div className="font-bold text-sm text-[#542747]">No items found in this filter</div>
                    <p className="text-xs text-[#38302F]/70">
                      Create a new listing using the AI Listing Copilot to populate your inventory.
                    </p>
                  </div>
                ) : (
                  filteredInventory.map((item) => {
                    const itemStatus = (item.status || 'ACTIVE').toUpperCase();
                    const isAvailable = itemStatus === 'ACTIVE';
                    const isDraft = itemStatus === 'DRAFT';
                    const isReserved = itemStatus === 'RESERVED';
                    const isSold = itemStatus === 'SOLD' || itemStatus === 'RENTED';

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-4 border border-[#E9C7B7] shadow-2xs hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        {/* Image + Basic Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={item.image || item.images?.[0]}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E9C7B7]"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  isAvailable
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isDraft
                                    ? 'bg-gray-100 text-gray-700'
                                    : isReserved
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-purple-100 text-purple-900'
                                }`}
                              >
                                {itemStatus}
                              </span>
                              <span className="text-[11px] text-[#38302F]/60">Size {item.size}</span>
                            </div>

                            <h4 className="font-bold text-sm text-[#542747] truncate mt-0.5">
                              {item.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-2 text-xs mt-1 text-[#38302F]/70">
                              <span className="font-bold text-[#A94F2C]">
                                {item.price || `৳${item.salePrice || 1850}`}
                              </span>
                              <span>•</span>
                              <span>{item.swapCredits || 45} Credits</span>
                              {item.rentPrice && <span>• Rent: {item.rentPrice}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Status Guard Indicator */}
                        <div className="text-right sm:text-center px-2">
                          {isReserved && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              <Lock className="w-3.5 h-3.5 text-amber-700" />
                              <span>Escrow Locked</span>
                            </div>
                          )}
                          {isSold && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                              <span>Transacted</span>
                            </div>
                          )}
                          {isAvailable && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Live in Market</span>
                            </div>
                          )}
                          {isDraft && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                              <PauseCircle className="w-3.5 h-3.5 text-gray-500" />
                              <span>Unpublished</span>
                            </div>
                          )}
                        </div>

                        {/* Inventory Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {isDraft && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'ACTIVE', 'Published by seller')}
                              className="px-3 py-1.5 bg-[#A94F2C] hover:bg-[#8c3e20] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Publish</span>
                            </button>
                          )}

                          {isAvailable && (
                            <>
                              <button
                                onClick={() => handleStatusChange(item.id, 'RESERVED', 'Manual escrow lock test')}
                                title="Lock item in Escrow / Rental (Prevent double-transactions)"
                                className="px-2.5 py-1.5 bg-[#FFF5EB] hover:bg-[#E9C7B7]/40 text-[#542747] border border-[#E9C7B7] text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Lock className="w-3.5 h-3.5 text-amber-700" />
                                <span>Lock Escrow</span>
                              </button>

                              <button
                                onClick={() => handleStatusChange(item.id, 'DRAFT', 'Paused by seller')}
                                title="Pause listing (Move to Draft)"
                                className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                              >
                                <PauseCircle className="w-3.5 h-3.5" />
                                <span>Pause</span>
                              </button>
                            </>
                          )}

                          {isReserved && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'ACTIVE', 'Escrow released')}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Release Lock</span>
                            </button>
                          )}

                          <button
                            onClick={() => onListingDeleted(item.id)}
                            title="Delete / Archive Listing"
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3.5 bg-white border-t border-[#E9C7B7]/60 flex items-center justify-between text-xs text-[#38302F]/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>MVC State Machine Connected</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#542747] text-white rounded-xl font-bold text-xs hover:bg-[#6e345e] transition-colors"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
}
