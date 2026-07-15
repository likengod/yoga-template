import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ImagePicker from '../../ImagePicker';

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  priceUSD: string;
  image_url: string;
  category: string;
  whatsapp_message: string;
  stock_quantity: string;
  is_available: boolean;
  is_featured: boolean;
  buy_action: 'whatsapp' | 'link' | 'razorpay';
  external_link: string;
}

interface ProductFormProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ProductForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }: ProductFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label htmlFor="priceUSD">Price (USD)</Label>
          <Input
            id="priceUSD"
            type="number"
            step="0.01"
            value={formData.priceUSD || ''}
            onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Product description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Mats, Blocks, Clothing"
          />
        </div>
        
        <div>
          <Label htmlFor="stock_quantity">Stock Quantity</Label>
          <Input
            id="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <div className="mt-1">
          <ImagePicker
            id="image_url"
            value={formData.image_url}
            onChange={(val) => setFormData({ ...formData, image_url: val })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_available"
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
        />
        <Label htmlFor="is_available">Product Available</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_featured"
          checked={formData.is_featured}
          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
        />
        <Label htmlFor="is_featured">Featured Product (Shows first)</Label>
      </div>

      <div className="space-y-4 pt-4 border-t border-yoga-sage/20">
        <h3 className="font-semibold text-yoga-forest">Purchase Action Settings</h3>
        
        <div className="space-y-2">
          <Label htmlFor="buy_action">Action on "Buy Now" click</Label>
          <select 
            id="buy_action"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.buy_action}
            onChange={(e) => setFormData({ ...formData, buy_action: e.target.value as any })}
          >
            <option value="whatsapp">Redirect to WhatsApp</option>
            <option value="link">Redirect to External Link</option>
            <option value="razorpay">Open Razorpay Checkout</option>
          </select>
        </div>

        {formData.buy_action === 'whatsapp' && (
          <div className="space-y-2">
            <Label htmlFor="whatsapp_message">WhatsApp Pre-filled Message</Label>
            <Textarea
              id="whatsapp_message"
              value={formData.whatsapp_message}
              onChange={(e) => setFormData({ ...formData, whatsapp_message: e.target.value })}
              placeholder="Hi, I would like to buy..."
            />
          </div>
        )}
        
        {formData.buy_action === 'link' && (
          <div className="space-y-2">
            <Label htmlFor="external_link">External URL</Label>
            <Input
              id="external_link"
              type="url"
              value={formData.external_link}
              onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
              placeholder="https://example.com/checkout"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-yoga-sage hover:bg-yoga-forest text-white">
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
