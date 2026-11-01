-- ==============================================================================
-- HS AGROFOODS — Complete Supabase Database Schema & Initial Catalog Seed
-- Run this script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- Enable UUID & Crypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. USERS, PROFILES & AUTH AUXILIARY TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  phone TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.auth_signup_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  encrypted_password TEXT NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  attempts INT DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auth_login_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  attempts INT DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. CATEGORIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  badge_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. PRODUCTS, VARIANTS, IMAGES, SPECS & FAQS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  featured_image_url TEXT,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  use_global_faqs BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.product_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.product_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.global_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. REVIEWS & RATINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to auto-sync product ratings
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_product_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  UPDATE products
  SET 
    average_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews
      WHERE product_id = target_product_id AND is_approved = true
    ), 0.00),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = target_product_id AND is_approved = true
    )
  WHERE id = target_product_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_rating_stats ON public.reviews;
CREATE TRIGGER trigger_update_product_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating_stats();

-- ==============================================================================
-- 5. SHOPPING CART & ORDERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID,
  address_id UUID,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT DEFAULT 'online',
  coupon_code TEXT,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_address JSONB,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  price_at_purchase NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  line_total NUMERIC(10,2) NOT NULL
);

-- ==============================================================================
-- 6. MARKETING, HERO SLIDES, ANNOUNCEMENTS & INQUIRIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  image_mobile_url TEXT,
  button_text TEXT DEFAULT 'Shop Now',
  button_link TEXT DEFAULT '/shop',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.delivery_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  free_shipping_threshold NUMERIC(10,2) NOT NULL DEFAULT 500,
  default_shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 50,
  is_cod_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. INDEXES FOR HIGH PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_auth_signup_otps_email ON public.auth_signup_otps(email);
CREATE INDEX IF NOT EXISTS idx_auth_login_otps_email ON public.auth_login_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_signup_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_login_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Product Variants" ON public.product_variants;
CREATE POLICY "Public Read Product Variants" ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Product Images" ON public.product_images;
CREATE POLICY "Public Read Product Images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Product Information" ON public.product_information;
CREATE POLICY "Public Read Product Information" ON public.product_information FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Product FAQs" ON public.product_faqs;
CREATE POLICY "Public Read Product FAQs" ON public.product_faqs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Global FAQs" ON public.global_faqs;
CREATE POLICY "Public Read Global FAQs" ON public.global_faqs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Hero Slides" ON public.hero_slides;
CREATE POLICY "Public Read Hero Slides" ON public.hero_slides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Announcements" ON public.announcements;
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Delivery Settings" ON public.delivery_settings;
CREATE POLICY "Public Read Delivery Settings" ON public.delivery_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service Role Full Access Users" ON public.users;
CREATE POLICY "Service Role Full Access Users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Profiles" ON public.profiles;
CREATE POLICY "Service Role Full Access Profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Addresses" ON public.addresses;
CREATE POLICY "Service Role Full Access Addresses" ON public.addresses FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Categories" ON public.categories;
CREATE POLICY "Service Role Full Access Categories" ON public.categories FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Products" ON public.products;
CREATE POLICY "Service Role Full Access Products" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Variants" ON public.product_variants;
CREATE POLICY "Service Role Full Access Variants" ON public.product_variants FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Images" ON public.product_images;
CREATE POLICY "Service Role Full Access Images" ON public.product_images FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Info" ON public.product_information;
CREATE POLICY "Service Role Full Access Info" ON public.product_information FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access FAQs" ON public.product_faqs;
CREATE POLICY "Service Role Full Access FAQs" ON public.product_faqs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Global FAQs" ON public.global_faqs;
CREATE POLICY "Service Role Full Access Global FAQs" ON public.global_faqs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Reviews" ON public.reviews;
CREATE POLICY "Service Role Full Access Reviews" ON public.reviews FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Cart" ON public.cart_items;
CREATE POLICY "Service Role Full Access Cart" ON public.cart_items FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Orders" ON public.orders;
CREATE POLICY "Service Role Full Access Orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Order Items" ON public.order_items;
CREATE POLICY "Service Role Full Access Order Items" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Hero Slides" ON public.hero_slides;
CREATE POLICY "Service Role Full Access Hero Slides" ON public.hero_slides FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Announcements" ON public.announcements;
CREATE POLICY "Service Role Full Access Announcements" ON public.announcements FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Inquiries" ON public.inquiries;
CREATE POLICY "Service Role Full Access Inquiries" ON public.inquiries FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Delivery" ON public.delivery_settings;
CREATE POLICY "Service Role Full Access Delivery" ON public.delivery_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==============================================================================
-- 9. INITIAL SEED DATA (3 Categories, 14 Products + Variants + Specs, 7 Hero Slides)
-- ==============================================================================

