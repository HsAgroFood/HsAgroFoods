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
  is_approved BOOLEAN NOT NULL DEFAULT true,
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
