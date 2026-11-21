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
  Lock,
} from 'lucide-react';
import SellerStudioModal from './components/SellerStudioModal';

export default function App() {
  // Navigation / Filter State
  const [activeMode, setActiveMode] = useState('all'); // 'all', 'buy', 'swap', 'rent'
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(3);
  
  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [userRole, setUserRole] = useState('student'); // 'student', 'seller', 'swap_enthusiast'
  const [currentUser, setCurrentUser] = useState(null); // Simulated logged-in user
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Interactive Impact Calculator State
  const [itemsReused, setItemsReused] = useState(3);

  // Active AI Tab Teaser
  const [activeAiTab, setActiveAiTab] = useState('swap'); // 'copilot', 'search', 'swap', 'coach'

  // Seller Studio Modal State (Member 1)
  const [isSellerStudioOpen, setIsSellerStudioOpen] = useState(false);

  // Sample Mock Listings with Multi-Mode & Status States
  const initialListings = [
    {
      id: 1,
      title: "Vintage Corduroy Oversized Jacket",
      brand: "Zara Eco-Line",
      size: "M",
      originalPrice: "৳4,200",
      price: "৳1,850",
      salePrice: 1850,
      swapCredits: 45,
      rentPrice: "৳250/day",
      rentalPricePerDay: 250,
      modes: ['buy', 'swap', 'rent'],
      condition: "Like New",
      status: 'ACTIVE',
      waterSaved: 2800,
      carbonSaved: 3.4,
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600",
      seller: "Zerin Tasnim (Seller)",
      sellerId: "usr_02",
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
      originalPrice: "৳3,500",
      price: "৳1,600",
      salePrice: 1600,
      swapCredits: 40,
      rentPrice: null,
      modes: ['buy', 'swap'],
      condition: "Brand New w/ Tags",
      status: 'ACTIVE',
      waterSaved: 2200,
      carbonSaved: 2.8,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600",
      seller: "Tanvir H. (DU)",
      sellerId: "usr_03",
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
      originalPrice: "৳4,800",
      price: "৳2,100",
      salePrice: 2100,
      swapCredits: 50,
      rentPrice: "৳300/day",
      rentalPricePerDay: 300,
      modes: ['buy', 'swap', 'rent'],
      condition: "Good",
      status: 'RESERVED', // Escrow lock test
      waterSaved: 3100,
      carbonSaved: 4.1,
      image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&q=80&w=600",
      seller: "Zerin Tasnim (Seller)",
      sellerId: "usr_02",
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
      originalPrice: "৳2,900",
      price: "৳1,200",
      salePrice: 1200,
      swapCredits: 30,
      rentPrice: "৳180/day",
      rentalPricePerDay: 180,
      modes: ['buy', 'swap', 'rent'],
      condition: "Like New",
      status: 'ACTIVE',
      waterSaved: 1900,
      carbonSaved: 2.1,
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600",
      seller: "Rahim M. (IUB)",
      sellerId: "usr_04",
      verified: false,
      hasDefectDisclosure: true,
      defectNote: "Dry-cleaned twice; zero pilling or loose threads.",
      likes: 42,
      isWishlisted: true,
    }
  ];

  const [listings, setListings] = useState(initialListings);

  // Member 1: Handlers for Inventory & AI Copilot creations
  const handleListingCreated = (newListing) => {
    const formatted = {
      id: newListing.id || Date.now(),
      title: newListing.title,
      brand: newListing.brand,
      size: newListing.size,
      originalPrice: newListing.originalPrice ? `৳${newListing.originalPrice}` : '৳3,500',
      price: newListing.salePrice ? `৳${newListing.salePrice}` : (newListing.price || '৳1,800'),
      salePrice: newListing.salePrice || 1800,
      swapCredits: newListing.swapCredits || 40,
      rentPrice: newListing.rentalPricePerDay ? `৳${newListing.rentalPricePerDay}/day` : null,
      rentalPricePerDay: newListing.rentalPricePerDay,
      modes: newListing.modes || ['buy', 'swap'],
      condition: newListing.condition || 'Like New',
      status: newListing.status || 'ACTIVE',
      waterSaved: newListing.waterSavingsLiters || 2400,
      carbonSaved: newListing.co2AvoidedKg || 3.0,
      image: newListing.images?.[0] || newListing.image || "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600",
      seller: newListing.sellerName || (currentUser ? currentUser.name : "Zerin Tasnim (Seller)"),
      sellerId: newListing.sellerId || "usr_02",
      verified: true,
      hasDefectDisclosure: true,
      defectNote: newListing.defectDisclosure || "Inspected and verified condition.",
      likes: 1,
      isWishlisted: false,
    };
    setListings(prev => [formatted, ...prev]);
  };

  const handleListingUpdated = (id, newStatus) => {
    setListings(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleListingDeleted = (id) => {
    setListings(prev => prev.filter(item => item.id !== id));
  };

  // Filter listings based on active mode & hide unreleased DRAFTs from public view
  const filteredListings = listings.filter(item => {
    if (item.status === 'DRAFT') return false; // Private to seller inventory
    if (activeMode === 'all') return true;
    return item.modes.includes(activeMode);
  });

  // Handle Mock Login
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setCurrentUser({
      name: loginEmail ? loginEmail.split('@')[0] : "Farhan Ahmed",
      email: loginEmail || "member3.transactions@rewear.org",
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
      name: roleType === 'student' ? 'Nafis Iqbal (Member 3)' : 'Zerin Tasnim (Seller)',
      email: email,
      role: roleType,
      swapCredits: 150,
      universityBadge: 'Verified Student ID',
    });
    setIsAuthOpen(false);
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
          <div className="flex items-center gap-3 cursor-pointer group">
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
          <div className="flex-1 max-w-xl hidden lg:block">
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
          <div className="flex items-center gap-3">
            
            {/* Wishlist Pill */}
            <button className="relative p-2.5 rounded-full hover:bg-[#E9C7B7]/40 text-[#542747] transition-colors">
              <Heart className="w-5 h-5 text-[#542747]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#A94F2C] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Swap Credits Wallet Badge */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 bg-[#E9C7B7]/40 border border-[#E9C7B7] px-3 py-1.5 rounded-full">
                <RefreshCw className="w-3.5 h-3.5 text-[#A94F2C]" />
                <span className="text-xs font-bold text-[#542747]">{currentUser.swapCredits} Swap Credits</span>
              </div>
            )}

            {/* User Session / Sign In Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-[#542747]">{currentUser.name}</div>
                  <div className="text-[10px] text-[#A94F2C] font-semibold">{currentUser.role === 'student' ? 'Member 3 (Swaps & Rentals)' : 'Seller'}</div>
                </div>
                <button
                  onClick={() => setCurrentUser(null)}
                  title="Sign Out"
                  className="p-2.5 rounded-full bg-[#542747] text-[#FFF5EB] hover:bg-[#A94F2C] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#542747] hover:bg-[#A94F2C] text-[#FFF5EB] font-semibold text-sm transition-all shadow-sm hover:shadow"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Join</span>
              </button>
            )}

            {/* List an item CTA (Member 1 Studio) */}
            <button
              onClick={() => setIsSellerStudioOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#A94F2C] hover:bg-[#8c3e20] text-white font-semibold text-sm transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#FFF5EB]" />
              <span>List Clothing</span>
            </button>
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
                <span>Buy & Sell Pre-Owned</span>
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
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Condition Transparency Disclosed
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#542747]" /> Anti-MERN MVC Compliant
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
                ReWear brings university students and mindful shoppers together to <strong>buy</strong>, <strong>sell</strong>, <strong>swap with credits</strong>, or <strong>rent</strong> verified pre-owned garments. Zero fast-fashion guilt, maximum style.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveMode('swap')}
                  className="px-6 py-3.5 rounded-xl bg-[#A94F2C] hover:bg-[#8c3e20] text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Start Swapping (Swap-Credits)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('listings-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-xl bg-[#542747] hover:bg-[#6e345e] text-[#FFF5EB] font-bold text-sm sm:text-base transition-all"
                >
                  Explore Collection
                </button>
              </div>

              {/* Trust & Environmental Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E9C7B7]/80 max-w-lg">
                <div>
                  <div className="text-2xl font-black text-[#542747]">100%</div>
                  <div className="text-xs text-[#38302F]/70 font-medium">Condition Disclosed</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#A94F2C]">2,700L</div>
                  <div className="text-xs text-[#38302F]/70 font-medium">Water Saved / Swap</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#E58B51]">0৳</div>
                  <div className="text-xs text-[#38302F]/70 font-medium">Swap Matchmaking</div>
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
                    onClick={() => {
                      if (!currentUser) setIsAuthOpen(true);
                      else alert("Swap proposal sent! Item temporarily locked in escrow.");
                    }}
                    className="w-full py-2.5 bg-[#542747] hover:bg-[#A94F2C] text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Propose Instant Swap (Escrow Protected)</span>
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#38302F]/60">
                  <span>🛡️ ReWear Escrow Protection</span>
                  <span>📦 Courier & Campus Pickup</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FOUR AI INNOVATIONS SHOWCASE (TEAM MEMBERS ALLOCATION) */}
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
              Each member owns 5 core features and 1 integrated AI system communicating with our modular backend.
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
              <div className="text-[10px] font-bold uppercase opacity-80">Member 3 (You)</div>
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
            {activeAiTab === 'copilot' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#A94F2C] uppercase tracking-wider">Member 1 • Seller Intelligence</span>
                  <h3 className="text-xl font-bold text-[#542747]">Snap & Sell AI Copilot</h3>
                  <p className="text-xs sm:text-sm text-[#38302F]/80">
                    Sellers simply snap a photograph. The AI automatically classifies the garment type, detects visible fabric patterns and color palettes, suggests an SEO-friendly title, and prepares a draft listing ready for defect disclosure review.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#542747]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Auto-generates tags: #Vintage #Corduroy #Unisex</span>
                  </div>
                  <button
                    onClick={() => setIsSellerStudioOpen(true)}
                    className="mt-2 px-4 py-2.5 bg-[#A94F2C] hover:bg-[#8c3e20] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-[#FFF5EB]" />
                    <span>Open AI Listing Studio & Inventory Manager</span>
                  </button>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E9C7B7] shadow-sm">
                  <div className="text-xs font-bold text-[#542747] mb-2">Simulated Copilot Output:</div>
                  <div className="bg-[#FFF5EB] p-3 rounded-lg text-xs space-y-1 font-mono text-[#38302F]">
                    <div><strong>Title:</strong> Vintage Oversized Corduroy Jacket</div>
                    <div><strong>Category:</strong> Outerwear &gt; Jackets</div>
                    <div><strong>Estimated Value:</strong> ৳1,600 – ৳2,000</div>
                    <div><strong>Resale Confidence:</strong> 94%</div>
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
                    Buyers don't need to know exact tags. Enter queries like <em>"cozy knitwear for winter exams under 1500 taka"</em>. The vector search matches intent, combines database budget filters, and displays available listings.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#542747]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Vector embeddings + PostgreSQL relational query filters</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E9C7B7] shadow-sm">
                  <div className="text-xs font-bold text-[#542747] mb-2">Natural Language Query Processing:</div>
                  <div className="bg-[#FFF5EB] p-3 rounded-lg text-xs space-y-1 font-mono text-[#38302F]">
                    <div><strong>Input:</strong> "black oversized vintage jacket under 2k"</div>
                    <div><strong>Extracted:</strong> [Color: Black, Fit: Oversized, MaxPrice: 2000]</div>
                    <div><strong>Database Match:</strong> 8 listings found & verified active</div>
                  </div>
                </div>
              </div>
            )}

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
                    <span>Calculates compatibility score + manages swap state machine</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E9C7B7] shadow-sm">
                  <div className="text-xs font-bold text-[#542747] mb-2">Member 3 Engine Architecture:</div>
                  <div className="bg-[#FFF5EB] p-3 rounded-lg text-xs space-y-1 font-mono text-[#38302F]">
                    <div><strong>States:</strong> PENDING &gt; ACCEPTED &gt; ESCROW_LOCKED &gt; COMPLETED</div>
                    <div><strong>Rental Rules:</strong> Overlapping calendar date reservation prevention</div>
                    <div><strong>Late Returns:</strong> Automatic deposit deduction fee calculator</div>
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
                    Ask how to remove coffee stains, patch frayed denim seams, or upcycle old college tees. Provides actionable DIY garment repair instructions with specific safety caveats for delicate fibers like silk and wool.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#542747]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Includes real-time Sustainability Impact equations</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E9C7B7] shadow-sm">
                  <div className="text-xs font-bold text-[#542747] mb-2">Care Coach Assistant Example:</div>
                  <div className="bg-[#FFF5EB] p-3 rounded-lg text-xs space-y-1 font-mono text-[#38302F]">
                    <div><strong>Prompt:</strong> "How do I remove ink stains from a cotton shirt?"</div>
                    <div><strong>AI Advice:</strong> "Dab with isopropyl alcohol; do not rub vigorously."</div>
                    <div><strong>Circularity Impact:</strong> Rescues ৳2,200 garment from landfill!</div>
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

                {/* Condition & Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                  <span className="bg-[#542747] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {item.condition}
                  </span>
                  {item.status === 'RESERVED' && (
                    <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <Lock className="w-3 h-3" /> In Escrow
                    </span>
                  )}
                  {(item.status === 'SOLD' || item.status === 'RENTED') && (
                    <span className="bg-purple-800 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                      {item.status}
                    </span>
                  )}
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

                {/* Card Action - Prevents transacting unavailable items (Feature 2) */}
                {item.status === 'RESERVED' ? (
                  <button
                    disabled
                    className="w-full py-2 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed opacity-90"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Locked in Escrow (Unavailable)</span>
                  </button>
                ) : (item.status === 'SOLD' || item.status === 'RENTED') ? (
                  <button
                    disabled
                    className="w-full py-2 bg-gray-200 text-gray-600 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <span>{item.status === 'SOLD' ? 'Sold Out' : 'Currently Rented Out'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!currentUser) setIsAuthOpen(true);
                      else alert(`Proceeding to checkout/swap for: ${item.title}`);
                    }}
                    className="w-full py-2 bg-[#542747] hover:bg-[#A94F2C] text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>Select / Propose Swap</span>
                  </button>
                )}
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
              <div className="flex items-center gap-2 text-xs text-[#E58B51] font-bold">
                <span>Color Palette:</span>
                <span className="w-3 h-3 rounded-full bg-[#542747]" title="Deep Plum #542747"></span>
                <span className="w-3 h-3 rounded-full bg-[#A94F2C]" title="Burnt Orange #A94F2C"></span>
                <span className="w-3 h-3 rounded-full bg-[#E58B51]" title="Soft Tangerine #E58B51"></span>
                <span className="w-3 h-3 rounded-full bg-[#E9C7B7]" title="Peach Blush #E9C7B7"></span>
                <span className="w-3 h-3 rounded-full bg-[#FFF5EB]" title="Warm Cream #FFF5EB"></span>
                <span className="w-3 h-3 rounded-full bg-[#38302F]" title="Espresso #38302F"></span>
              </div>
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
              <div className="text-xs font-bold text-[#E58B51] uppercase tracking-wider">Member 3 & 4</div>
              <ul className="text-xs text-[#E9C7B7]/80 space-y-1">
                <li>• <strong>Member 3 (You):</strong> Unified Checkout & Payments</li>
                <li>• <strong>Member 3 (You):</strong> AI Swap Matchmaker & Escrow</li>
                <li>• <strong>Member 3 (You):</strong> Rental Booking & Deposit Rules</li>
                <li>• Member 4: Trust Center & Verified Reviews</li>
                <li>• Member 4: AI Fashion Coach & Impact Calculator</li>
              </ul>
            </div>

            {/* Academic Outline Verification */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#E58B51] uppercase tracking-wider">Course Compliance</div>
              <p className="text-xs text-[#E9C7B7]/80 leading-relaxed">
                Designed for CSE470 Software Engineering. Adheres strictly to MVC framework requirements, 20 distinct features across 4 team members, and avoids prohibited MERN configurations.
              </p>
              <div className="pt-1 text-[11px] text-[#A94F2C] font-semibold">
                Repository Architecture: Git Monorepo (frontend + backend + docs)
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-[#E9C7B7]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E9C7B7]/50 gap-2">
            <div>© 2026 ReWear Team • CSE470 Software Engineering Project</div>
            <div>React.js • NestJS MVC • PostgreSQL • Tailwind CSS</div>
          </div>
        </div>
      </footer>

      {/* 8. AUTHENTICATION & LOGIN MODAL */}
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
                  onClick={() => handleDemoLogin('student', 'member3.swap@bracu.ac.bd')}
                  className="py-1.5 px-2 bg-[#FFF5EB] hover:bg-[#E9C7B7]/50 border border-[#E9C7B7] rounded-lg text-xs font-bold text-[#542747] text-left transition-colors"
                >
                  👤 Member 3 (Swapper)
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

      {/* 9. MEMBER 1: SELLER STUDIO & AI COPILOT / INVENTORY MODAL */}
      <SellerStudioModal
        isOpen={isSellerStudioOpen}
        onClose={() => setIsSellerStudioOpen(false)}
        currentUser={currentUser}
        listings={listings}
        onListingCreated={handleListingCreated}
        onListingUpdated={handleListingUpdated}
        onListingDeleted={handleListingDeleted}
      />

    </div>
  );
}