-- 9.1 Categories
INSERT INTO public.categories (name, slug, description, image_url, is_active)
VALUES
  ('Ground Spices', 'ground-spices', '100% pure, single-origin cold-ground Indian spices with natural essential oils intact.', 'https://ik.imagekit.io/pfb1irbcr/products/turmeric-powder.png', true),
  ('Blended Masale', 'blended-spices', 'Authentic royal and tangy spice blends crafted from whole roasted herbs and spices.', 'https://ik.imagekit.io/pfb1irbcr/products/shahi-garam-masala.jpeg', true),
  ('Dehydrated Veg & Fruit Powders', 'dehydrated-powders', 'Farm-fresh fruits and vegetables gently dehydrated and finely milled without preservatives or artificial colors.', 'https://ik.imagekit.io/pfb1irbcr/products/beetroot-powder.png', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active;

-- 9.2 Products (14 HS AgroFoods Products)
INSERT INTO public.products (category_id, name, slug, short_description, description, featured_image_url, is_active, is_featured, use_global_faqs)
VALUES
  -- Ground Spices (5)
  (
    (SELECT id FROM public.categories WHERE slug = 'ground-spices'),
    'Turmeric Powder (Haldi)',
    'turmeric-powder',
    '100% pure, single-origin Salem turmeric powder with guaranteed high curcumin content. Natural healing, rich golden color, and earthy aroma without any added starch or preservatives.',
    'HS AgroFoods Pure Turmeric Powder is sourced directly from the finest turmeric farms in Salem and Alleppey. Our turmeric roots are sun-dried and slow cold-ground using traditional methods to preserve their natural essential oils and maximum curcumin levels (3.5%+). Free from artificial food coloring, fillers, and chemical preservatives.',
    'https://ik.imagekit.io/pfb1irbcr/products/turmeric-powder.png',
    true, true, true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'ground-spices'),
    'Red Chilli Powder (Laal Mirch)',
    'red-chilli-powder',
    'Vibrant ruby red color with balanced appetizing heat. Sun-dried Guntur and Kashmiri chillies gently ground to lock in natural pungency and fiery aroma.',
    'HS AgroFoods Red Chilli Powder combines the rich natural red hue of premium Kashmiri chillies with the zesty kick of Andhra Guntur chillies. Stem-removed, sun-cured, and slowly ground to preserve the natural capsaicin oils. Never blended with brick dust, artificial dyes (Sudan red), or seed fillers.',
    'https://ik.imagekit.io/pfb1irbcr/products/red-chilli-powder.png',
    true, true, true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'ground-spices'),
    'Coriander Powder (Dhaniya)',
    'coriander-powder',
    'Gently slow-roasted whole green coriander seeds. Delivers sweet, citrusy aroma and rich body to gravies without any bitter aftertaste.',
    'HS AgroFoods Coriander Powder is crafted from plump, aroma-rich green coriander seeds sourced from Ramganj Mandi, Rajasthan and Madhya Pradesh. Lightly roasted before cold stone-grinding to retain volatile natural linalool essential oils.',
    'https://ik.imagekit.io/pfb1irbcr/products/coriander-powder.png',
    true, true, true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'ground-spices'),
    'Zeera Powder (Cumin Powder)',
    'zeera-powder',
    'Warm, nutty, and intensely fragrant. Sourced from the premium cumin belt of Unjha, Gujarat, perfectly roasted and stone-ground.',
    'HS AgroFoods Zeera Powder is celebrated for its deep earthy aroma and warm, savory punch. Hand-cleaned whole cumin seeds from Gujarat are slow-roasted to the exact temperature to release maximum aromatics and thymol oils before grinding.',
    'https://ik.imagekit.io/pfb1irbcr/products/zeera-powder.jpeg',
    true, true, true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'ground-spices'),
    'Dry Mango Powder (Amchur)',
    'mango-powder',
    '100% pure sun-dried green raw mango slices ground into a fragrant, zesty powder. Natural citrusy tang without citric acid chemicals.',
    'HS AgroFoods Dry Mango Powder (Amchur) is prepared from hand-harvested, tart green raw mangoes that are peeled, sun-cured hygienically, and finely ground. Free from synthetic citric acid or starch fillers.',
    'https://ik.imagekit.io/pfb1irbcr/products/mango-powder.png',
    true, false, true
  ),

  -- Blended Masale (3)
  (
    (SELECT id FROM public.categories WHERE slug = 'blended-spices'),
    'Shahi Garam Masala',
    'shahi-garam-masala',
    'A royal heritage blend of 14 slow-roasted whole spices — black cardamom, green cardamom, cloves, cinnamon, mace, nutmeg, and black pepper.',
    'HS AgroFoods Shahi Garam Masala is our signature culinary masterpiece. Handcrafted from an authentic North Indian royal recipe containing 14 aromatic whole spices. Every spice is individually slow-roasted and cold-ground so that just a pinch transforms any curry, paneer dish, dal, or biryani into a royal feast.',
    'https://ik.imagekit.io/pfb1irbcr/products/shahi-garam-masala.jpeg',
    true, true, true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'blended-spices'),
    'Tangy Chaat Masala',
    'chat-masala',
    'Irresistibly zesty, tangy, and savory blend of sun-dried amchur, roasted cumin, black salt (kala namak), mint, and black pepper.',
    'HS AgroFoods Tangy Chaat Masala brings the iconic street-style chatpata magic right to your kitchen table. Crafted with sun-dried raw mango slices (amchur), roasted Gujarat cumin, pink & black rock salt, dry ginger, hing, and crushed black pepper.',
    'https://ik.imagekit.io/pfb1irbcr/products/chat-masala.png',
    true, true, true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'blended-spices'),
    'Special Fruit Chaat Masala',
    'fruit-chat-masala',
    'A delicate, refreshing sweet-and-tangy seasoning crafted specially for fresh fruit bowls, juices, sprouts, and summer coolers.',
    'HS AgroFoods Special Fruit Chaat Masala is thoughtfully balanced so it enhances the natural sweetness of fresh fruits without overpowering them with harsh chilli heat. Blended with fine pink rock salt, mild amchur, roasted cumin, cardamom notes, and cooling mint.',
    'https://ik.imagekit.io/pfb1irbcr/products/fruit-chat-masala.png',
    true, false, true
  ),

  -- Dehydrated Veg & Fruit Powders (6)
  (
    (SELECT id FROM public.categories WHERE slug = 'dehydrated-powders'),
    'Pure Beetroot Powder (Chukandar)',
    'beetroot-powder',
    '100% natural low-temperature dehydrated beetroot powder. Rich in iron, nitrates, and antioxidants for smoothies, rotis, health drinks, and natural skincare.',
    'HS AgroFoods Pure Beetroot Powder is made from farm-fresh, deep-crimson beetroots that are washed, sliced, and gently dehydrated at low temperatures to lock in natural betalain pigments, iron, folate, and dietary fiber. Mix into smoothies, juices, chapati dough, soups, cakes, or natural skincare packs.',
    'https://ik.imagekit.io/pfb1irbcr/products/beetroot-powder.png',
    true, true, true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'dehydrated-powders'),
    'Dehydrated Tomato Powder',
    'tomato-powder',
    'Vine-ripened red tomatoes gently dehydrated into a rich, tangy, lycopene-packed powder. Instant base for curries, soups, pasta sauces, and seasoning blends.',
    'HS AgroFoods Dehydrated Tomato Powder is crafted from juicy, sun-ripened farm tomatoes. Carefully dehydrated at controlled temperatures to preserve natural lycopene antioxidants, vibrant red color, and sweet-tangy umami flavor. Rehydrate with warm water for instant tomato puree/paste or add directly to curries and soups.',
    'https://ik.imagekit.io/pfb1irbcr/products/tomato-powder.png',
    true, true, true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'dehydrated-powders'),
    'Raw Banana Powder',
    'banana-powder',
    'Nutrient-dense dehydrated raw Kerala banana powder rich in resistant starch, potassium, and prebiotic fiber. Ideal for wholesome porridge, smoothies, and gluten-free baking.',
    'HS AgroFoods Raw Banana Powder is hygienically prepared from select green raw bananas that are peeled, sliced, gently dehydrated, and finely milled into a smooth, easily digestible powder. Naturally gluten-free and packed with gut-friendly resistant starch and potassium.',
    'https://ik.imagekit.io/pfb1irbcr/products/banana-powder.png',
    true, true, true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'dehydrated-powders'),
    'Dehydrated Garlic Powder (Lehsun)',
    'garlic-powder',
    'Pungent, savory, and aromatic powder made from peeled farm-fresh Indian garlic cloves. Zero peeling hassle — instant garlicky depth for any dish.',
    'HS AgroFoods Dehydrated Garlic Powder (Lehsun Powder) is crafted from bold, allicin-rich white garlic bulbs sourced from Madhya Pradesh and Rajasthan. Cloves are hygienically peeled, gently dehydrated, and ground to a fine, free-flowing powder.',
    'https://ik.imagekit.io/pfb1irbcr/products/garlic-powder.png',
    true, false, true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'dehydrated-powders'),
    'Dehydrated Carrot Powder (Gajar)',
    'carrot-powder',
    'Naturally sweet, beta-carotene & Vitamin A rich dehydrated carrot powder. Perfect for soups, baby food, parathas, smoothies, and natural baking.',
    'HS AgroFoods Dehydrated Carrot Powder is made from fresh, sweet winter carrots gently air-dried to preserve their vibrant orange beta-carotene, Vitamin A, lutein, and natural sweetness. Stir into warm soups, dals, chilla/dosa batter, paratha dough, or smoothies.',
    'https://ik.imagekit.io/pfb1irbcr/products/carrot-powder.png',
    true, false, true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'dehydrated-powders'),
    'Dehydrated White Radish Powder (Mooli)',
    'radish-powder',
    'Pure sun-cured white radish (mooli) powder rich in digestive enzymes and detoxifying minerals. Ideal for parathas, soups, wellness tonics, and savory blends.',
    'HS AgroFoods Dehydrated White Radish Powder is prepared from crisp, farm-fresh white radishes (mooli) gently dehydrated at low temperatures to retain their natural digestive enzymes, Vitamin C, potassium, and distinctive peppery-sweet flavor.',
    'https://ik.imagekit.io/pfb1irbcr/products/radish-powder.png',
    true, false, true
  )
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  featured_image_url = EXCLUDED.featured_image_url,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured;

