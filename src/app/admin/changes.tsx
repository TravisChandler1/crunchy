"use client";
import { useState } from "react";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  available: boolean;
};

export default function AdminPage() {
  // ... existing imports and type definitions ...

  // Add these state variables
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', image: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>('');

  // Add these functions
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      return data.filename;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddOrEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imagePath = productForm.image;

      if (imageFile) {
        imagePath = await uploadImage(imageFile);
      }

      if (editingProduct) {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: editingProduct.id, 
            ...productForm,
            image: imagePath 
          })
        });

        if (res.ok) {
          const updated = await res.json();
          setProducts(products.map(p => p.id === updated.id ? updated : p));
          setEditingProduct(null);
          setProductForm({ name: '', description: '', price: '', image: '' });
          setImageFile(null);
          setImagePreview('');
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...productForm,
            image: imagePath
          })
        });

        if (res.ok) {
          const created = await res.json();
          setProducts([...products, created]);
          setProductForm({ name: '', description: '', price: '', image: '' });
          setImageFile(null);
          setImagePreview('');
        }
      }
    } catch (error) {
      console.error('Error handling product:', error);
      setError('Failed to save product. Please try again.');
    }
  };

  // Replace the image input field in your form with this
  return (
    // ... rest of your component ...
    <form onSubmit={handleAddOrEditProduct}>
      {/* Other form fields */}
      <div className="flex flex-col gap-2">
        <label className="text-[#7ed957]">Product Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="px-3 py-2 rounded border border-[#7ed957] bg-black/10 text-[#7ed957] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#7ed957] file:text-[#45523e] hover:file:bg-[#45523e] file:transition"
        />
        {imagePreview && (
          <div className="mt-2">
            <Image
              src={imagePreview}
              alt="Preview"
              width={100}
              height={100}
              className="rounded border border-[#7ed957] object-cover"
            />
          </div>
        )}
        {isUploading && <p className="text-[#7ed957]">Uploading image...</p>}
      </div>
      {/* Rest of your form */}
    </form>
    // ... rest of your component ...
  );
}
