import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, ExternalLink, Search as SearchIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ShareMenu from '@/components/ShareMenu';
import { usePageMeta } from '@/hooks/usePageMeta';
import { productsApi } from '@/services/mysqlApi';
import { SEED_PRODUCTS } from '@/data/seedProducts';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { siteSettingsService } from '@/services/database';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  priceUSD?: number;
  image_url?: string;
  category?: string;
  whatsapp_message?: string;
  affiliate_link?: string;
  stock_quantity: number;
  is_available: boolean;
  is_featured?: boolean;
  buy_action?: 'whatsapp' | 'link' | 'razorpay';
  external_link?: string;
}

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedProducts, setExpandedProducts] = useState<{[key: string]: boolean}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');
  const itemsPerPage = 12;
  const [isIndia, setIsIndia] = useState(true);
  const { toast } = useToast();

  usePageMeta({
    title: 'Yoga Store',
    description: 'Discover premium yoga products to enhance your practice and spiritual journey.',
  });

  const toggleExpand = (id: string) => {
    setExpandedProducts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    loadProducts();
    
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setIsIndia(userTimeZone === 'Asia/Calcutta' || userTimeZone === 'Asia/Kolkata');
    } catch (e) {
      setIsIndia(true);
    }

    const loadSettings = async () => {
      try {
        const data = await siteSettingsService.getSettings();
        if (data && data.socialLinks) {
          try {
            setSiteSettings(JSON.parse(data.socialLinks));
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        console.error('Failed to load settings in Store page:', err);
      }
    };
    loadSettings();
  }, []);

  const getDisplayPrice = (product: Product) => {
    return isIndia ? product.price : (product.priceUSD || product.price);
  };

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      
      if (!data || data.length === 0) {
        setProducts(SEED_PRODUCTS);
      } else {
        // filter available and sort by date descending
        const available = data.filter((p: any) => p.is_available !== false);
        available.sort((a: any, b: any) => {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
        setProducts(available.length > 0 ? available : SEED_PRODUCTS);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Notice",
        description: "Using fallback products.",
      });
      setProducts(SEED_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // When filters change, reset to page 1 and slice current products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (priceSort === 'default') {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0; 
    }
    if (priceSort === 'asc') return a.price - b.price;
    if (priceSort === 'desc') return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceSort]);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setCurrentPage(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const handleBuyNow = async (product: Product) => {
    // Legacy affiliate link fallback
    if (product.affiliate_link && !product.buy_action) {
      window.open(product.affiliate_link, '_blank');
      return;
    }
    
    const action = product.buy_action || 'whatsapp';
    
    if (action === 'link' && product.external_link) {
      window.open(product.external_link, '_blank');
      return;
    }
    
    if (action === 'razorpay') {
      toast({
        title: "Initiating Payment",
        description: `Preparing Razorpay checkout for ${product.name}...`,
      });
      
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({
          title: "Payment Error",
          description: "Failed to load Razorpay SDK. Please check your internet connection.",
          variant: "destructive"
        });
        return;
      }

      // Fetch Razorpay credentials from state, falling back to localStorage
      const storedSettings = localStorage.getItem('siteSettings');
      const localSettings = storedSettings ? JSON.parse(storedSettings) : {};
      const settings = siteSettings || localSettings || {};
      const keyId = settings.razorpayKeyId;
      
      if (!keyId) {
        toast({
          title: "Setup Required",
          description: "Razorpay Key ID is not configured. Please go to Admin Settings -> Integrations & API -> Payment Gateways and enter your Key ID.",
          variant: "destructive"
        });
        return;
      }
      
      const price = getDisplayPrice(product);
      const currency = isIndia ? 'INR' : 'USD';
      
      const options = {
        key: keyId,
        amount: Math.round(price * 100), // amount in paise/cents
        currency: currency,
        name: settings.siteName || "Shakti Yoga Raai",
        description: `Purchase of ${product.name}`,
        image: settings.headerLogo || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=150&q=80",
        handler: function (response: any) {
          toast({
            title: "Payment Successful",
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#2C5234" // theme color (yoga-forest)
        }
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error('Razorpay initialization failed:', err);
        toast({
          title: "Payment Error",
          description: "Could not open Razorpay checkout. Please make sure the credentials are correct.",
          variant: "destructive"
        });
      }
      return;
    }
    
    // Default to WhatsApp
    const message = product.whatsapp_message || `Hi! I'm interested in purchasing ${product.name} for ${isIndia ? '₹' : '$'}${getDisplayPrice(product)}`;
    const whatsappUrl = `https://wa.me/917777816410?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow bg-gradient-to-br from-background to-muted p-6 pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow bg-gradient-to-br from-background to-muted pt-10 md:pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 pt-10 md:pt-20 pb-6 md:pb-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <ShoppingCart className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest"><span className="text-yoga-terracotta">Yoga</span> Store</h1>
            </div>
            <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover premium yoga products to enhance your practice and spiritual journey
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-0 pb-12">
          {/* Filters & Search Section */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white py-2 px-4 rounded-xl shadow-sm border border-yoga-sage/20">
            {categories.length > 1 && (
              <div className="flex-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                <div className="flex flex-nowrap md:flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize text-xs h-8 px-3"
                  >
                    {category === 'all' ? 'All Products' : category}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-yoga-sage/20 min-w-[200px] text-xs h-8"
              />
            </div>
            
            <div className="relative">
              <select 
                className="h-8 w-full sm:w-auto rounded-md border border-yoga-sage/20 bg-muted/50 px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yoga-sage/50"
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as any)}
              >
                <option value="default">Sort by: Featured</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

          {/* Products Grid */}
          {currentProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map((product, index) => {
                const isLast = index === currentProducts.length - 1;
                return (
                <div key={product.id}>
                  <Card className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                  <CardHeader className="p-4 bg-muted/30 relative">
                    <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 items-end">
                      {product.is_featured && (
                        <Badge className="bg-yoga-terracotta text-white shadow-sm border-none">
                          PREMIUM
                        </Badge>
                      )}
                      {product.category && (
                        <Badge variant="secondary" className="shadow-sm">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    <div className="aspect-square overflow-hidden rounded-md bg-muted">
                      {product.image_url ? (
                        <img loading="lazy"
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <div className="mb-2">
                      <CardTitle 
                        className="text-base lg:text-lg font-semibold leading-tight truncate w-full" 
                        title={product.name}
                      >
                        {product.name}
                      </CardTitle>
                    </div>
                    {product.description && (
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground min-h-[3.75rem]">
                          {expandedProducts[product.id] 
                            ? product.description 
                            : (product.description.length > 141 
                                ? product.description.slice(0, 141) + '... ' 
                                : product.description)}
                          
                          {product.description.length > 141 && (
                            <button 
                              onClick={() => toggleExpand(product.id)}
                              className="text-primary hover:underline text-xs font-semibold ml-1 inline"
                            >
                              {expandedProducts[product.id] ? 'Show less' : 'Read more...'}
                            </button>
                          )}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <span className="text-xl font-bold text-yoga-forest">
                        {isIndia ? '₹' : '$'}{getDisplayPrice(product)}
                      </span>
                      {product.stock_quantity > 0 ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {product.stock_quantity} in stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button
                      onClick={() => handleBuyNow(product)}
                      disabled={product.stock_quantity <= 0}
                      className="flex-1 bg-yoga-sage hover:bg-yoga-forest text-white"
                      size="lg"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                    <ShareMenu
                      title={product.name}
                      description={product.description}
                      url={window.location.href}
                      iconOnly
                      className="bg-white border-white/60 text-yoga-forest hover:bg-white/90 hover:text-yoga-forest shadow-sm h-8 w-8 rounded-full"
                    />
                  </CardFooter>
                  </Card>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-lg">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Products Found</h2>
              <p className="text-muted-foreground">
                Try selecting a different category or check back later.
              </p>
            </div>
          )}

          {/* Pagination Component */}
          {totalPages > 1 && (
            <div className="py-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
