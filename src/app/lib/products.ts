import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

type ProductReviewRow = {
  name?: string;
  rating?: number | string;
  comment?: string;
  created_at?: string;
  date?: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  stock: number | null;
  category: string | null;
  rating: number | string | null;
  images: string[] | null;
  is_featured: boolean | null;
  material: string | null;
  capacity: string | null;
  dimensions: string | null;
  weight: string | null;
  care: string | null;
  shipping_info: string | null;
  reviews: ProductReviewRow[] | string | null;
  created_at: string | null;
};

export type ProductMutationInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  images: string[];
  isFeatured?: boolean;
  material?: string;
  capacity?: string;
  dimensions?: string;
  weight?: string;
  care?: string;
  shippingInfo?: string;
  rating?: number;
};

type ProductUpdateInput = Partial<ProductMutationInput> & {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
};

export type ProductCard = {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  image: string;
  category: string | null;
  stock: number;
  isFeatured: boolean;
};

export type ProductReview = {
  name: string;
  rating: number;
  comment: string;
  date: string;
};

export type ProductDetailData = ProductCard & {
  description: string;
  rating: number;
  reviewCount: number;
  images: string[];
  specifications: Record<string, string>;
  shipping: string;
  reviews: ProductReview[];
};

const PRODUCT_SELECT = `
  id,
  name,
  description,
  price,
  stock,
  category,
  rating,
  images,
  is_featured,
  material,
  capacity,
  dimensions,
  weight,
  care,
  shipping_info,
  reviews,
  created_at
`;

const DEFAULT_SHIPPING_INFO = 'Shipping information will be shared at checkout. Orders are packed carefully and dispatched as soon as stock is confirmed.';
const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_PRODUCTS_BUCKET || 'cozip-images';

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }

  return fallback;
}

function formatPrice(price: number) {
  return `PKR ${new Intl.NumberFormat('en-PK').format(price)}`;
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractStoragePathFromPublicUrl(imageUrl: string) {
  try {
    const url = new URL(imageUrl);
    const publicPrefix = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

    if (!url.pathname.startsWith(publicPrefix)) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(publicPrefix.length));
  } catch {
    return null;
  }
}

function toNullableText(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

function sanitizeImages(images: string[] | null | undefined) {
  return Array.isArray(images) && images.length > 0
    ? images.filter((image) => typeof image === 'string' && image.trim().length > 0)
    : [];
}

function parseReviews(reviews: ProductRow['reviews']): ProductReview[] {
  if (!reviews) {
    return [];
  }

  let rawReviews = reviews;

  if (typeof reviews === 'string') {
    try {
      rawReviews = JSON.parse(reviews);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(rawReviews)) {
    return [];
  }

  return rawReviews.map((review, index) => {
    const reviewDate = review.created_at ?? review.date ?? '';

    return {
      name: review.name?.trim() || `Customer ${index + 1}`,
      rating: Math.max(1, Math.min(5, Math.round(toNumber(review.rating, 5)))),
      comment: review.comment?.trim() || 'Review details are not available yet.',
      date: reviewDate,
    };
  });
}

function buildSpecifications(product: ProductRow) {
  const specifications = {
    Material: product.material,
    Capacity: product.capacity,
    Dimensions: product.dimensions,
    Weight: product.weight,
    Care: product.care,
  };

  return Object.fromEntries(
    Object.entries(specifications).filter(([, value]) => Boolean(value && value.trim().length > 0))
  );
}

function mapProductRow(product: ProductRow): ProductDetailData {
  const price = toNumber(product.price);
  const images = sanitizeImages(product.images);
  const reviews = parseReviews(product.reviews);
  const specifications = buildSpecifications(product);

  return {
    id: product.id,
    name: product.name,
    price,
    formattedPrice: formatPrice(price),
    image: images[0] ?? '',
    category: product.category,
    stock: toNumber(product.stock),
    isFeatured: Boolean(product.is_featured),
    description: product.description?.trim() || 'Product description will be updated soon.',
    rating: Math.max(0, Math.min(5, toNumber(product.rating, 5))),
    reviewCount: reviews.length,
    images,
    specifications,
    shipping: product.shipping_info?.trim() || DEFAULT_SHIPPING_INFO,
    reviews,
  };
}

export async function getProducts() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapProductRow);
}