-- 9.3 Product Variants (100g, 250g, 500g Packs for all 14 Products)
DELETE FROM public.product_variants;

INSERT INTO public.product_variants (product_id, variant_name, price, original_price, stock_quantity, is_active)
SELECT id, '100g Pouch', 55, 70, 120, true FROM public.products WHERE slug = 'turmeric-powder' UNION ALL
SELECT id, '250g Pouch', 120, 150, 85, true FROM public.products WHERE slug = 'turmeric-powder' UNION ALL
SELECT id, '500g Value Pack', 220, 280, 60, true FROM public.products WHERE slug = 'turmeric-powder' UNION ALL
SELECT id, '1kg Family Pack', 410, 520, 40, true FROM public.products WHERE slug = 'turmeric-powder' UNION ALL

SELECT id, '100g Pouch', 65, 85, 110, true FROM public.products WHERE slug = 'red-chilli-powder' UNION ALL
SELECT id, '250g Pouch', 145, 180, 90, true FROM public.products WHERE slug = 'red-chilli-powder' UNION ALL
SELECT id, '500g Value Pack', 270, 340, 50, true FROM public.products WHERE slug = 'red-chilli-powder' UNION ALL
SELECT id, '1kg Family Pack', 520, 650, 35, true FROM public.products WHERE slug = 'red-chilli-powder' UNION ALL

SELECT id, '100g Pouch', 50, 65, 130, true FROM public.products WHERE slug = 'coriander-powder' UNION ALL
SELECT id, '250g Pouch', 110, 140, 95, true FROM public.products WHERE slug = 'coriander-powder' UNION ALL
SELECT id, '500g Value Pack', 205, 260, 70, true FROM public.products WHERE slug = 'coriander-powder' UNION ALL
SELECT id, '1kg Family Pack', 390, 490, 45, true FROM public.products WHERE slug = 'coriander-powder' UNION ALL

