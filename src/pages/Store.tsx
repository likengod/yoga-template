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
import { useRef, useCallback } from 'react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
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


export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedProducts, setExpandedProducts] = useState<{[key: string]: boolean}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const { toast } = useToast();
  
  // Infinite scroll observer setup
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        // Find total pages based on current filtered products
        const maxPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (currentPage < maxPages) {
          setCurrentPage(prev => prev + 1);
        }
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, currentPage]);

  usePageMeta({
    title: 'Yoga Store',
    description: 'Discover premium yoga products to enhance your practice and spiritual journey.',
  });

  const toggleExpand = (id: string) => {
    setExpandedProducts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    loadProducts();
    
    // Dynamic pagination based on screen width
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 8 : 12);
    };
    
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const currentProducts = filteredProducts.slice(0, currentPage * itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceSort]);

  // renderPaginationItems removed in favor of infinite scroll

  const handleBuyNow = (product: Product) => {
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
      // Placeholder for Razorpay integration
      toast({
        title: "Initiating Payment",
        description: `Preparing Razorpay checkout for ${product.name}...`,
      });
      // A full integration would load the Razorpay checkout script here.
      setTimeout(() => {
        alert(`Razorpay checkout modal would open here for ₹${product.price}`);
      }, 500);
      return;
    }
    
    // Default to WhatsApp
    const message = product.whatsapp_message || `Hi! I'm interested in purchasing ${product.name} for ₹${product.price}`;
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
      <div className="flex-grow bg-gradient-to-br from-background to-muted pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <ShoppingCart className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest"><span className="text-yoga-terracotta">Yoga</span> Store</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
                <div key={product.id} ref={isLast ? lastProductElementRef : null}>
                  <Card className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                  <CardHeader className="p-4 bg-muted/30 relative">
                    <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 items-end">
                      {product.is_featured && (
                        <Badge className="bg-yoga-terracotta text-white shadow-sm border-none">
                          Featured
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
                      <span className="text-xl font-bold text-yoga-forest">₹{product.price}</span>
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

          {/* Loading Indicator for Infinite Scroll */}
          {currentPage < totalPages && (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoga-sage"></div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
