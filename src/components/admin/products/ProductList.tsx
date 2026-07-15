import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ShoppingCart } from 'lucide-react';
import AdminPagination from '../AdminPagination';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  priceUSD?: number;
  image_url?: string;
  category?: string;
  whatsapp_message?: string;
  stock_quantity: number;
  is_available: boolean;
  is_featured?: boolean;
  buy_action?: 'whatsapp' | 'link' | 'razorpay';
  external_link?: string;
  created_at: string;
}

interface ProductListProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAddFirst: () => void;
}

const ProductList = ({ 
  products, 
  currentPage, 
  totalPages, 
  onPageChange, 
  onEdit, 
  onDelete,
  onAddFirst
}: ProductListProps) => {



  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first product to the store.
          </p>
          <Button onClick={onAddFirst}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add First Product
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {product.image_url ? (
                  <img loading="lazy"
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-semibold text-base leading-tight text-yoga-forest">{product.name}</h3>
                    <p className="text-lg font-bold text-yoga-forest">
                      ₹{product.price}
                      {product.priceUSD ? ` / $${product.priceUSD}` : ''}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{product.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {product.category && (
                    <Badge variant="secondary" className="text-xs font-normal">{product.category}</Badge>
                  )}
                  <Badge variant={product.is_available ? "default" : "outline"} className="text-xs font-normal">
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-normal">
                    Stock: {product.stock_quantity}
                  </Badge>
                  {product.is_featured && (
                    <Badge className="bg-yoga-terracotta text-white">PREMIUM</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

          <AdminPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
    </div>
  );
};

export default ProductList;