SELECT id, '100g Pouch', 75, 95, 100, true FROM public.products WHERE slug = 'zeera-powder' UNION ALL
SELECT id, '250g Pouch', 160, 200, 80, true FROM public.products WHERE slug = 'zeera-powder' UNION ALL
SELECT id, '500g Value Pack', 300, 380, 45, true FROM public.products WHERE slug = 'zeera-powder' UNION ALL

SELECT id, '100g Pouch', 85, 110, 115, true FROM public.products WHERE slug = 'shahi-garam-masala' UNION ALL
SELECT id, '250g Pouch', 180, 230, 75, true FROM public.products WHERE slug = 'shahi-garam-masala' UNION ALL
SELECT id, '500g Value Pack', 340, 430, 40, true FROM public.products WHERE slug = 'shahi-garam-masala' UNION ALL

SELECT id, '100g Pouch', 65, 85, 120, true FROM public.products WHERE slug = 'chat-masala' UNION ALL
SELECT id, '250g Pouch', 145, 185, 85, true FROM public.products WHERE slug = 'chat-masala' UNION ALL
SELECT id, '500g Value Pack', 270, 340, 50, true FROM public.products WHERE slug = 'chat-masala' UNION ALL

SELECT id, '100g Pouch', 70, 90, 110, true FROM public.products WHERE slug = 'fruit-chat-masala' UNION ALL
SELECT id, '250g Pouch', 155, 195, 75, true FROM public.products WHERE slug = 'fruit-chat-masala' UNION ALL
SELECT id, '500g Value Pack', 290, 360, 45, true FROM public.products WHERE slug = 'fruit-chat-masala' UNION ALL

SELECT id, '100g Pouch', 70, 90, 100, true FROM public.products WHERE slug = 'mango-powder' UNION ALL
SELECT id, '250g Pouch', 155, 195, 70, true FROM public.products WHERE slug = 'mango-powder' UNION ALL
SELECT id, '500g Value Pack', 290, 365, 45, true FROM public.products WHERE slug = 'mango-powder' UNION ALL

SELECT id, '100g Pouch', 95, 125, 110, true FROM public.products WHERE slug = 'beetroot-powder' UNION ALL
SELECT id, '250g Pouch', 210, 270, 80, true FROM public.products WHERE slug = 'beetroot-powder' UNION ALL
SELECT id, '500g Value Pack', 390, 495, 50, true FROM public.products WHERE slug = 'beetroot-powder' UNION ALL

SELECT id, '100g Pouch', 90, 120, 115, true FROM public.products WHERE slug = 'tomato-powder' UNION ALL
SELECT id, '250g Pouch', 199, 255, 80, true FROM public.products WHERE slug = 'tomato-powder' UNION ALL
SELECT id, '500g Value Pack', 375, 475, 45, true FROM public.products WHERE slug = 'tomato-powder' UNION ALL

SELECT id, '100g Pouch', 95, 125, 100, true FROM public.products WHERE slug = 'banana-powder' UNION ALL
SELECT id, '250g Pouch', 215, 275, 75, true FROM public.products WHERE slug = 'banana-powder' UNION ALL
SELECT id, '500g Value Pack', 399, 510, 45, true FROM public.products WHERE slug = 'banana-powder' UNION ALL

SELECT id, '100g Pouch', 80, 105, 110, true FROM public.products WHERE slug = 'garlic-powder' UNION ALL
SELECT id, '250g Pouch', 175, 225, 80, true FROM public.products WHERE slug = 'garlic-powder' UNION ALL
SELECT id, '500g Value Pack', 330, 420, 50, true FROM public.products WHERE slug = 'garlic-powder' UNION ALL

SELECT id, '100g Pouch', 95, 125, 95, true FROM public.products WHERE slug = 'carrot-powder' UNION ALL
SELECT id, '250g Pouch', 210, 270, 65, true FROM public.products WHERE slug = 'carrot-powder' UNION ALL
SELECT id, '500g Value Pack', 390, 495, 40, true FROM public.products WHERE slug = 'carrot-powder' UNION ALL

SELECT id, '100g Pouch', 90, 120, 90, true FROM public.products WHERE slug = 'radish-powder' UNION ALL
SELECT id, '250g Pouch', 199, 255, 60, true FROM public.products WHERE slug = 'radish-powder' UNION ALL
SELECT id, '500g Value Pack', 375, 475, 35, true FROM public.products WHERE slug = 'radish-powder';

-- 9.4 Product Gallery Images
DELETE FROM public.product_images;
INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT id, featured_image_url, 0 FROM public.products WHERE featured_image_url IS NOT NULL;

