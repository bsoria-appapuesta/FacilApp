import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  slug: string;
  name: string;
  category: string;
  bio?: string;
  avatar_url?: string;
  whatsapp: string;
  mode: 'catalog' | 'services' | 'both';
}

export interface Service {
  id: string;
  profile_id: string;
  title: string;
  description?: string;
  price: number;
  duration?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  profile_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
}

export interface GalleryImage {
  id: string;
  profile_id: string;
  image_url: string;
}