export async function getFeaturedProducts(limit = 5) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  if ((data ?? []).length > 0) {
    return data!.map(mapProductRow);
  }

  const fallbackProducts = await getProducts();
  return fallbackProducts.slice(0, limit);
}

export async function getProductById(productId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .single();

  if (error) {
    throw error;
  }

  return mapProductRow(data);
}

export async function uploadProductImages(files: File[]) {
  const supabase = getSupabaseClient();

  const uploadedImages = await Promise.all(
    files.map(async (file) => {
      const fileExtension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
      const sanitizedName = sanitizeFileName(file.name.replace(/\.[^.]+$/, '')) || 'product-image';
      const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2)}-${sanitizedName}.${fileExtension}`;

      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      return data.publicUrl;
    })
  );

  return uploadedImages;
}

export async function deleteProductImages(imageUrls: string[]) {
  const supabase = getSupabaseClient();
  const storagePaths = imageUrls
    .map(extractStoragePathFromPublicUrl)
    .filter((path): path is string => Boolean(path));

  if (storagePaths.length === 0) {
    return;
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(storagePaths);

  if (error) {
    throw error;
  }
}

function buildCreatePayload(input: ProductMutationInput) {
  return {
    name: input.name.trim(),
    description: toNullableText(input.description),
    price: input.price,
    stock: input.stock,
    category: toNullableText(input.category),
    images: input.images,
    is_featured: Boolean(input.isFeatured),
    material: toNullableText(input.material),
    capacity: toNullableText(input.capacity),
    dimensions: toNullableText(input.dimensions),
    weight: toNullableText(input.weight),
    care: toNullableText(input.care),
    shipping_info: toNullableText(input.shippingInfo),
    rating: input.rating ?? 5,
  };
}

function buildUpdatePayload(input: ProductUpdateInput) {
  const payload: Record<string, unknown> = {
    name: input.name.trim(),
    description: toNullableText(input.description),
    price: input.price,
    stock: input.stock,
    images: input.images,
  };

  if ('category' in input) {
    payload.category = toNullableText(input.category);
  }

  if ('isFeatured' in input) {
    payload.is_featured = Boolean(input.isFeatured);
  }

  if ('material' in input) {
    payload.material = toNullableText(input.material);
  }

  if ('capacity' in input) {
    payload.capacity = toNullableText(input.capacity);
  }

  if ('dimensions' in input) {
    payload.dimensions = toNullableText(input.dimensions);
  }

  if ('weight' in input) {
    payload.weight = toNullableText(input.weight);
  }

  if ('care' in input) {
    payload.care = toNullableText(input.care);
  }

  if ('shippingInfo' in input) {
    payload.shipping_info = toNullableText(input.shippingInfo);
  }

  if ('rating' in input) {
    payload.rating = input.rating ?? 5;
  }

  return payload;
}

export async function createProduct(input: ProductMutationInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .insert(buildCreatePayload(input))
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapProductRow(data);
}

export async function updateProduct(productId: string, input: ProductUpdateInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .update(buildUpdatePayload(input))
    .eq('id', productId)
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapProductRow(data);
}

export async function deleteProductById(productId: string) {
  const supabase = getSupabaseClient();

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('images')
    .eq('id', productId)
    .single();

  if (productError) {
    throw productError;
  }

  await deleteProductImages(sanitizeImages(product.images));

  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) {
    throw error;
  }
}

export function subscribeToProducts(onChange: () => void) {
  const supabase = getSupabaseClient();
  const channel = supabase
    .channel(`products-changes-${Math.random().toString(36).slice(2)}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      () => onChange()
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromProducts(channel: RealtimeChannel) {
  const supabase = getSupabaseClient();
  void supabase.removeChannel(channel);
}