-- 9.5 Hero Slides (7 New 16:9 Banner Slides on ImageKit)
DELETE FROM public.hero_slides;
INSERT INTO public.hero_slides (image_url, title, subtitle, button_text, button_link, display_order, is_active)
VALUES
  (
    'https://ik.imagekit.io/pfb1irbcr/hero-slides/turmeric-slide.png',
    'Golden Purity. Natural Healing. Rich Curcumin.',
    'Handpicked Salem & Alleppey turmeric roots, cold-ground to preserve natural essential oils and authentic golden warmth.',
    'Shop Turmeric Powder',
    '/product/turmeric-powder',
    0, true
  ),
  (
    'https://ik.imagekit.io/pfb1irbcr/hero-slides/chat-masala-slide.png',
    'Tangy Chaat Masala — Bursting With Chatpata Flavor',
    'Crafted from sun-dried raw mango, roasted Gujarat cumin, black rock salt, and mint for irresistible everyday snacks and salads.',
    'Shop Chaat Masala',
    '/product/chat-masala',
    1, true
  ),
  (
    'https://ik.imagekit.io/pfb1irbcr/hero-slides/fruit-chat-slide.png',
    'Special Fruit Chaat Masala for Fresh Bowls',
    'A delicate blend of pink Himalayan salt, mild amchur, and cooling herbs that elevates every fresh fruit salad and juice.',
    'Shop Fruit Chaat Masala',
    '/product/fruit-chat-masala',
    2, true
  ),
  (
    'https://ik.imagekit.io/pfb1irbcr/hero-slides/mango-powder-slide.png',
    'Pure Dry Mango Powder (Amchur)',
    '100% natural, chemical-free unripe green mango slices finely ground for bright, fruity tang in curries, dals, and chutneys.',
    'Shop Amchur Powder',
    '/product/mango-powder',
    3, true
  ),
  (
    'https://ik.imagekit.io/pfb1irbcr/hero-slides/beetroot-slide.png',
    '100% Pure Dehydrated Beetroot Powder',
    'Low-temperature dehydrated farm beetroots packed with iron, antioxidants, and vibrant natural color for smoothies, rotis, and wellness.',
    'Shop Beetroot Powder',
    '/product/beetroot-powder',
    4, true
  ),
  (
    'https://ik.imagekit.io/pfb1irbcr/hero-slides/tomato-powder-slide.png',
    'Instant Dehydrated Tomato Powder',
    'Rich, sun-ripened tomatoes gently dehydrated into an instant tangy base for gravies, soups, pasta sauces, and snack seasonings.',
    'Shop Tomato Powder',
    '/product/tomato-powder',
    5, true
  ),
  (
    'https://ik.imagekit.io/pfb1irbcr/hero-slides/banana-powder-slide.png',
    'Pure Dehydrated Raw Banana Powder',
    'Naturally gluten-free raw green banana powder rich in potassium and resistant starch — ideal for healthy porridge, shakes, and baking.',
    'Shop Banana Powder',
    '/product/banana-powder',
    6, true
  );

-- 9.6 Global FAQs
DELETE FROM public.global_faqs;
INSERT INTO public.global_faqs (question, answer, display_order, is_active)
VALUES
  ('Are HS AgroFoods spices and dehydrated powders 100% natural?', 'Yes! All our ground spices, blended masale, and dehydrated vegetable & fruit powders are 100% natural with zero artificial colors, zero chemical preservatives, and zero starch fillers.', 0, true),
  ('How should I store dehydrated vegetable & fruit powders like Beetroot, Tomato, and Banana powder?', 'Because our dehydrated powders contain zero chemical anti-caking agents, always keep them sealed tightly in an airtight glass or steel jar in a cool, dry place (or refrigerate in humid weather) and use a completely dry spoon.', 1, true),
  ('How fast do you deliver across India?', 'Orders are dispatched within 24–48 hours and delivered across India in 3–6 business days with live tracking.', 2, true),
  ('Do you offer bulk or wholesale supply for restaurants and food brands?', 'Yes, we offer special B2B and bulk wholesale packs for restaurants, caterers, and food processors. Reach out to us via our Contact page or WhatsApp (+91 94931 84110 / +91 91009 39110).', 3, true);

-- 9.7 Default Announcement Bar & Delivery Settings
DELETE FROM public.announcements;
INSERT INTO public.announcements (message, is_active)
VALUES ('🌿 100% Pure Spices & Natural Dehydrated Veg & Fruit Powders • Free Shipping on Orders Above ₹500!', true);

INSERT INTO public.delivery_settings (free_shipping_threshold, default_shipping_fee, is_cod_enabled)
SELECT 500, 50, true
WHERE NOT EXISTS (SELECT 1 FROM public.delivery_settings);

-- ==============================================================================
-- Coupons
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,                       -- always stored UPPERCASE
  description TEXT,                                -- shown to the customer, e.g. "10% off your first order"
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  max_discount NUMERIC(10,2) CHECK (max_discount IS NULL OR max_discount > 0),  -- cap for percent coupons
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),            -- total redemptions, NULL = unlimited
  per_customer_limit INTEGER CHECK (per_customer_limit IS NULL OR per_customer_limit > 0),
  is_public BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Codes are looked up only by the server (service role), so customers cannot list or guess them.
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service Role Full Access Coupons" ON public.coupons;
CREATE POLICY "Service Role Full Access Coupons" ON public.coupons FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON public.orders(coupon_code) WHERE coupon_code IS NOT NULL;

-- ==============================================================================
-- Newsletter subscribers
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,                 -- stored lowercase
  source TEXT NOT NULL DEFAULT 'footer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service Role Full Access Newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Service Role Full Access Newsletter" ON public.newsletter_subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ==============================================================================
