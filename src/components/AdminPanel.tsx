"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Upload, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Image as ImageIcon,
  Loader2,
  Check,
  Eye,
} from "lucide-react";
import type { Product } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { formatUsd } from "@/lib/currency";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onRefresh: () => void;
}

const defaultSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const defaultColors = ["Black", "White", "Navy", "Gray", "Red", "Blue", "Green", "Pink", "Beige"];

export function AdminPanel({ open, onOpenChange, products, onRefresh }: AdminPanelProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("add");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "men",
    imageUrl: "",
    sizes: [] as string[],
    colors: [] as string[],
    featured: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "men",
      imageUrl: "",
      sizes: [],
      colors: [],
      featured: false,
    });
    setEditingProduct(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          toast({ title: "Not authorised", description: "Please log in as admin and try again.", variant: "destructive" });
          return;
        }

        toast({
          title: "Upload failed",
          description:
            data.error ??
            (response.status === 503
              ? "Production uploads are not configured. Set BLOB_READ_WRITE_TOKEN."
              : "Unknown error"),
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
        toast({ title: "Image uploaded" });
      } else {
        toast({ title: "Upload failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload failed", description: "Network error — check the console.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: editingProduct ? "Product updated" : "Product added" });
        resetForm();
        onRefresh();
        setActiveTab("manage");
      } else {
        toast({ title: "Save failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: "Save failed", description: "Network error — check the console.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl,
      sizes: product.sizes,
      colors: product.colors,
      featured: product.featured,
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: "Product deleted" });
        onRefresh();
      } else {
        toast({ title: "Delete failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Delete failed", description: "Network error.", variant: "destructive" });
    }
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Admin Panel</DialogTitle>
          <DialogDescription>
            Add, edit, or remove products from your store
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">
              {editingProduct ? "Edit Product" : "Add Product"}
            </TabsTrigger>
            <TabsTrigger value="manage">Manage Products</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="flex items-start gap-4">
                  <div
                    className={`relative w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
                      formData.imageUrl
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.imageUrl ? (
                      <Image
                        src={formData.imageUrl}
                        alt="Product"
                        fill
                        sizes="128px"
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center p-2">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                        ) : (
                          <ImageIcon className="w-8 h-8 mx-auto text-gray-400" />
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {isUploading ? "Uploading..." : "Click to upload"}
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  {formData.imageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Image
                    </Button>
                  )}
                </div>
              </div>

              {/* Name & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Classic Cotton T-Shirt"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="29.99"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="children">Children</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the product..."
                  rows={3}
                />
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <Label>Available Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {defaultSizes.map((size) => (
                    <Badge
                      key={size}
                      variant={formData.sizes.includes(size) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                      {formData.sizes.includes(size) && (
                        <Check className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <Label>Available Colors</Label>
                <div className="flex flex-wrap gap-2">
                  {defaultColors.map((color) => (
                    <Badge
                      key={color}
                      variant={formData.colors.includes(color) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleColor(color)}
                    >
                      {color}
                      {formData.colors.includes(color) && (
                        <Check className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="featured">Featured Product</Label>
                  <p className="text-sm text-muted-foreground">
                    Display this product in the hero section
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, featured: checked }))
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingProduct ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </Button>
                {editingProduct && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground">No products yet. Add your first product!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{product.name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                          <span className="text-sm font-semibold whitespace-nowrap">{formatUsd(product.price)}</span>
                          {product.featured && (
                            <Badge className="text-xs bg-amber-500">Featured</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
