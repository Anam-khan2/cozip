import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import { createProduct, uploadProductImages } from '../lib/products';

type ProductFormState = {
  productName: string;
  price: string;
  stock: string;
  category: string;
  description: string;
  material: string;
  capacity: string;
  dimensions: string;
  weight: string;
  care: string;
  shippingInfo: string;
  isFeatured: boolean;
};

const inputStyle = {
  border: '2px solid #E5E7EB',
  fontFamily: 'Inter, sans-serif',
  color: '#4A5D45',
  outline: 'none',
} as const;

const initialFormState: ProductFormState = {
  productName: '',
  price: '',
  stock: '',
  category: '',
  description: '',
  material: '',
  capacity: '',
  dimensions: '',
  weight: '',
  care: '',
  shippingInfo: '',
  isFeatured: false,
};

type DraftImage = {
  id: string;
  file: File;
  preview: string;
};

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [draftImages, setDraftImages] = useState<DraftImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateForm = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  };

  const handleFilesChange = (files: FileList | File[]) => {
    const nextFiles = Array.from(files);

    if (nextFiles.length === 0) {
      return;
    }

    const invalidFile = nextFiles.find((file) => !file.type.startsWith('image/'));

    if (invalidFile) {
      setSubmitError('Please upload a valid image file.');
      return;
    }

    setSubmitError(null);

    void Promise.all(
      nextFiles.map(
        (file) =>
          new Promise<DraftImage>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
                file,
                preview: reader.result as string,
              });
            };
            reader.readAsDataURL(file);
          })
      )
    ).then((nextDraftImages) => {
      setDraftImages((currentImages) => [...currentImages, ...nextDraftImages]);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesChange(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.productName || !form.price || !form.stock || !form.description) {
      setSubmitError('Please fill in the required product fields.');
      return;
    }

    if (draftImages.length === 0) {
      setSubmitError('Please upload at least one product image.');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedImages = await uploadProductImages(draftImages.map((image) => image.file));

      await createProduct({
        name: form.productName,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        images: uploadedImages,
        isFeatured: form.isFeatured,
        material: form.material,
        capacity: form.capacity,
        dimensions: form.dimensions,
        weight: form.weight,
        care: form.care,
        shippingInfo: form.shippingInfo,
      });

      navigate('/admin', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add product right now.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setDraftImages((currentImages) => currentImages.filter((_, index) => index !== indexToRemove));
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    setDraftImages((currentImages) => moveItem(currentImages, fromIndex, toIndex));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <header 
        className="border-b px-8 py-6"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
      >
        <div className="flex items-center gap-4 mb-2">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-sm transition-all hover:opacity-70"
            style={{
              color: '#7A9070',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Products
          </Link>
        </div>
        <h1 
          className="text-3xl"
          style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
        >
          Add New Product
        </h1>
        <p 
          className="text-sm mt-1"
          style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
        >
          Create a new product for your store catalog
        </p>
      </header>

      <main className="p-8">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8">
          {submitError && (
            <div
              className="rounded-2xl border px-5 py-4"
              style={{
                backgroundColor: '#FEF2F2',
                borderColor: '#FECACA',
                color: '#B91C1C',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <fieldset
              className="p-8 rounded-2xl border"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              <legend 
                className="text-xl mb-6 px-2"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                Product Details
              </legend>

              <div className="mb-6">
                <label htmlFor="productName" className="block text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  value={form.productName}
                  onChange={(e) => updateForm('productName', e.target.value)}
                  placeholder="e.g., Cute Bow Glass Sipper"
                  className="w-full px-4 py-3 rounded-xl transition-all"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#7A9070'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="price" className="block text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={form.price}
                    onChange={(e) => updateForm('price', e.target.value)}
                    placeholder="1500"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl transition-all"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#7A9070'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    value={form.stock}
                    onChange={(e) => updateForm('stock', e.target.value)}
                    placeholder="100"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl transition-all"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#7A9070'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="category" className="block text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    value={form.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                    placeholder="mugs"
                    className="w-full px-4 py-3 rounded-xl transition-all"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#7A9070'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>

                <label className="flex items-center gap-3 px-4 py-3 rounded-xl border mt-7" style={{ borderColor: '#E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => updateForm('isFeatured', e.target.checked)}
                    className="h-4 w-4"
                  />
                  Featured on home page
                </label>
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="Write a detailed product description..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl transition-all resize-none"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#7A9070'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="material" className="block text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Material
                  </label>
                  <input type="text" id="material" value={form.material} onChange={(e) => updateForm('material', e.target.value)} placeholder="Glass" className="w-full px-4 py-3 rounded-xl transition-all" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#7A9070'} onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label htmlFor="capacity" className="block text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Capacity
                  </label>
                  <input type="text" id="capacity" value={form.capacity} onChange={(e) => updateForm('capacity', e.target.value)} placeholder="550ml" className="w-full px-4 py-3 rounded-xl transition-all" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#7A9070'} onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label htmlFor="dimensions" className="block text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Dimensions
                  </label>
                  <input type="text" id="dimensions" value={form.dimensions} onChange={(e) => updateForm('dimensions', e.target.value)} placeholder="4 x 6 inches" className="w-full px-4 py-3 rounded-xl transition-all" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#7A9070'} onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Weight
                  </label>
                  <input type="text" id="weight" value={form.weight} onChange={(e) => updateForm('weight', e.target.value)} placeholder="350g" className="w-full px-4 py-3 rounded-xl transition-all" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#7A9070'} onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="care" className="block text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Care
                  </label>
                  <input type="text" id="care" value={form.care} onChange={(e) => updateForm('care', e.target.value)} placeholder="Hand wash recommended" className="w-full px-4 py-3 rounded-xl transition-all" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#7A9070'} onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="shippingInfo" className="block text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                  Shipping Info
                </label>
                <textarea
                  id="shippingInfo"
                  value={form.shippingInfo}
                  onChange={(e) => updateForm('shippingInfo', e.target.value)}
                  placeholder="Shipping notes for this product..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl transition-all resize-none"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#7A9070'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
            </fieldset>

            <fieldset className="p-8 rounded-2xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
              <legend className="text-xl mb-6 px-2" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
                Product Images
              </legend>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="rounded-xl transition-all cursor-pointer"
                style={{
                  border: isDragging ? '3px dashed #7A9070' : draftImages.length > 0 ? '2px solid #E5E7EB' : '2px dashed #D1D5DB',
                  backgroundColor: isDragging ? '#F0F4F0' : '#FAFAFA',
                  minHeight: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {draftImages.length > 0 ? (
                  <div className="w-full p-4">
                    <p className="mb-4 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 600 }}>
                      First image will be used as the main cover image.
                    </p>
                    <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                      {draftImages.map((image, index) => (
                        <div key={image.id} className="relative">
                          <img src={image.preview} alt={`Product preview ${index + 1}`} className="h-40 w-full rounded-xl object-cover" style={{ border: index === 0 ? '3px solid #7A9070' : '2px solid #E5E7EB' }} />
                          {index === 0 && (
                            <span className="absolute left-2 top-2 rounded-full px-3 py-1 text-xs" style={{ backgroundColor: '#7A9070', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                              Cover
                            </span>
                          )}
                          <button type="button" onClick={() => handleRemoveImage(index)} className="absolute right-2 top-2 rounded-full p-2 transition-all hover:opacity-70" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }} aria-label={`Remove image ${index + 1}`}>
                            <X className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <div className="absolute bottom-2 left-2 flex gap-2">
                            <button type="button" onClick={() => handleMoveImage(index, index - 1)} disabled={index === 0} className="rounded-full p-2 disabled:opacity-40" style={{ backgroundColor: '#FFFFFF', color: '#4A5D45' }} aria-label={`Move image ${index + 1} left`}>
                              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => handleMoveImage(index, index + 1)} disabled={index === draftImages.length - 1} className="rounded-full p-2 disabled:opacity-40" style={{ backgroundColor: '#FFFFFF', color: '#4A5D45' }} aria-label={`Move image ${index + 1} right`}>
                              <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <label htmlFor="imageUpload" className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2" style={{ backgroundColor: '#F0F4F0', color: '#7A9070', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      Add more images
                    </label>
                  </div>
                ) : (
                  <label htmlFor="imageUpload" className="flex flex-col items-center justify-center gap-4 cursor-pointer p-8 text-center">
                    <div className="p-6 rounded-full" style={{ backgroundColor: '#F0F4F0' }}>
                      <Upload className="w-12 h-12" style={{ color: '#7A9070' }} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-lg mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                        {isDragging ? 'Drop images here' : 'Upload Product Images'}
                      </p>
                      <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
                        Drag and drop or click to browse
                      </p>
                      <p className="text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}>
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                    <input type="file" id="imageUpload" accept="image/*" multiple onChange={(e) => handleFilesChange(e.target.files || [])} className="hidden" />
                  </label>
                )}
              </div>

              <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#F0F4F0' }}>
                <h4 className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                  Image Guidelines
                </h4>
                <ul className="text-xs space-y-1" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.6 }}>
                  <li>• Use high-quality product photos (min. 800x800px)</li>
                  <li>• Square format works best for thumbnails</li>
                  <li>• Clean, white or neutral background recommended</li>
                  <li>• Selected images will be saved into the product images array</li>
                </ul>
              </div>
            </fieldset>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link to="/admin" className="px-8 py-3 rounded-full transition-all hover:opacity-70" style={{ backgroundColor: '#F3F4F6', color: '#7A9070', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-full transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: '#7A9070', color: '#FFFFFF', boxShadow: '0 4px 16px rgba(122, 144, 112, 0.3)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