-- Homepage reels (max 10, managed in /admin/reels)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT NOT NULL,                    -- ImageKit video URL
  caption TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reels_order ON public.reels(display_order, created_at);

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Active Reels" ON public.reels;
CREATE POLICY "Public Read Active Reels" ON public.reels FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Service Role Full Access Reels" ON public.reels;
CREATE POLICY "Service Role Full Access Reels" ON public.reels FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==============================================================================
-- Starter product FAQs (5 per product)
-- ==============================================================================
WITH faq(slug, question, answer, ord) AS (
  VALUES
  -- ── Turmeric Powder ──
  ('turmeric-powder', 'Is this turmeric powder 100% pure?', 'Yes. It is made only from whole dried turmeric finger rhizomes from Salem & Erode, with no added colour, starch, fillers or preservatives. Every batch has 3.5%+ natural curcumin.', 0),
  ('turmeric-powder', 'Why is cold grinding important for turmeric?', 'Slow, low-temperature grinding keeps the natural essential oils, earthy aroma and golden colour that normal high-heat grinding can dull.', 1),
  ('turmeric-powder', 'How much turmeric should I use in daily cooking?', 'About a quarter to half teaspoon is enough for a dal or sabzi serving 3-4 people. Add it to hot oil or water, not to a dry hot pan, so it does not turn bitter.', 2),
  ('turmeric-powder', 'Can I add it to warm milk (haldi doodh)?', 'Yes, many families stir a small pinch into warm milk. It is a food product and is not a medicine, so please check with your doctor if you have a medical condition.', 3),
  ('turmeric-powder', 'How should I store it and for how long?', 'Keep it in a dry, airtight jar away from sunlight and moisture, and always use a dry spoon. The shelf life is 12 months from the packaging date.', 4),

  -- ── Red Chilli Powder ──
  ('red-chilli-powder', 'How hot is this red chilli powder?', 'It is balanced medium-hot. We blend Guntur chillies for the kick with Kashmiri chillies for the deep red colour. If you are new to it, start with a little less than your usual quantity and adjust.', 0),
  ('red-chilli-powder', 'Is any artificial colour or brick powder added?', 'No. The colour is completely natural from the chillies. It is never blended with brick dust, artificial dyes (like Sudan red) or seed fillers.', 1),
  ('red-chilli-powder', 'What is in the pack?', '100% stemless, sun-dried red chillies, slowly ground to preserve the natural oils. Nothing else is added.', 2),
  ('red-chilli-powder', 'My dish turned out too spicy. What can I do?', 'Add a spoon of curd or cream, a little sugar or jaggery, or a boiled potato or tomato. These balance the heat without changing the taste much.', 3),
  ('red-chilli-powder', 'How long does it stay fresh?', 'The shelf life is 12 months from the packaging date. Store it in an airtight jar in a cool, dry place and use a dry spoon every time.', 4),

  -- ── Zeera Powder ──
  ('zeera-powder', 'Where does this cumin come from?', 'The cumin seeds are sourced from Unjha in Saurashtra, Gujarat, a region known for its premium cumin. The seeds are hand-cleaned before roasting.', 0),
  ('zeera-powder', 'Is the zeera roasted before grinding?', 'Yes. The seeds are slow-roasted and then stone-ground, which brings out a warm, nutty aroma. The only ingredient is 100% pure roasted whole cumin seeds.', 1),
  ('zeera-powder', 'Where should I use zeera powder instead of whole cumin?', 'Use the powder in raita, chaas, chaat, marinades and dry rubs, where you want the flavour to blend in. Whole cumin is better for tadka.', 2),
  ('zeera-powder', 'How much should I use?', 'Half to one teaspoon is enough for a dish serving 3-4 people. For raita or chaas, a pinch on top is plenty.', 3),
  ('zeera-powder', 'How should I store it?', 'Keep it sealed in a dry, airtight container away from heat. Ground spices lose aroma faster once opened, so close the pack well. Shelf life is 12 months from packaging.', 4),

  -- ── Dry Mango Powder (Amchur) ──
  ('mango-powder', 'What is amchur and how does it taste?', 'Amchur is a powder made from unripe green mangoes that are peeled, sun-cured and finely ground. It gives a natural, fruity sourness to dishes.', 0),
  ('mango-powder', 'Does it contain citric acid or any additives?', 'No. It has zero citric acid, zero bleaching agents and no anti-caking fillers. The only ingredient is 100% sun-dried unripe green mango.', 1),
  ('mango-powder', 'Can I use it instead of lemon or tamarind?', 'Yes. It is great in dry sabzis, dals, chutneys, chaats and marinades when you want sourness without extra liquid. Start with half a teaspoon and adjust to taste.', 2),
  ('mango-powder', 'When should I add it while cooking?', 'Add it near the end of cooking. Long cooking on high heat can reduce its fresh tang.', 3),
  ('mango-powder', 'Why does the powder sometimes clump?', 'Because we add no anti-caking agents, it can absorb moisture in humid weather. Store it in an airtight jar, use a dry spoon, and break up any lumps with a fork. Shelf life is 12 months.', 4),

  -- ── Shahi Garam Masala ──
  ('shahi-garam-masala', 'What goes into the Shahi Garam Masala?', 'It is a blend of 14 whole spices, including coriander, cumin, black and green cardamom, cloves, cinnamon, star anise, mace (javitri), nutmeg (jaiphal), bay leaf, black pepper, dry ginger and fennel.', 0),
  ('shahi-garam-masala', 'How is it different from regular garam masala?', 'Each spice is slow-roasted individually and then cold-ground, and the recipe follows a North Indian royal style. This gives a deeper, rounder aroma, so you need less.', 1),
  ('shahi-garam-masala', 'When should I add garam masala to a dish?', 'Add a pinch towards the end of cooking, or sprinkle it over the finished dish. Its aroma is delicate and fades if it is cooked for too long.', 2),
  ('shahi-garam-masala', 'Which dishes is it best for?', 'It works beautifully in paneer and chicken curries, dal, rajma, chole, biryani and pulao. About half a teaspoon is enough for 3-4 servings.', 3),
  ('shahi-garam-masala', 'How long will it stay fresh?', 'The shelf life is 12 months from the packaging date. Keep the pack tightly sealed in a cool, dry place so the aroma stays strong.', 4),

  -- ── Tangy Chaat Masala ──
  ('chat-masala', 'What is in the Tangy Chaat Masala?', 'Dry mango (amchur), roasted cumin, black salt (kala namak), rock salt, coriander, mint leaves, black pepper, dry ginger and asafoetida (hing).', 0),
  ('chat-masala', 'What can I use chaat masala on?', 'Street-style chaat, salads, raita, pakoras, tandoori starters, fries, popcorn and snacks. A light sprinkle is usually enough.', 1),
  ('chat-masala', 'Is it very spicy?', 'It is tangy and savoury more than hot. The flavour comes from amchur, kala namak and roasted cumin, with only a gentle pepper note.', 2),
  ('chat-masala', 'Does it already contain salt?', 'Yes, it has black salt and rock salt. Taste your dish first and add less salt separately.', 3),
  ('chat-masala', 'How should I store it?', 'Store it in an airtight jar away from moisture, since black salt and amchur absorb humidity. Always use a dry spoon. Shelf life is 12 months from packaging.', 4),

  -- ── Special Fruit Chaat Masala ──
  ('fruit-chat-masala', 'What makes this different from regular chaat masala?', 'It is made to be mild and balanced, so it lifts the natural sweetness of fruit without harsh chilli heat. It has pink Himalayan salt, mild amchur, roasted cumin, white pepper, mint, fennel and cardamom.', 0),
  ('fruit-chat-masala', 'Which fruits does it go well with?', 'Apple, guava, papaya, pineapple, watermelon, cucumber and raw mango all work well. It is also lovely on fruit salads and sprouts.', 1),
  ('fruit-chat-masala', 'Can I use it in drinks?', 'Yes. A pinch gives mocktails, lemonade and fresh juices a sweet-tangy, cooling kick. You can also rim a glass with it.', 2),
  ('fruit-chat-masala', 'How much should I sprinkle?', 'Start with a quarter teaspoon for one bowl of fruit, toss gently and taste. Add more only if you want it tangier.', 3),
  ('fruit-chat-masala', 'How long does it last?', 'The shelf life is 12 months from the packaging date. Keep the pack sealed and dry, and use a dry spoon.', 4),

  -- ── Beetroot Powder ──
  ('beetroot-powder', 'What is in the Beetroot Powder?', 'Only 100% pure red beetroot. The beetroots are washed, sliced, gently dehydrated at a low temperature and finely milled. Nothing else is added.', 0),
  ('beetroot-powder', 'How do I use beetroot powder?', 'Mix half to one teaspoon into water, juice, smoothies or buttermilk. You can also add it to roti or paratha dough for a natural pink colour, or use it in baking.', 1),
  ('beetroot-powder', 'Will it stain my food bright pink?', 'Yes, that is the natural colour of beetroot. It is a good way to colour pancakes, cakes, dosa batter and icing without artificial dyes.', 2),
  ('beetroot-powder', 'How much beetroot powder equals fresh beetroot?', 'The powder is concentrated, so a small spoon replaces a much larger amount of fresh beetroot. Start with a small quantity and increase to suit your taste.', 3),
  ('beetroot-powder', 'How should I store it?', 'Keep it in a cool, dry, airtight jar and use a dry spoon. It has no anti-caking agents, so in humid weather you can refrigerate it. Shelf life is 12 months.', 4),

  -- ── Dehydrated Tomato Powder ──
  ('tomato-powder', 'What is tomato powder made from?', 'Only 100% vine-ripened red tomatoes, gently dehydrated at controlled temperatures and then milled. There are no added colours, sugar or preservatives.', 0),
  ('tomato-powder', 'How do I turn it into tomato puree?', 'Mix 1 part tomato powder with 3 parts warm water and stir well. You will get a rich tomato puree in a minute.', 1),
  ('tomato-powder', 'Where can I use tomato powder?', 'Instant gravies, tomato soup, pasta and pizza sauce, rice, dals and snack seasonings. It is very handy when fresh tomatoes are expensive or you have run out.', 2),
  ('tomato-powder', 'Can I add it directly to a dish without soaking?', 'Yes. Add it straight into curries, soups or sauces along with the liquid, and let it cook for a couple of minutes.', 3),
  ('tomato-powder', 'How should I store it?', 'Keep it tightly sealed, away from moisture, in a cool, dry place. Always use a dry spoon. The shelf life is 12 months.', 4),

  -- ── Raw Banana Powder ──
  ('banana-powder', 'What is raw banana powder?', 'It is made from green raw bananas that are peeled, sliced, gently dehydrated and finely milled into a smooth powder. The only ingredient is 100% pure raw green banana.', 0),
  ('banana-powder', 'Is it gluten-free?', 'Yes, raw banana powder is naturally gluten-free, so it is a popular choice for gluten-free baking and porridge.', 1),
  ('banana-powder', 'How do I use it?', 'Cook 1-2 tablespoons in warm milk or water to make a porridge, or add it to smoothies, milkshakes, pancakes and baking. Mix it into a little cold liquid first to avoid lumps.', 2),
  ('banana-powder', 'Can I eat it during fasting (vrat)?', 'Raw banana is commonly used in vrat recipes, and this powder contains only raw banana. If you follow strict fasting rules, please check the ingredients against your own practice.', 3),
  ('banana-powder', 'How should I store it?', 'Store it in an airtight jar in a cool, dry place and use a dry spoon. The shelf life is 12 months from the packaging date.', 4),

  -- ── Dehydrated Garlic Powder ──
  ('garlic-powder', 'What is in the garlic powder?', 'Only 100% pure garlic cloves, peeled, gently dehydrated and ground to a fine, free-flowing powder. Nothing else is added.', 0),
  ('garlic-powder', 'How much powder equals fresh garlic?', 'Half a teaspoon of garlic powder is about 2 fresh garlic cloves.', 1),
  ('garlic-powder', 'Where can I use garlic powder?', 'Use it in curries, dals, marinades, chutneys, garlic bread, pasta, soups, popcorn and snack seasonings. It saves the time spent on peeling and chopping.', 2),
  ('garlic-powder', 'When should I add it while cooking?', 'Add it with the other powdered spices, or stir it into the liquid. Do not fry it alone in hot oil for long, as it can burn and turn bitter.', 3),
  ('garlic-powder', 'How do I stop it from clumping?', 'Garlic absorbs moisture easily and we use no anti-caking agents. Keep it in an airtight jar, use a dry spoon, and never shake it directly over a steaming pot. Shelf life is 12 months.', 4),

  -- ── Dehydrated Carrot Powder ──
  ('carrot-powder', 'What is carrot powder made from?', 'Only 100% pure carrots, air-dried gently and finely milled. It keeps the natural orange colour and sweetness of fresh winter carrots.', 0),
  ('carrot-powder', 'How can I use carrot powder?', 'Add it to soups, parathas, rotis, idli or dosa batter, porridge, smoothies, cakes and halwa. It is a simple way to add colour and a mild natural sweetness.', 1),
  ('carrot-powder', 'Can I give it to children?', 'Many parents mix a little into porridge, rotis or soups for kids. It is a food ingredient, and for babies under one year please check with your paediatrician first.', 2),
  ('carrot-powder', 'How much should I use?', 'Start with 1-2 teaspoons per serving of soup, porridge or dough, and adjust to taste.', 3),
  ('carrot-powder', 'How should I store it?', 'Keep it in a cool, dry, airtight jar and use a dry spoon every time. Shelf life is 12 months from the packaging date.', 4),

  -- ── Dehydrated White Radish Powder ──
  ('radish-powder', 'What is white radish (mooli) powder?', 'It is made only from fresh white radishes that are gently dehydrated at low temperature and ground. It keeps the typical peppery-sweet flavour of mooli.', 0),
  ('radish-powder', 'How do I use it?', 'Mix it into paratha or roti stuffing, soups, savoury mixes and chutneys. It also works well in drinks and homemade seasoning blends.', 1),
  ('radish-powder', 'Does it have the strong smell of fresh mooli?', 'It has a mild, peppery-sweet note. Because it is dried, the smell is much gentler than cut fresh radish.', 2),
  ('radish-powder', 'How much should I use for a paratha filling?', 'Start with 1-2 tablespoons mixed with a little water for the filling of 3-4 parathas, then add salt and spices to taste.', 3),
  ('radish-powder', 'How should I store it?', 'Store it sealed in a cool, dry place and use a dry spoon. The shelf life is 12 months from the packaging date.', 4),

  -- ── Coriander Powder ──
  ('coriander-powder', 'Where does the coriander come from?', 'The plump green coriander seeds are sourced from Ramganj Mandi in Rajasthan and from Madhya Pradesh. They are Sortex-cleaned before grinding.', 0),
  ('coriander-powder', 'Is the coriander roasted?', 'Yes, the seeds are lightly roasted and then cold stone-ground. This keeps the natural aroma and gives a sweet, citrusy flavour without bitterness.', 1),
  ('coriander-powder', 'What do I use it for?', 'It is the base of most Indian gravies, sabzis, dals and masalas. It also thickens gravies slightly. About one to two teaspoons works for a dish serving 3-4 people.', 2),
  ('coriander-powder', 'Does it contain anything other than coriander?', 'No. The only ingredient is 100% whole green coriander seeds, with no fillers, colours or preservatives.', 3),
  ('coriander-powder', 'How long does it stay fresh?', 'The shelf life is 12 months from the packaging date. Keep it in an airtight jar in a cool, dry place and use a dry spoon.', 4)
)
INSERT INTO public.product_faqs (product_id, question, answer, display_order)
SELECT p.id, f.question, f.answer, f.ord
FROM faq f
JOIN public.products p ON p.slug = f.slug
WHERE NOT EXISTS (SELECT 1 FROM public.product_faqs pf WHERE pf.product_id = p.id)
ORDER BY f.slug, f.ord;

