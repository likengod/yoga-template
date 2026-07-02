import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ShoppingCart, Search as SearchIcon } from 'lucide-react';
import ImagePicker from './ImagePicker';
import { useToast } from '@/hooks/use-toast';
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
import ProductForm, { ProductFormData } from './admin/products/ProductForm';
import ProductList, { Product } from './admin/products/ProductList';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    whatsapp_message: '',
    stock_quantity: '0',
    is_available: true,
    is_featured: false,
    buy_action: 'whatsapp',
    external_link: ''
  });
  const { toast } = useToast();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      
      if (!data || data.length === 0) {
        setProducts(SEED_PRODUCTS);
      } else {
          setProducts(data);
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Product name and price are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        image_url: formData.image_url || null,
        category: formData.category || null,
        whatsapp_message: formData.whatsapp_message || null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        buy_action: formData.buy_action,
        external_link: formData.external_link || null
      };

      if (editingProduct) {
        await productsApi.update(editingProduct.id, productData);
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await productsApi.create(productData);
        
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      category: product.category || '',
      whatsapp_message: product.whatsapp_message || '',
      stock_quantity: product.stock_quantity.toString(),
      is_available: product.is_available,
      is_featured: product.is_featured || false,
      buy_action: product.buy_action || 'whatsapp',
      external_link: product.external_link || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsApi.remove(id);

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: '',
      whatsapp_message: '',
      stock_quantity: '0',
      is_available: true,
      is_featured: false,
      buy_action: 'whatsapp',
      external_link: ''
    });
    setEditingProduct(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products Management</h2>
          <p className="text-muted-foreground">Manage your store products</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>

            <ProductForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleDialogClose}
              isEditing={!!editingProduct}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full md:w-1/3">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <ProductList
        products={currentProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddFirst={() => setIsDialogOpen(true)}
      />
    </div>
  );
}
