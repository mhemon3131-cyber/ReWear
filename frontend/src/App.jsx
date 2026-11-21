import React, { useState } from 'react';
import {
  ShoppingBag,
  RefreshCw,
  Calendar,
  Sparkles,
  Heart,
  Search,
  User,
  Leaf,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Filter,
  X,
  Sliders,
  ChevronRight,
  Star,
  MessageSquare,
  TrendingUp,
  Droplets,
  Wind,
  Layers,
  Camera,
  Shirt,
  LogIn,
  LogOut,
  SlidersHorizontal,
  Award,
  Bell,
  Receipt,
  CreditCard,
  Lock
} from 'lucide-react';

import CheckoutModal from './components/CheckoutModal';
import SmartSwapStudioModal from './components/SmartSwapStudioModal';
import OrderHistoryModal from './components/OrderHistoryModal';

export default function App() {
  // Navigation / Filter State
  const [activeMode, setActiveMode] = useState('all'); // 'all', 'buy', 'swap', 'rent'
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(3);
  
  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [userRole, setUserRole] = useState('student'); // 'student', 'seller', 'swap_enthusiast'
  const [currentUser, setCurrentUser] = useState({
    name: 'Mehedi Hasan',
    email: 'mhemon3131@gmail.com',
    role: 'student',
    swapCredits: 120,
    universityBadge: 'Verified Student (.edu)',
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Member 3 Feature Modals State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [isSwapStudioOpen, setIsSwapStudioOpen] = useState(false);
  const [swapTargetItem, setSwapTargetItem] = useState(null);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  // Persistent Orders List (Member 3 - Unified Checkout)
  const [ordersList, setOrdersList] = useState([
    {
      id: 'ord_sample_01',
      orderNumber: 'ORD-2026-9481',
      itemTitle: 'Vintage Corduroy Oversized Jacket',
      itemBrand: 'Zara Eco-Line',
      itemPrice: 1850,
      deliveryFee: 0,
      discount: 50,
      totalAmount: 1800,
      deliveryAddress: {
        fullName: 'Mehedi Hasan (Member 3)',
        phone: '01711223344',
        campus: 'BRAC University',
        hallOrBuilding: 'Building 2, Level 5',
      },
      deliveryOption: 'CAMPUS_PICKUP',
      paymentMethod: 'STRIPE_CARD',
      cardLast4: '4242',
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
      stripePaymentIntentId: 'pi_3MtwxX2eZvKYlo2C01234567',
      cancellationAllowedUntil: new Date(Date.now() + 1000 * 60 * 60 * 2),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
  ]);

  // Interactive Impact Calculator State
  const [itemsReused, setItemsReused] = useState(3);

  // Active AI Tab Teaser
  const [activeAiTab, setActiveAiTab] = useState('swap'); // 'copilot', 'search', 'swap', 'coach'

  // Sample Mock Listings
  const listings = [
    {
      id: 1,
      title: "Vintage Corduroy Oversized Jacket",
      brand: "Zara Eco-Line",
      size: "M",
      category: "Outerwear",
      originalPrice: "৳4,200",
      price: "৳1,850",
      estimatedValueBDT: 1850,
      swapCredits: 45,
      rentPrice: "৳250/day",
      modes: ['buy', 'swap', 'rent'],
      condition: "Like New",
      waterSaved: 2800,
      carbonSaved: 3.4,
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600",
      seller: "Ayesha K. (BRACU)",
      verified: true,
      hasDefectDisclosure: true,
      defectNote: "No stains or tears; minor wear on lower inner cuff.",
      likes: 24,
      isWishlisted: true,
    },
    {
      id: 2,
      title: "Hand-Embroidered Jamdani Fusion Vest",
      brand: "Aarong Heritage",
      size: "S",
      category: "Tops & Vests",
      originalPrice: "৳3,500",
      price: "৳1,600",
      estimatedValueBDT: 1600,
      swapCredits: 40,
      rentPrice: null,
      modes: ['buy', 'swap'],
      condition: "Brand New w/ Tags",
      waterSaved: 2200,
      carbonSaved: 2.8,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600",
      seller: "Tanvir H. (DU)",
      verified: true,
      hasDefectDisclosure: true,
      defectNote: "Flawless, unused gift with original university artisan tag.",
      likes: 38,
      isWishlisted: false,
    },
    {
      id: 3,
      title: "Sustainable Raw Denim Cargo Pants",
      brand: "Levi's Circular",
      size: "32",
      category: "Pants & Jeans",
      originalPrice: "৳4,800",
      price: "৳2,100",
      estimatedValueBDT: 2100,
      swapCredits: 50,
      rentPrice: "৳300/day",
      modes: ['buy', 'swap', 'rent'],
      condition: "Good",
      waterSaved: 3100,
      carbonSaved: 4.1,
      image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&q=80&w=600",
      seller: "Samiha R. (NSU)",
      verified: true,
      hasDefectDisclosure: true,
      defectNote: "Slight natural fade on left knee; all seams reinforced.",
      likes: 19,
      isWishlisted: false,
    },
    {
      id: 4,
      title: "Knitted Autumn Turtleneck Sweater",
      brand: "H&M Conscious",
      size: "L",
      category: "Knitwear",
      originalPrice: "৳2,900",
      price: "৳1,200",
      estimatedValueBDT: 1200,
      swapCredits: 30,
      rentPrice: "৳180/day",
      modes: ['buy', 'swap', 'rent'],
      condition: "Like New",
      waterSaved: 1900,
      carbonSaved: 2.1,
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600",
      seller: "Rahim M. (IUB)",
      verified: false,
      hasDefectDisclosure: true,
      defectNote: "Dry-cleaned twice; zero pilling or loose threads.",
      likes: 42,
      isWishlisted: true,
    }
  ];

  // Filter listings based on active mode
  const filteredListings = listings.filter(item => {
    if (activeMode === 'all') return true;
    return item.modes.includes(activeMode);
  });

  // Handle Mock Login
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setCurrentUser({
      name: loginEmail ? loginEmail.split('@')[0] : "Mehedi Hasan",
      email: loginEmail || "mhemon3131@gmail.com",
      role: userRole,
      swapCredits: 120,
      universityBadge: "Verified Student (.edu)",
    });
    setIsAuthOpen(false);
  };

  const handleDemoLogin = (roleType, email) => {
    setUserRole(roleType);
    setLoginEmail(email);
    setCurrentUser({
      name: roleType === 'student' ? 'Mehedi Hasan (Member 3)' : 'Zerin Tasnim (Seller)',
      email: email,
      role: roleType,
      swapCredits: 150,
      universityBadge: 'Verified Student ID',
    });
    setIsAuthOpen(false);
  };

  // Launch Checkout Modal (Feature 11)
  const handleOpenCheckout = (item) => {
    setCheckoutItem(item);
    setIsCheckoutOpen(true);
  };

  // Launch SmartSwap Studio Modal (Feature 12)
  const handleOpenSwapStudio = (item) => {
    setSwapTargetItem(item || listings[0]);
    setIsSwapStudioOpen(true);
  };

  // Callback when an order is completed
  const handleOrderSuccess = (newOrder) => {
    setOrdersList(prev => [newOrder, ...prev]);
  };

  // Callback to cancel an order
  const handleCancelOrder = (orderId) => {
    setOrdersList(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            orderStatus: 'CANCELLED',
            paymentStatus: 'REFUNDED'
          };
        }
        return ord;
      })
    );
    alert(`Order ${orderId} has been cancelled and refunded.`);
  };

  return (
    <div className="min-h-screen bg-[#FFF5EB] text-[#38302F] flex flex-col font-sans selection:bg-[#E9C7B7] selection:text-[#542747]">
      
      {/* 1. TOP ANNOUNCEMENT / COMMUNITY BAR */}
      <div className="bg-[#542747] text-[#FFF5EB] px-4 py-2 text-xs md:text-sm font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#A94F2C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Circular Campus
            </span>
            <span>University Fashion Week: Swap instead of shop & get <strong>50 Free Swap Credits</strong> upon registration!</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-[#E9C7B7]">
            <span>🌿 14,850+ Liters of Water Saved This Month</span>
            <span>•</span>
            <span className="font-semibold text-white">CSE470 Verified MVC Prototype</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#FFF5EB]/95 backdrop-blur-md border-b border-[#E9C7B7]/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-xl bg-[#542747] flex items-center justify-center text-[#FFF5EB] shadow-md group-hover:bg-[#A94F2C] transition-colors">
              <Leaf className="w-6 h-6 text-[#E58B51]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-[#542747]">Re<span className="text-[#A94F2C]">Wear</span></span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-[#E9C7B7] text-[#542747] rounded-sm">MVC</span>
              </div>
              <p className="text-[11px] font-medium text-[#A94F2C] tracking-wide">Circular Fashion Marketplace</p>
            </div>
          </div>

          {/* Search Bar with AI Visual Input Trigger */}
          <div className="flex-1 max-w-lg hidden lg:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#A94F2C] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe your style (e.g., 'black oversized jacket under ৳2,000') or search..."
                className="w-full pl-10 pr-24 py-2.5 rounded-full bg-white border border-[#E9C7B7] text-sm text-[#38302F] placeholder-[#38302F]/50 focus:outline-none focus:ring-2 focus:ring-[#A94F2C] focus:border-transparent transition-all shadow-2xs"
              />
              <button 
                title="AI Visual Search: Upload photo or moodboard"
                className="absolute right-2 px-3 py-1 bg-[#FFF5EB] hover:bg-[#E9C7B7]/50 text-[#542747] border border-[#E9C7B7] rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-[#A94F2C]" />
                <span>AI Visual</span>
              </button>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* FEATURE 12 TRIGGER: SmartSwap Studio Button */}
            <button
              onClick={() => handleOpenSwapStudio(listings[0])}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#542747] hover:bg-[#A94F2C] text-white text-xs font-bold transition-all shadow-xs"
              title="Open Member 3 AI Swap Matchmaker & Escrow"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#E58B51]" />
              <span className="hidden sm:inline">AI SmartSwap Studio</span>
              <span className="bg-[#A94F2C] text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase">Escrow</span>
            </button>

            {/* FEATURE 11 TRIGGER: My Orders & Receipts */}
            <button
              onClick={() => setIsOrderHistoryOpen(true)}
              className="relative p-2.5 rounded-xl border border-[#E9C7B7] bg-white hover:bg-[#E9C7B7]/30 text-[#542747] transition-colors flex items-center gap-1.5"
              title="View Member 3 Unified Checkout Orders & Stripe Receipts"
            >
              <Receipt className="w-4 h-4 text-[#A94F2C]" />
              <span className="text-xs font-bold hidden md:inline">Orders</span>
              {ordersList.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#A94F2C] text-white text-[10px] font-bold flex items-center justify-center">
                  {ordersList.length}
                </span>
              )}
            </button>

            {/* Wishlist Pill */}
            <button
              onClick={() => alert(`Your Wishlist contains ${wishlistCount} saved garments.`)}
              className="relative p-2.5 rounded-full hover:bg-[#E9C7B7]/40 text-[#542747] transition-colors"
            >
              <Heart className="w-5 h-5 text-[#542747]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#A94F2C] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Swap Credits Wallet Badge */}
            {currentUser && (
              <div className="hidden xl:flex items-center gap-2 bg-[#E9C7B7]/40 border border-[#E9C7B7] px-3 py-1.5 rounded-full">
                <RefreshCw className="w-3.5 h-3.5 text-[#A94F2C]" />
                <span className="text-xs font-bold text-[#542747]">{currentUser.swapCredits} Credits</span>
              </div>
            )}

            {/* User Session / Sign In Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-[#542747]">{currentUser.name}</div>
                  <div className="text-[10px] text-[#A94F2C] font-semibold">Member 3 (Active)</div>
                </div>
                <button
                  onClick={() => setCurrentUser(null)}
                  title="Sign Out"
                  className="p-2 rounded-full bg-[#542747] text-[#FFF5EB] hover:bg-[#A94F2C] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#542747] hover:bg-[#A94F2C] text-[#FFF5EB] font-semibold text-xs sm:text-sm transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* 3-Mode Quick Switcher Bar */}
        <div className="border-t border-[#E9C7B7]/40 bg-[#FFF5EB]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-2 text-xs font-medium">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
              <span className="text-[#38302F]/60 font-semibold uppercase text-[10px] tracking-wider">Modes:</span>
              <button
                onClick={() => setActiveMode('all')}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeMode === 'all'
                    ? 'bg-[#542747] text-white font-bold'
                    : 'text-[#38302F] hover:bg-[#E9C7B7]/40'
                }`}
              >
                All Listings
              </button>
              <button
                onClick={() => setActiveMode('buy')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                  activeMode === 'buy'
                    ? 'bg-[#A94F2C] text-white font-bold'
                    : 'text-[#38302F] hover:bg-[#E9C7B7]/40'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy & Sell (Stripe)</span>
              </button>
              <button
                onClick={() => setActiveMode('swap')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                  activeMode === 'swap'
                    ? 'bg-[#542747] text-white font-bold'
                    : 'text-[#38302F] hover:bg-[#E9C7B7]/40'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#E58B51]" />
                <span>Swap-Credit Exchange</span>
              </button>
              <button
                onClick={() => setActiveMode('rent')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                  activeMode === 'rent'
                    ? 'bg-[#38302F] text-white font-bold'
                    : 'text-[#38302F] hover:bg-[#E9C7B7]/40'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#E9C7B7]" />
                <span>Occasion Rental</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-3 text-xs text-[#A94F2C] font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Stripe API Integrated
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#542747]" /> Member 3 Escrow Active
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 bg-gradient-to-b from-[#FFF5EB] via-[#E9C7B7]/30 to-[#FFF5EB] border-b border-[#E9C7B7]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E9C7B7] text-[#542747] text-xs font-bold uppercase tracking-wider">
                <Leaf className="w-3.5 h-3.5 text-[#A94F2C]" />
                <span>The Future of Circular Fashion in Bangladesh</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#542747] leading-tight tracking-tight">
                Wear More. <br />
                <span className="text-[#A94F2C]">Waste Less.</span> <br />
                <span className="underline decoration-[#E58B51] decoration-wavy decoration-2">Swap Smart.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#38302F]/80 max-w-xl font-normal leading-relaxed">
                ReWear brings university students and mindful shoppers together to <strong>buy with Stripe</strong>, <strong>swap with credits</strong>, or <strong>rent</strong> verified pre-owned garments. Zero fast-fashion guilt, maximum style.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleOpenSwapStudio(listings[0])}
                  className="px-6 py-3.5 rounded-xl bg-[#A94F2C] hover:bg-[#8c3e20] text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Launch AI SmartSwap Studio</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => handleOpenCheckout(listings[0])}
                  className="px-6 py-3.5 rounded-xl bg-[#542747] hover:bg-[#6e345e] text-[#FFF5EB] font-bold text-sm sm:text-base flex items-center gap-2 transition-all shadow-md"
                >
                  <CreditCard className="w-4 h-4 text-[#E58B51]" />
                  <span>Test Stripe Checkout</span>
                </button>
              </div>

              {/* Trust & Environmental Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E9C7B7]/80 max-w-lg">
                <div>
                  <div className="text-2xl font-black text-[#542747]">100%</div>
                  <div className="text-xs text-[#38302F]/70 font-medium">Stripe Verified</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#A94F2C]">2,700L</div>
                  <div className="text-xs text-[#38302F]/70 font-medium">Water Saved / Swap</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#E58B51]">0৳</div>
                  <div className="text-xs text-[#38302F]/70 font-medium">Escrow Fee</div>
                </div>
              </div>
            </div>

            {/* Right Card Mockup: SmartSwap AI Feature Teaser */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl p-5 shadow-xl border-2 border-[#E9C7B7]">
                
                {/* Floating Tag */}
                <div className="absolute -top-3 right-4 bg-[#542747] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E58B51]" />
                  <span>Member 3: AI Swap Matchmaker</span>
                </div>

                <div className="text-xs font-bold text-[#A94F2C] uppercase tracking-wider mb-2">
                  Live Exchange Opportunity
                </div>
                
                {/* Visual Exchange Box */}
                <div className="bg-[#FFF5EB] rounded-xl p-4 border border-[#E9C7B7] space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#542747]">
                    <span>Your Closet: Raw Denim Jacket</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">96% Compatible</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 py-2">
                    <div className="w-16 h-16 rounded-lg bg-[#E9C7B7] overflow-hidden border border-[#542747]/20">
                      <img src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=200" alt="Item A" className="w-full h-full object-cover" />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[#A94F2C] text-white flex items-center justify-center shadow">
                      <RefreshCw className="w-4 h-4 animate-spin-slow" />
                    </div>

                    <div className="w-16 h-16 rounded-lg bg-[#E9C7B7] overflow-hidden border border-[#542747]/20">
                      <img src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=200" alt="Item B" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* AI Explanation Box */}
                  <div className="bg-white p-3 rounded-lg border border-[#E9C7B7] text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#542747]">
                      <Sparkles className="w-3.5 h-3.5 text-[#A94F2C]" />
                      <span>AI Compatibility Insight</span>
                    </div>
                    <p className="text-[#38302F]/80 text-[11px] leading-relaxed">
                      "Both items are sized Medium in pristine condition with equivalent market valuation (৳1,800). Nafis is actively looking for corduroy outer layers!"
                    </p>
                  </div>

                  <button 
                    onClick={() => handleOpenSwapStudio(listings[0])}
                    className="w-full py-2.5 bg-[#542747] hover:bg-[#A94F2C] text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Launch AI SmartSwap Studio (Escrow Protected)</span>
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#38302F]/60">
                  <span>🛡️ ReWear Escrow Protection</span>
                  <span>💳 Stripe Card & Swap Credits</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FOUR AI INNOVATIONS SHOWCASE */}
      <section className="py-12 bg-white border-b border-[#E9C7B7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-[#A94F2C] uppercase tracking-wider">
              CSE470 Team Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#542747] mt-1">
              4 Specialized AI Engines For 4 Team Members
            </h2>
            <p className="text-xs sm:text-sm text-[#38302F]/70 mt-1">
              Each member owns 5 core features and 1 integrated AI system. Member 3 features are now fully functional.
            </p>
          </div>

          {/* AI Feature Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => setActiveAiTab('copilot')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                activeAiTab === 'copilot'
                  ? 'border-[#542747] bg-[#542747] text-white shadow-md'
                  : 'border-[#E9C7B7] bg-[#FFF5EB] hover:bg-[#E9C7B7]/30 text-[#38302F]'
              }`}
            >
              <div className="text-[10px] font-bold uppercase opacity-80">Member 1</div>
              <div className="font-bold text-sm flex items-center gap-1.5 mt-0.5">
                <Camera className="w-4 h-4 text-[#E58B51]" />
                <span>AI Listing Copilot</span>
              </div>
            </button>

            <button
              onClick={() => setActiveAiTab('search')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                activeAiTab === 'search'
                  ? 'border-[#542747] bg-[#542747] text-white shadow-md'
                  : 'border-[#E9C7B7] bg-[#FFF5EB] hover:bg-[#E9C7B7]/30 text-[#38302F]'
              }`}
            >
              <div className="text-[10px] font-bold uppercase opacity-80">Member 2</div>
              <div className="font-bold text-sm flex items-center gap-1.5 mt-0.5">
                <Search className="w-4 h-4 text-[#E58B51]" />
                <span>Visual & Semantic Search</span>
              </div>
            </button>

            <button
              onClick={() => setActiveAiTab('swap')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                activeAiTab === 'swap'
                  ? 'border-[#542747] bg-[#542747] text-white shadow-md'
                  : 'border-[#E9C7B7] bg-[#FFF5EB] hover:bg-[#E9C7B7]/30 text-[#38302F]'
              }`}
            >
              <div className="text-[10px] font-bold uppercase opacity-80">Member 3 (You) • LIVE</div>
              <div className="font-bold text-sm flex items-center gap-1.5 mt-0.5">
                <RefreshCw className="w-4 h-4 text-[#E58B51]" />
                <span>AI Swap Matchmaker</span>
              </div>
            </button>

            <button
              onClick={() => setActiveAiTab('coach')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                activeAiTab === 'coach'
                  ? 'border-[#542747] bg-[#542747] text-white shadow-md'
                  : 'border-[#E9C7B7] bg-[#FFF5EB] hover:bg-[#E9C7B7]/30 text-[#38302F]'
              }`}
            >
              <div className="text-[10px] font-bold uppercase opacity-80">Member 4</div>
              <div className="font-bold text-sm flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-4 h-4 text-[#E58B51]" />
                <span>Circular Fashion Coach</span>
              </div>
            </button>
          </div>

          {/* AI Tab Interactive Content Panel */}
          <div className="bg-[#FFF5EB] rounded-2xl p-6 border border-[#E9C7B7] shadow-inner">
            {activeAiTab === 'swap' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#A94F2C] uppercase tracking-wider">Member 3 • Swapping & Transactions</span>
                  <h3 className="text-xl font-bold text-[#542747]">AI Swap Matchmaker & Escrow State Machine</h3>
                  <p className="text-xs sm:text-sm text-[#38302F]/80">
                    Matches compatible closets between students based on wishlist preferences, garment sizes, and credit valuations. Generates negotiation rationale and protects items in escrow so no double-swapping occurs!
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#542747]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Calculates 4-factor compatibility score + manages swap escrow state</span>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenSwapStudio(listings[0])}
                      className="px-4 py-2 bg-[#542747] hover:bg-[#A94F2C] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E58B51]" />
                      <span>Open Member 3 Matchmaker Studio</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#E9C7B7] shadow-sm">
                  <div className="text-xs font-bold text-[#542747] mb-2">Member 3 Engine Architecture:</div>
                  <div className="bg-[#FFF5EB] p-3 rounded-lg text-xs space-y-1 font-mono text-[#38302F]">
                    <div><strong>States:</strong> PROPOSED &gt; ACCEPTED &gt; ESCROW_LOCKED &gt; COMPLETED</div>
                    <div><strong>Stripe Gateway:</strong> Card Tokenization & Payment Intent Verified</div>
                    <div><strong>Cancellation:</strong> 2-Hour Grace Period & Instant Refund Flow</div>
                  </div>
                </div>
              </div>
            )}

            {activeAiTab === 'copilot' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#A94F2C] uppercase tracking-wider">Member 1 • Seller Intelligence</span>
                  <h3 className="text-xl font-bold text-[#542747]">Snap & Sell AI Copilot</h3>
                  <p className="text-xs sm:text-sm text-[#38302F]/80">
                    Sellers simply snap a photograph. The AI automatically classifies the garment type, detects visible fabric patterns, and drafts listings ready for review.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E9C7B7] shadow-sm">
                  <div className="text-xs font-bold text-[#542747] mb-2">Simulated Copilot Output:</div>
                  <div className="bg-[#FFF5EB] p-3 rounded-lg text-xs space-y-1 font-mono text-[#38302F]">
                    <div><strong>Title:</strong> Vintage Oversized Corduroy Jacket</div>
                    <div><strong>Category:</strong> Outerwear &gt; Jackets</div>
                    <div><strong>Resale Range:</strong> ৳1,600 – ৳2,000</div>
                  </div>
                </div>
              </div>
            )}

            {activeAiTab === 'search' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#A94F2C] uppercase tracking-wider">Member 2 • Buyer Discovery</span>
                  <h3 className="text-xl font-bold text-[#542747]">Semantic & Natural Language Style Finder</h3>
                  <p className="text-xs sm:text-sm text-[#38302F]/80">
                    Buyers query in plain English. Vector search matches style intent and applies budget filters.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E9C7B7] shadow-sm">
                  <div className="text-xs font-bold text-[#542747] mb-2">Natural Language Query Processing:</div>
                  <div className="bg-[#FFF5EB] p-3 rounded-lg text-xs space-y-1 font-mono text-[#38302F]">
                    <div><strong>Input:</strong> "black oversized vintage jacket under 2k"</div>
                    <div><strong>Extracted:</strong> [Color: Black, Fit: Oversized, MaxPrice: 2000]</div>
                  </div>
                </div>
              </div>
            )}

            {activeAiTab === 'coach' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#A94F2C] uppercase tracking-wider">Member 4 • Trust & Sustainability</span>
                  <h3 className="text-xl font-bold text-[#542747]">AI Circular Fashion & Garment Care Coach</h3>
                  <p className="text-xs sm:text-sm text-[#38302F]/80">
                    Ask how to remove coffee stains, patch frayed denim seams, or upcycle old college tees with fabric safety cautions.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E9C7B7] shadow-sm">
                  <div className="text-xs font-bold text-[#542747] mb-2">Care Coach Assistant Example:</div>
                  <div className="bg-[#FFF5EB] p-3 rounded-lg text-xs space-y-1 font-mono text-[#38302F]">
                    <div><strong>Prompt:</strong> "How do I remove ink stains from cotton?"</div>
                    <div><strong>AI Advice:</strong> "Dab with isopropyl alcohol; do not rub vigorously."</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. FEATURED MARKETPLACE LISTINGS */}
      <section id="listings-grid" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#A94F2C] uppercase tracking-wider">
              {activeMode === 'all' ? 'Featured Collection' : `Mode Filter: ${activeMode.toUpperCase()}`}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#542747] mt-1">
              Curated Pre-Owned Garments
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#38302F]/70 font-medium">Showing {filteredListings.length} circular items</span>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden border border-[#E9C7B7] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Product Image & Badges */}
              <div className="relative aspect-4/5 bg-[#FFF5EB] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Condition Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-[#542747] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {item.condition}
                  </span>
                </div>

                {/* Wishlist Heart Button */}
                <button
                  onClick={() => setWishlistCount(c => item.isWishlisted ? c - 1 : c + 1)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#542747] hover:text-[#A94F2C] transition-colors shadow-xs"
                >
                  <Heart className={`w-4 h-4 ${item.isWishlisted ? 'fill-[#A94F2C] text-[#A94F2C]' : ''}`} />
                </button>

                {/* Environmental Impact Tag */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-[#FFF5EB]/95 backdrop-blur-xs border border-[#E9C7B7] rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#542747] flex items-center justify-between">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Droplets className="w-3.5 h-3.5 text-emerald-600" /> Saves {item.waterSaved}L Water
                    </span>
                    <span className="text-[#A94F2C]">-{item.carbonSaved}kg CO₂</span>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#38302F]/60">
                    <span>{item.brand}</span>
                    <span className="font-bold text-[#542747] bg-[#E9C7B7]/40 px-2 py-0.5 rounded">Size {item.size}</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#542747] mt-1 line-clamp-1 group-hover:text-[#A94F2C] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#38302F]/70 mt-1">
                    Seller: <span className="font-semibold text-[#542747]">{item.seller}</span>
                  </p>
                </div>

                {/* Defect Disclosure Teaser */}
                <div className="bg-[#FFF5EB] p-2 rounded-lg border border-[#E9C7B7]/60 text-[11px] text-[#38302F]/80">
                  <span className="font-bold text-[#A94F2C]">Disclosure: </span>
                  {item.defectNote}
                </div>

                {/* Pricing / Mode Badges */}
                <div className="pt-2 border-t border-[#E9C7B7]/60 flex items-center justify-between">
                  <div>
                    <div className="text-base font-black text-[#542747]">{item.price}</div>
                    <div className="text-[10px] text-[#38302F]/50 line-through">Orig {item.originalPrice}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-[#A94F2C] flex items-center gap-1 justify-end">
                      <RefreshCw className="w-3 h-3 text-[#E58B51]" /> {item.swapCredits} Credits
                    </div>
                    {item.rentPrice && (
                      <div className="text-[10px] font-semibold text-[#38302F]/70">
                        Rent: {item.rentPrice}
                      </div>
                    )}
                  </div>
                </div>

                {/* Member 3 Actions: Unified Checkout (Stripe) & AI SmartSwap */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleOpenCheckout(item)}
                    className="py-2 px-2 bg-[#542747] hover:bg-[#A94F2C] text-white rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    title="Pay with Stripe Card or Swap Credits"
                  >
                    <CreditCard className="w-3 h-3 text-[#E58B51]" />
                    <span>Buy (Stripe)</span>
                  </button>

                  <button
                    onClick={() => handleOpenSwapStudio(item)}
                    className="py-2 px-2 bg-white hover:bg-[#E9C7B7]/40 text-[#542747] border border-[#E9C7B7] rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                    title="Trade with AI Compatibility Matchmaker"
                  >
                    <RefreshCw className="w-3 h-3 text-[#A94F2C]" />
                    <span>AI SmartSwap</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. INTERACTIVE SUSTAINABILITY IMPACT CALCULATOR */}
      <section className="py-14 bg-[#542747] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold text-[#E58B51] uppercase tracking-wider">
                Member 4 • Circularity Metrics
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#FFF5EB]">
                Calculate Your Circular Wardrobe Impact
              </h2>
              <p className="text-sm text-[#E9C7B7] leading-relaxed">
                Every garment purchased second-hand, swapped, or rented prevents virgin cotton cultivation, chemical dyeing runoff, and unnecessary textile waste.
              </p>

              {/* Interactive Slider */}
              <div className="bg-[#38302F] p-5 rounded-2xl border border-[#E58B51]/30 space-y-3 mt-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Pre-Owned Garments Rescued:</span>
                  <span className="text-2xl text-[#E58B51]">{itemsReused} Items</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={itemsReused}
                  onChange={(e) => setItemsReused(parseInt(e.target.value))}
                  className="w-full accent-[#E58B51] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#E9C7B7]/70 font-semibold">
                  <span>1 Item (Single Swap)</span>
                  <span>7 Items (Semester Wardrobe)</span>
                  <span>15 Items (Full Year Circular)</span>
                </div>
              </div>
            </div>

            {/* Impact Metric Outputs */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#38302F]/80 p-5 rounded-2xl border border-[#E9C7B7]/20 text-center space-y-1">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#E58B51]/20 flex items-center justify-center text-[#E58B51]">
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#FFF5EB]">
                  {(itemsReused * 2700).toLocaleString()}L
                </div>
                <div className="text-xs text-[#E9C7B7] font-semibold">Drinking Water Saved</div>
                <div className="text-[10px] text-white/50">≈ {Math.round(itemsReused * 2700 / 250)} days of hydration</div>
              </div>

              <div className="bg-[#38302F]/80 p-5 rounded-2xl border border-[#E9C7B7]/20 text-center space-y-1">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#A94F2C]/30 flex items-center justify-center text-[#A94F2C]">
                  <Wind className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#FFF5EB]">
                  {(itemsReused * 3.8).toFixed(1)} kg
                </div>
                <div className="text-xs text-[#E9C7B7] font-semibold">CO₂ Emissions Avoided</div>
                <div className="text-[10px] text-white/50">Industrial dyeing reduction</div>
              </div>

              <div className="bg-[#38302F]/80 p-5 rounded-2xl border border-[#E9C7B7]/20 text-center space-y-1">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#E9C7B7]/20 flex items-center justify-center text-[#E9C7B7]">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#FFF5EB]">
                  {(itemsReused * 0.85).toFixed(1)} kg
                </div>
                <div className="text-xs text-[#E9C7B7] font-semibold">Textile Waste Diverted</div>
                <div className="text-[10px] text-white/50">Diverted from city landfills</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. FOOTER & CSE470 TEAM ARCHITECTURE */}
      <footer className="mt-auto bg-[#38302F] text-[#FFF5EB] border-t border-[#E9C7B7]/20 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#542747] flex items-center justify-center text-[#E58B51]">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-xl font-black tracking-tight text-[#FFF5EB]">Re<span className="text-[#A94F2C]">Wear</span></span>
              </div>
              <p className="text-xs text-[#E9C7B7]/70 leading-relaxed">
                Circular fashion platform built for university campuses. Buy, sell, swap with credit points, and rent conscious clothing.
              </p>
            </div>

            {/* Member Roles & Allocation */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#E58B51] uppercase tracking-wider">Member 1 & 2</div>
              <ul className="text-xs text-[#E9C7B7]/80 space-y-1">
                <li>• Member 1: Seller Copilot & Multi-Mode Inventory</li>
                <li>• Member 1: Condition Transparency & Resale Advisor</li>
                <li>• Member 2: Visual & Semantic Search Engine</li>
                <li>• Member 2: Personalized Feed & Outfit Lookbook</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#E58B51] uppercase tracking-wider">Member 3 (You) • READY</div>
              <ul className="text-xs text-[#E9C7B7]/80 space-y-1">
                <li>• <strong>Feature 11:</strong> Unified Checkout & Stripe Payments (LIVE)</li>
                <li>• <strong>Feature 12:</strong> AI Swap Matchmaker & Escrow (LIVE)</li>
                <li>• Feature 13: Rental Booking & Deposit Rules</li>
                <li>• Feature 14: Delivery Courier Tracking</li>
                <li>• Feature 15: Transaction Protection & Disputes</li>
              </ul>
            </div>

            {/* Academic Outline Verification */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#E58B51] uppercase tracking-wider">Course Compliance</div>
              <p className="text-xs text-[#E9C7B7]/80 leading-relaxed">
                Designed for CSE470 Software Engineering. Adheres strictly to MVC framework requirements, 20 distinct features across 4 team members, and avoids prohibited MERN configurations.
              </p>
            </div>

          </div>

          <div className="pt-6 border-t border-[#E9C7B7]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E9C7B7]/50 gap-2">
            <div>© 2026 ReWear Team • CSE470 Software Engineering Project</div>
            <div>React.js • NestJS MVC • PostgreSQL • Stripe API • Tailwind CSS</div>
          </div>
        </div>
      </footer>

      {/* 8. FEATURE 11: CHECKOUT & STRIPE PAYMENT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        item={checkoutItem}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 9. FEATURE 12: AI SMARTSWAP STUDIO & ESCROW MODAL */}
      <SmartSwapStudioModal
        isOpen={isSwapStudioOpen}
        onClose={() => setIsSwapStudioOpen(false)}
        targetItem={swapTargetItem}
        currentUser={currentUser}
      />

      {/* 10. ORDER HISTORY & STRIPE RECEIPTS MODAL */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={ordersList}
        onCancelOrder={handleCancelOrder}
      />

      {/* 11. AUTHENTICATION & LOGIN MODAL */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#FFF5EB] w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#E9C7B7] relative">
            
            {/* Close Button */}
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#E9C7B7]/60 text-[#542747] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#542747] flex items-center justify-center text-[#E58B51] shadow-md mb-3">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-[#542747]">
                {authMode === 'login' ? 'Welcome Back to ReWear' : 'Join the Circular Movement'}
              </h3>
              <p className="text-xs text-[#38302F]/70 mt-1">
                Enter your university credentials or test using quick demo accounts.
              </p>
            </div>

            {/* Quick Demo Login Pre-fills */}
            <div className="mb-5 bg-white p-3.5 rounded-2xl border border-[#E9C7B7] space-y-2">
              <div className="text-[11px] font-bold text-[#A94F2C] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Evaluator / Demo Logins:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('student', 'mhemon3131@gmail.com')}
                  className="py-1.5 px-2 bg-[#FFF5EB] hover:bg-[#E9C7B7]/50 border border-[#E9C7B7] rounded-lg text-xs font-bold text-[#542747] text-left transition-colors"
                >
                  👤 Mehedi (Member 3)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('seller', 'seller.wardrobe@du.ac.bd')}
                  className="py-1.5 px-2 bg-[#FFF5EB] hover:bg-[#E9C7B7]/50 border border-[#E9C7B7] rounded-lg text-xs font-bold text-[#A94F2C] text-left transition-colors"
                >
                  🛍️ Active Seller
                </button>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="flex rounded-xl bg-[#E9C7B7]/40 p-1 mb-5">
              <button
                type="button"
                onClick={() => setUserRole('student')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  userRole === 'student' ? 'bg-[#542747] text-white shadow-xs' : 'text-[#38302F]'
                }`}
              >
                Student / Buyer
              </button>
              <button
                type="button"
                onClick={() => setUserRole('seller')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  userRole === 'seller' ? 'bg-[#542747] text-white shadow-xs' : 'text-[#38302F]'
                }`}
              >
                Fashion Curator / Seller
              </button>
            </div>

            {/* Main Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#542747] mb-1">
                  University Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@g.bracu.ac.bd"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E9C7B7] text-xs sm:text-sm text-[#38302F] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                />
                <span className="text-[10px] text-[#A94F2C] font-medium mt-1 block">
                  * .edu / .ac.bd emails receive 50 instant bonus Swap Credits.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#542747] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E9C7B7] text-xs sm:text-sm text-[#38302F] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#A94F2C] hover:bg-[#8c3e20] text-white font-bold text-sm shadow-md transition-colors"
              >
                {authMode === 'login' ? 'Sign In to ReWear' : 'Create Student Account'}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-5 text-center text-xs text-[#38302F]/70">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="font-bold text-[#542747] underline hover:text-[#A94F2C]"
                  >
                    Join with University ID
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    className="font-bold text-[#542747] underline hover:text-[#A94F2C]"
                  >
                    Log In
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