-- Product pages show their own FAQs; global FAQs now live on the homepage.
UPDATE public.products SET use_global_faqs = false WHERE use_global_faqs = true;

-- ==============================================================================
-- More global FAQs (homepage)
-- ==============================================================================
INSERT INTO public.global_faqs (question, answer, display_order, is_active)
SELECT v.question, v.answer, (SELECT COALESCE(MAX(display_order), -1) FROM public.global_faqs) + v.ord, true
FROM (
  VALUES
  (1, 'What payment options do you accept?', 'You can pay online with UPI, debit/credit cards or net banking through our secure checkout. Cash on Delivery is also available on eligible pin codes, and you can see it at checkout.'),
  (2, 'Are your products FSSAI certified and lab tested?', 'Yes. HS AgroFoods products are FSSAI certified and every batch is tested for purity. We never add artificial colours, synthetic dyes, fillers or chemical preservatives.'),
  (3, 'What if my order arrives damaged or I receive the wrong item?', 'We will replace it free or give you a full refund. Just WhatsApp or email us a photo within 48 hours of delivery. After verification, the replacement is dispatched within 24 hours, or the refund reaches your original payment method in 3-5 business days.'),
  (4, 'Can I return a pack if I change my mind?', 'Because spices and powders are edible food products, opened pouches cannot be returned for a change of mind. If a pack arrives damaged, with a broken seal, or is the wrong product, we will always make it right.'),
  (5, 'How can I track my order?', 'Once your order is shipped, you get the courier tracking details. You can also open Account > My Orders any time to see the live status of your parcel.')
) AS v(ord, question, answer)
WHERE NOT EXISTS (SELECT 1 FROM public.global_faqs g WHERE g.question = v.question);

-- Optional icon per global FAQ (Admin > Global FAQs)
ALTER TABLE public.global_faqs ADD COLUMN IF NOT EXISTS icon TEXT;
