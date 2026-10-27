import { SPICE_ASSETS } from './assets'

export type FallbackProduct = {
  id: string
  name: string
  slug: string
  short_description: string
  description: string
  featured_image_url: string
  average_rating: number
  review_count: number
  use_global_faqs: boolean
  is_featured: boolean
  is_active: boolean
  categories: {
    id: string
    name: string
    slug: string
  }
  product_images: {
    id: string
    image_url: string
    sort_order: number
  }[]
  product_variants: {
    id: string
    variant_name: string
    price: number
    original_price: number
    stock_quantity: number
    is_active: boolean
  }[]
  product_information: {
    id: string
    label: string
    value: string
    title?: string
    content?: string
    display_order: number
  }[]
  product_faqs: {
    id: string
    question: string
    answer: string
    display_order: number
  }[]
}

export const FALLBACK_CATEGORIES = [
  {
    id: 'cat-ground-spices',
    name: 'Ground Spices',
    slug: 'ground-spices',
    description: '100% pure, single-origin cold-ground Indian spices with natural essential oils intact.',
  },
  {
    id: 'cat-blended-spices',
    name: 'Blended Masale',
    slug: 'blended-spices',
    description: 'Authentic royal and tangy spice blends crafted from whole roasted herbs and spices.',
  },
  {
    id: 'cat-dehydrated-powders',
    name: 'Dehydrated Veg & Fruit Powders',
    slug: 'dehydrated-powders',
    description: 'Farm-fresh fruits and vegetables gently dehydrated and finely milled without preservatives or artificial colors.',
  },
]

export const FALLBACK_PRODUCTS: Record<string, FallbackProduct> = {
  'turmeric-powder': {
    id: 'prod-turmeric-01',
    name: 'Turmeric Powder (Haldi)',
    slug: 'turmeric-powder',
    short_description:
      '100% pure, single-origin Salem turmeric powder with guaranteed high curcumin content. Natural healing, rich golden color, and earthy aroma without any added starch or preservatives.',
    description: `HS AgroFoods Pure Turmeric Powder is sourced directly from the finest turmeric farms in Salem and Alleppey. Our turmeric roots are sun-dried and slow cold-ground using traditional methods to preserve their natural essential oils and maximum curcumin levels (3.5%+).

Free from artificial food coloring (such as lead chromate or metanil yellow), fillers, and chemical preservatives, our haldi brings authentic warmth, vibrant golden color, and profound Ayurvedic wellness to your everyday cooking.`,
    featured_image_url: SPICE_ASSETS.turmeric,
    average_rating: 4.9,
    review_count: 38,
    use_global_faqs: true,
    is_featured: true,
    is_active: true,
    categories: {
      id: 'cat-ground-spices',
      name: 'Ground Spices',
      slug: 'ground-spices',
    },
    product_images: [
      { id: 'img-t-1', image_url: SPICE_ASSETS.turmeric, sort_order: 1 },
      { id: 'img-t-2', image_url: '/images/turmeric-powder.jpeg', sort_order: 2 },
      { id: 'img-t-3', image_url: SPICE_ASSETS.recipes.naturalHealing, sort_order: 3 },
    ],
    product_variants: [
      { id: 'var-t-100', variant_name: '100g Pouch', price: 55, original_price: 70, stock_quantity: 120, is_active: true },
      { id: 'var-t-250', variant_name: '250g Pouch', price: 120, original_price: 150, stock_quantity: 85, is_active: true },
      { id: 'var-t-500', variant_name: '500g Value Pack', price: 220, original_price: 280, stock_quantity: 60, is_active: true },
      { id: 'var-t-1000', variant_name: '1kg Family Pack', price: 410, original_price: 520, stock_quantity: 40, is_active: true },
    ],
    product_information: [
      { id: 'info-t-1', label: 'Origin', value: 'Salem & Erode, Tamil Nadu, India', display_order: 1 },
      { id: 'info-t-2', label: 'Ingredients', value: '100% Pure Whole Dried Turmeric Finger Rhizomes (Curcuma Longa)', display_order: 2 },
      { id: 'info-t-3', label: 'Curcumin Content', value: '> 3.5% Natural Curcumin', display_order: 3 },
      { id: 'info-t-4', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 4 },
    ],
    product_faqs: [
      {
        id: 'faq-t-1',
        question: 'Is this turmeric powder tested for artificial colors?',
        answer: 'Yes! Every batch of HS AgroFoods Turmeric Powder is rigorously lab-tested to ensure zero adulteration, zero lead chromate, and zero artificial colors.',
        display_order: 1,
      },
      {
        id: 'faq-t-2',
        question: 'What is the natural curcumin percentage?',
        answer: 'Our turmeric is selected for high natural curcumin potency, averaging between 3.5% to 4.2% naturally.',
        display_order: 2,
      },
    ],
  },

  'red-chilli-powder': {
    id: 'prod-chilly-01',
    name: 'Red Chilli Powder (Laal Mirch)',
    slug: 'red-chilli-powder',
    short_description:
      'Vibrant ruby red color with balanced appetizing heat. Sun-dried Guntur and Kashmiri chillies gently ground to lock in natural pungency and fiery aroma.',
    description: `HS AgroFoods Red Chilli Powder combines the rich natural red hue of premium Kashmiri chillies with the zesty kick of Andhra Guntur chillies. Stem-removed, sun-cured, and slowly ground to preserve the natural capsaicin oils.

Never blended with brick dust, artificial dyes (Sudan red), or seed fillers. Delivers rich natural color and authentic spicy depth to every curry, tadka, tandoori, and gravy.`,
    featured_image_url: SPICE_ASSETS.redChilly,
    average_rating: 4.8,
    review_count: 52,
    use_global_faqs: true,
    is_featured: true,
    is_active: true,
    categories: {
      id: 'cat-ground-spices',
      name: 'Ground Spices',
      slug: 'ground-spices',
    },
    product_images: [
      { id: 'img-c-1', image_url: SPICE_ASSETS.redChilly, sort_order: 1 },
      { id: 'img-c-2', image_url: '/images/red-chilly-powder.jpeg', sort_order: 2 },
      { id: 'img-c-3', image_url: SPICE_ASSETS.recipes.energyBooster, sort_order: 3 },
    ],
    product_variants: [
      { id: 'var-c-100', variant_name: '100g Pouch', price: 65, original_price: 85, stock_quantity: 110, is_active: true },
      { id: 'var-c-250', variant_name: '250g Pouch', price: 145, original_price: 180, stock_quantity: 90, is_active: true },
      { id: 'var-c-500', variant_name: '500g Value Pack', price: 270, original_price: 340, stock_quantity: 50, is_active: true },
      { id: 'var-c-1000', variant_name: '1kg Family Pack', price: 520, original_price: 650, stock_quantity: 35, is_active: true },
    ],
    product_information: [
      { id: 'info-c-1', label: 'Origin', value: 'Guntur, Andhra Pradesh & Kashmir Valley', display_order: 1 },
      { id: 'info-c-2', label: 'Ingredients', value: '100% Stemless Sun-Dried Red Chillies', display_order: 2 },
      { id: 'info-c-3', label: 'Heat & Color', value: 'Balanced Medium-Hot with Natural Deep Crimson Hue', display_order: 3 },
      { id: 'info-c-4', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 4 },
    ],
    product_faqs: [
      {
        id: 'faq-c-1',
        question: 'Does this contain added color or oil?',
        answer: 'No, our red chilli powder derives 100% of its vibrant color and pungency naturally from whole sun-dried chillies.',
        display_order: 1,
      },
    ],
  },

  'coriander-powder': {
    id: 'prod-coriander-01',
    name: 'Coriander Powder (Dhaniya)',
    slug: 'coriander-powder',
    short_description:
      'Gently slow-roasted whole green coriander seeds. Delivers sweet, citrusy aroma and rich body to gravies without any bitter aftertaste.',
    description: `HS AgroFoods Coriander Powder is crafted from plump, aroma-rich green coriander seeds sourced from Ramganj Mandi, Rajasthan and Madhya Pradesh. Lightly roasted before cold stone-grinding to retain volatile natural linalool essential oils.

Gives your everyday curries, sabzis, and dals a naturally thick, fragrant base and farm-fresh taste.`,
    featured_image_url: SPICE_ASSETS.coriander,
    average_rating: 4.9,
    review_count: 27,
    use_global_faqs: true,
    is_featured: true,
    is_active: true,
    categories: {
      id: 'cat-ground-spices',
      name: 'Ground Spices',
      slug: 'ground-spices',
    },
    product_images: [
      { id: 'img-cor-1', image_url: SPICE_ASSETS.coriander, sort_order: 1 },
      { id: 'img-cor-2', image_url: '/images/coriander-powder.jpeg', sort_order: 2 },
      { id: 'img-cor-3', image_url: SPICE_ASSETS.recipes.betterDigestion, sort_order: 3 },
    ],
    product_variants: [
      { id: 'var-cor-100', variant_name: '100g Pouch', price: 50, original_price: 65, stock_quantity: 130, is_active: true },
      { id: 'var-cor-250', variant_name: '250g Pouch', price: 110, original_price: 140, stock_quantity: 95, is_active: true },
      { id: 'var-cor-500', variant_name: '500g Value Pack', price: 205, original_price: 260, stock_quantity: 70, is_active: true },
      { id: 'var-cor-1000', variant_name: '1kg Family Pack', price: 390, original_price: 490, stock_quantity: 45, is_active: true },
    ],
    product_information: [
      { id: 'info-cor-1', label: 'Origin', value: 'Ramganj Mandi, Rajasthan', display_order: 1 },
      { id: 'info-cor-2', label: 'Ingredients', value: '100% Whole Green Coriander Seeds (Coriandrum sativum)', display_order: 2 },
      { id: 'info-cor-3', label: 'Processing', value: 'Sortex Cleaned & Cold Stone-Ground', display_order: 3 },
      { id: 'info-cor-4', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 4 },
    ],
    product_faqs: [],
  },

  'zeera-powder': {
    id: 'prod-cumin-01',
    name: 'Zeera Powder (Cumin Powder)',
    slug: 'zeera-powder',
    short_description:
      'Warm, nutty, and intensely fragrant. Sourced from the premium cumin belt of Unjha, Gujarat, perfectly roasted and stone-ground.',
    description: `HS AgroFoods Zeera Powder is celebrated for its deep earthy aroma and warm, savory punch. Hand-cleaned whole cumin seeds from Gujarat are slow-roasted to the exact temperature to release maximum aromatics and thymol oils before grinding.

Ideal for raitas, chaats, jeera aloo, dals, curries, and digestive buttermilk (chaas).`,
    featured_image_url: SPICE_ASSETS.cumin,
    average_rating: 4.8,
    review_count: 24,
    use_global_faqs: true,
    is_featured: true,
    is_active: true,
    categories: {
      id: 'cat-ground-spices',
      name: 'Ground Spices',
      slug: 'ground-spices',
    },
    product_images: [
      { id: 'img-cum-1', image_url: SPICE_ASSETS.cumin, sort_order: 1 },
      { id: 'img-cum-2', image_url: SPICE_ASSETS.recipes.betterDigestion, sort_order: 2 },
    ],
    product_variants: [
      { id: 'var-cum-100', variant_name: '100g Pouch', price: 75, original_price: 95, stock_quantity: 100, is_active: true },
      { id: 'var-cum-250', variant_name: '250g Pouch', price: 160, original_price: 200, stock_quantity: 80, is_active: true },
      { id: 'var-cum-500', variant_name: '500g Value Pack', price: 300, original_price: 380, stock_quantity: 45, is_active: true },
    ],
    product_information: [
      { id: 'info-cum-1', label: 'Origin', value: 'Unjha, Saurashtra, Gujarat', display_order: 1 },
      { id: 'info-cum-2', label: 'Ingredients', value: '100% Pure Roasted Whole Cumin Seeds', display_order: 2 },
      { id: 'info-cum-3', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 3 },
    ],
    product_faqs: [],
  },

  'shahi-garam-masala': {
    id: 'prod-garam-01',
    name: 'Shahi Garam Masala',
    slug: 'shahi-garam-masala',
    short_description:
      'A royal heritage blend of 14 slow-roasted whole spices — black cardamom, green cardamom, cloves, cinnamon, mace, nutmeg, and black pepper.',
    description: `HS AgroFoods Shahi Garam Masala is our signature culinary masterpiece. Handcrafted from an authentic North Indian royal recipe containing 14 aromatic whole spices sourced from Kerala and North India.

Every spice is individually slow-roasted and cold-ground so that just a pinch at the end of cooking transforms any everyday curry, paneer dish, dal, or biryani into a royal feast.`,
    featured_image_url: SPICE_ASSETS.garamMasala,
    average_rating: 5.0,
    review_count: 46,
    use_global_faqs: true,
    is_featured: true,
    is_active: true,
    categories: {
      id: 'cat-blended-spices',
      name: 'Blended Masale',
      slug: 'blended-spices',
    },
    product_images: [
      { id: 'img-gm-1', image_url: SPICE_ASSETS.garamMasala, sort_order: 1 },
      { id: 'img-gm-2', image_url: '/images/whole-spices.jpg', sort_order: 2 },
      { id: 'img-gm-3', image_url: SPICE_ASSETS.recipes.healthyHeart, sort_order: 3 },
    ],
    product_variants: [
      { id: 'var-gm-100', variant_name: '100g Pouch', price: 85, original_price: 110, stock_quantity: 115, is_active: true },
      { id: 'var-gm-250', variant_name: '250g Pouch', price: 180, original_price: 230, stock_quantity: 75, is_active: true },
      { id: 'var-gm-500', variant_name: '500g Value Pack', price: 340, original_price: 430, stock_quantity: 40, is_active: true },
    ],
    product_information: [
      {
        id: 'info-gm-1',
        label: 'Master Blend Ingredients',
        value: 'Coriander, Cumin, Black Cardamom, Green Cardamom, Cloves, Cinnamon, Star Anise, Mace (Javitri), Nutmeg (Jaiphal), Bay Leaf, Black Pepper, Dry Ginger, Fennel',
        display_order: 1,
      },
      { id: 'info-gm-2', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 2 },
    ],
    product_faqs: [],
  },

  'chat-masala': {
    id: 'prod-chat-01',
    name: 'Tangy Chaat Masala',
    slug: 'chat-masala',
    short_description:
      'Irresistibly zesty, tangy, and savory blend of sun-dried amchur, roasted cumin, black salt (kala namak), mint, and black pepper.',
    description: `HS AgroFoods Tangy Chaat Masala brings the iconic street-style chatpata magic right to your kitchen table. Crafted with sun-dried raw mango slices (amchur), roasted Gujarat cumin, pink & black rock salt, dry ginger, hing, and crushed black pepper.

Sprinkle generously over aloo tikki, dahi bhalla, pakoras, salads, parathas, roasted snacks, and lemonades for an instant burst of mouth-watering tanginess and digestive goodness.`,
    featured_image_url: SPICE_ASSETS.chatMasala,
    average_rating: 4.9,
    review_count: 34,
    use_global_faqs: true,
    is_featured: true,
    is_active: true,
    categories: {
      id: 'cat-blended-spices',
      name: 'Blended Masale',
      slug: 'blended-spices',
    },
    product_images: [
      { id: 'img-cm-1', image_url: SPICE_ASSETS.chatMasala, sort_order: 1 },
      { id: 'img-cm-2', image_url: SPICE_ASSETS.slides.chatMasala, sort_order: 2 },
    ],
    product_variants: [
      { id: 'var-cm-100', variant_name: '100g Pouch', price: 65, original_price: 85, stock_quantity: 120, is_active: true },
      { id: 'var-cm-250', variant_name: '250g Pouch', price: 145, original_price: 185, stock_quantity: 85, is_active: true },
      { id: 'var-cm-500', variant_name: '500g Value Pack', price: 270, original_price: 340, stock_quantity: 50, is_active: true },
    ],
    product_information: [
      {
        id: 'info-cm-1',
        label: 'Key Ingredients',
        value: 'Dry Mango (Amchur), Roasted Cumin, Black Salt (Kala Namak), Rock Salt, Coriander, Mint Leaves, Black Pepper, Dry Ginger, Asafoetida (Hing)',
        display_order: 1,
      },
      { id: 'info-cm-2', label: 'Best Used For', value: 'Street Chaat, Salads, Raita, Pakoras, Tandoori Starters & Snacks', display_order: 2 },
      { id: 'info-cm-3', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 3 },
    ],
    product_faqs: [],
  },

  'fruit-chat-masala': {
    id: 'prod-fruitchat-01',
    name: 'Special Fruit Chaat Masala',
    slug: 'fruit-chat-masala',
    short_description:
      'A delicate, refreshing sweet-and-tangy seasoning crafted specially for fresh fruit bowls, juices, sprouts, and summer coolers.',
    description: `HS AgroFoods Special Fruit Chaat Masala is thoughtfully balanced so it enhances the natural sweetness of fresh fruits without overpowering them with harsh chilli heat. Blended with fine pink rock salt, mild amchur, roasted cumin, cardamom notes, and cooling mint.

Turn everyday apples, bananas, papayas, pomegranates, guavas, and citrus salads into an irresistible, vitamin-packed treat loved by kids and adults alike.`,
    featured_image_url: SPICE_ASSETS.fruitChatMasala,
    average_rating: 4.9,
    review_count: 29,
    use_global_faqs: true,
    is_featured: false,
    is_active: true,
    categories: {
      id: 'cat-blended-spices',
      name: 'Blended Masale',
      slug: 'blended-spices',
    },
    product_images: [
      { id: 'img-fcm-1', image_url: SPICE_ASSETS.fruitChatMasala, sort_order: 1 },
      { id: 'img-fcm-2', image_url: SPICE_ASSETS.slides.fruitChat, sort_order: 2 },
    ],
    product_variants: [
      { id: 'var-fcm-100', variant_name: '100g Pouch', price: 70, original_price: 90, stock_quantity: 110, is_active: true },
      { id: 'var-fcm-250', variant_name: '250g Pouch', price: 155, original_price: 195, stock_quantity: 75, is_active: true },
      { id: 'var-fcm-500', variant_name: '500g Value Pack', price: 290, original_price: 360, stock_quantity: 45, is_active: true },
    ],
    product_information: [
      {
        id: 'info-fcm-1',
        label: 'Key Ingredients',
        value: 'Pink Himalayan Salt, Black Salt, Sun-Dried Raw Mango, Roasted Cumin, White Pepper, Dry Mint, Fennel & Green Cardamom',
        display_order: 1,
      },
      { id: 'info-fcm-2', label: 'Best Used For', value: 'Fresh Cut Fruits, Fruit Salads, Sprouts, Sweet Corn & Mocktails', display_order: 2 },
      { id: 'info-fcm-3', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 3 },
    ],
    product_faqs: [],
  },

  'mango-powder': {
    id: 'prod-mango-01',
    name: 'Dry Mango Powder (Amchur)',
    slug: 'mango-powder',
    short_description:
      '100% pure sun-dried green raw mango slices ground into a fragrant, zesty powder. Natural citrusy tang without citric acid chemicals.',
    description: `HS AgroFoods Dry Mango Powder (Amchur) is prepared from hand-harvested, tart green raw mangoes that are peeled, sun-cured hygienically, and finely ground.

Free from synthetic citric acid or starch fillers, our pure amchur adds a bright, fruity sourness to bhindi masala, chole, aloo sabzis, chutneys, marinades, samosa fillings, and dals.`,
    featured_image_url: SPICE_ASSETS.mangoPowder,
    average_rating: 4.8,
    review_count: 21,
    use_global_faqs: true,
    is_featured: false,
    is_active: true,
    categories: {
      id: 'cat-ground-spices',
      name: 'Ground Spices',
      slug: 'ground-spices',
    },
    product_images: [
      { id: 'img-mp-1', image_url: SPICE_ASSETS.mangoPowder, sort_order: 1 },
      { id: 'img-mp-2', image_url: SPICE_ASSETS.slides.mangoPowder, sort_order: 2 },
    ],
    product_variants: [
      { id: 'var-mp-100', variant_name: '100g Pouch', price: 70, original_price: 90, stock_quantity: 100, is_active: true },
      { id: 'var-mp-250', variant_name: '250g Pouch', price: 155, original_price: 195, stock_quantity: 70, is_active: true },
      { id: 'var-mp-500', variant_name: '500g Value Pack', price: 290, original_price: 365, stock_quantity: 45, is_active: true },
    ],
    product_information: [
      { id: 'info-mp-1', label: 'Ingredients', value: '100% Pure Sun-Dried Unripe Green Mango Slices (Mangifera indica)', display_order: 1 },
      { id: 'info-mp-2', label: 'Additives', value: 'Zero Citric Acid, Zero Bleaching Agents, No Anti-Caking Fillers', display_order: 2 },
      { id: 'info-mp-3', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 3 },
    ],
    product_faqs: [],
  },

  'beetroot-powder': {
    id: 'prod-beetroot-01',
    name: 'Pure Beetroot Powder (Chukandar)',
    slug: 'beetroot-powder',
    short_description:
      '100% natural low-temperature dehydrated beetroot powder. Rich in iron, nitrates, and antioxidants for smoothies, rotis, health drinks, and natural skincare.',
    description: `HS AgroFoods Pure Beetroot Powder is made from farm-fresh, deep-crimson beetroots that are washed, sliced, and gently dehydrated at low temperatures to lock in natural betalain pigments, iron, folate, and dietary fiber.

One spoonful equals the nutrition of a whole fresh beetroot! Mix into pre-workout smoothies, juices, chapati/paratha dough, soups, cakes, or use as a 100% chemical-free natural food color and glowing skin/lip pack.`,
    featured_image_url: SPICE_ASSETS.beetrootPowder,
    average_rating: 4.9,
    review_count: 41,
    use_global_faqs: true,
    is_featured: true,
    is_active: true,
    categories: {
      id: 'cat-dehydrated-powders',
      name: 'Dehydrated Veg & Fruit Powders',
      slug: 'dehydrated-powders',
    },
    product_images: [
      { id: 'img-bt-1', image_url: SPICE_ASSETS.beetrootPowder, sort_order: 1 },
      { id: 'img-bt-2', image_url: SPICE_ASSETS.slides.beetroot, sort_order: 2 },
    ],
    product_variants: [
      { id: 'var-bt-100', variant_name: '100g Pouch', price: 95, original_price: 125, stock_quantity: 110, is_active: true },
      { id: 'var-bt-250', variant_name: '250g Pouch', price: 210, original_price: 270, stock_quantity: 80, is_active: true },
      { id: 'var-bt-500', variant_name: '500g Value Pack', price: 390, original_price: 495, stock_quantity: 50, is_active: true },
    ],
    product_information: [
      { id: 'info-bt-1', label: 'Ingredients', value: '100% Pure Dehydrated Red Beetroot (Beta vulgaris)', display_order: 1 },
      { id: 'info-bt-2', label: 'Processing', value: 'Low-Temperature Solar/Air Dehydrated & Finely Milled', display_order: 2 },
      { id: 'info-bt-3', label: 'Ideal Uses', value: 'Health Drinks, Smoothies, Pink Roti Dough, Baking, Natural Food Color & Skincare', display_order: 3 },
      { id: 'info-bt-4', label: 'Shelf Life', value: '12 Months (Store in a cool, dry airtight jar)', display_order: 4 },
    ],
    product_faqs: [
      {
        id: 'faq-bt-1',
        question: 'Does this beetroot powder contain added sugar or artificial red dye?',
        answer: 'No! It is 100% pure dehydrated beetroot with zero added sugar, zero preservatives, and zero artificial color.',
        display_order: 1,
      },
    ],
  },

  'tomato-powder': {
    id: 'prod-tomato-01',
    name: 'Dehydrated Tomato Powder',
    slug: 'tomato-powder',
    short_description:
      'Vine-ripened red tomatoes gently dehydrated into a rich, tangy, lycopene-packed powder. Instant base for curries, soups, pasta sauces, and seasoning blends.',
    description: `HS AgroFoods Dehydrated Tomato Powder is crafted from juicy, sun-ripened farm tomatoes. Carefully dehydrated at controlled temperatures to preserve natural lycopene antioxidants, vibrant red color, and sweet-tangy umami flavor.

No more worrying about fluctuating tomato prices or spoilage! Rehydrate with warm water for instant tomato puree/paste, or add directly to curries, dals, soups, pasta sauces, khakhra/chips seasoning, and camping meals.`,
    featured_image_url: SPICE_ASSETS.tomatoPowder,
    average_rating: 4.9,
    review_count: 33,
    use_global_faqs: true,
    is_featured: true,
    is_active: true,
    categories: {
      id: 'cat-dehydrated-powders',
      name: 'Dehydrated Veg & Fruit Powders',
      slug: 'dehydrated-powders',
    },
    product_images: [
      { id: 'img-tm-1', image_url: SPICE_ASSETS.tomatoPowder, sort_order: 1 },
      { id: 'img-tm-2', image_url: SPICE_ASSETS.slides.tomatoPowder, sort_order: 2 },
    ],
    product_variants: [
      { id: 'var-tm-100', variant_name: '100g Pouch', price: 90, original_price: 120, stock_quantity: 115, is_active: true },
      { id: 'var-tm-250', variant_name: '250g Pouch', price: 199, original_price: 255, stock_quantity: 80, is_active: true },
      { id: 'var-tm-500', variant_name: '500g Value Pack', price: 375, original_price: 475, stock_quantity: 45, is_active: true },
    ],
    product_information: [
      { id: 'info-tm-1', label: 'Ingredients', value: '100% Pure Dehydrated Vine-Ripened Red Tomatoes', display_order: 1 },
      { id: 'info-tm-2', label: 'Rehydration Ratio', value: 'Mix 1 part Tomato Powder with 3 parts warm water for rich tomato puree', display_order: 2 },
      { id: 'info-tm-3', label: 'Ideal Uses', value: 'Instant Gravies, Tomato Soup, Pasta & Pizza Sauce, Snack Seasoning', display_order: 3 },
      { id: 'info-tm-4', label: 'Shelf Life', value: '12 Months (Keep tightly sealed away from moisture)', display_order: 4 },
    ],
    product_faqs: [],
  },

  'banana-powder': {
    id: 'prod-banana-01',
    name: 'Raw Banana Powder',
    slug: 'banana-powder',
    short_description:
      'Nutrient-dense dehydrated raw Kerala banana powder rich in resistant starch, potassium, and prebiotic fiber. Ideal for wholesome porridge, smoothies, and gluten-free baking.',
    description: `HS AgroFoods Raw Banana Powder is hygienically prepared from select green raw bananas that are peeled, sliced, gently dehydrated, and finely milled into a smooth, easily digestible flour/powder.

Naturally gluten-free and packed with gut-friendly resistant starch, potassium, and essential vitamins. Perfect for nutritious baby/toddler porridge (kheer), energy smoothies, weight-management shakes, pancakes, and gluten-free baking.`,
    featured_image_url: SPICE_ASSETS.bananaPowder,
    average_rating: 4.9,
    review_count: 37,
    use_global_faqs: true,
    is_featured: true,
    is_active: true,
    categories: {
      id: 'cat-dehydrated-powders',
      name: 'Dehydrated Veg & Fruit Powders',
      slug: 'dehydrated-powders',
    },
    product_images: [
      { id: 'img-bn-1', image_url: SPICE_ASSETS.bananaPowder, sort_order: 1 },
      { id: 'img-bn-2', image_url: SPICE_ASSETS.slides.bananaPowder, sort_order: 2 },
    ],
    product_variants: [
      { id: 'var-bn-100', variant_name: '100g Pouch', price: 95, original_price: 125, stock_quantity: 100, is_active: true },
      { id: 'var-bn-250', variant_name: '250g Pouch', price: 215, original_price: 275, stock_quantity: 75, is_active: true },
      { id: 'var-bn-500', variant_name: '500g Value Pack', price: 399, original_price: 510, stock_quantity: 45, is_active: true },
    ],
    product_information: [
      { id: 'info-bn-1', label: 'Ingredients', value: '100% Pure Dehydrated Raw Green Bananas', display_order: 1 },
      { id: 'info-bn-2', label: 'Dietary Profile', value: 'Naturally Gluten-Free, Rich in Prebiotic Resistant Starch & Potassium', display_order: 2 },
      { id: 'info-bn-3', label: 'Ideal Uses', value: 'Healthy Porridge, Milkshakes, Smoothies, Fasting (Vrat) Recipes & Baking', display_order: 3 },
      { id: 'info-bn-4', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 4 },
    ],
    product_faqs: [],
  },

  'garlic-powder': {
    id: 'prod-garlic-01',
    name: 'Dehydrated Garlic Powder (Lehsun)',
    slug: 'garlic-powder',
    short_description:
      'Pungent, savory, and aromatic powder made from peeled farm-fresh Indian garlic cloves. Zero peeling hassle — instant garlicky depth for any dish.',
    description: `HS AgroFoods Dehydrated Garlic Powder (Lehsun Powder) is crafted from bold, allicin-rich white garlic bulbs sourced from Madhya Pradesh and Rajasthan. Cloves are hygienically peeled, gently dehydrated, and ground to a fine, free-flowing powder.

Skip the tedious peeling and chopping! Adds rich, savory garlic aroma to curries, stir-fries, garlic bread, pasta, soups, marinades, dips, and roasted snacks in seconds.`,
    featured_image_url: SPICE_ASSETS.garlicPowder,
    average_rating: 4.8,
    review_count: 26,
    use_global_faqs: true,
    is_featured: false,
    is_active: true,
    categories: {
      id: 'cat-dehydrated-powders',
      name: 'Dehydrated Veg & Fruit Powders',
      slug: 'dehydrated-powders',
    },
    product_images: [
      { id: 'img-gl-1', image_url: SPICE_ASSETS.garlicPowder, sort_order: 1 },
    ],
    product_variants: [
      { id: 'var-gl-100', variant_name: '100g Pouch', price: 80, original_price: 105, stock_quantity: 110, is_active: true },
      { id: 'var-gl-250', variant_name: '250g Pouch', price: 175, original_price: 225, stock_quantity: 80, is_active: true },
      { id: 'var-gl-500', variant_name: '500g Value Pack', price: 330, original_price: 420, stock_quantity: 50, is_active: true },
    ],
    product_information: [
      { id: 'info-gl-1', label: 'Ingredients', value: '100% Pure Dehydrated Garlic Cloves (Allium sativum)', display_order: 1 },
      { id: 'info-gl-2', label: 'Conversion', value: '1/2 tsp Garlic Powder = 2 Fresh Garlic Cloves', display_order: 2 },
      { id: 'info-gl-3', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 3 },
    ],
    product_faqs: [],
  },

  'carrot-powder': {
    id: 'prod-carrot-01',
    name: 'Dehydrated Carrot Powder (Gajar)',
    slug: 'carrot-powder',
    short_description:
      'Naturally sweet, beta-carotene & Vitamin A rich dehydrated carrot powder. Perfect for soups, baby food, parathas, smoothies, and natural baking.',
    description: `HS AgroFoods Dehydrated Carrot Powder is made from fresh, sweet winter carrots gently air-dried to preserve their vibrant orange beta-carotene, Vitamin A, lutein, and natural sweetness.

An effortless way to boost daily vegetable nutrition for kids and families! Stir into warm soups, dals, chilla/dosa batter, paratha dough, smoothies, or instant halwa and cake mixes.`,
    featured_image_url: SPICE_ASSETS.carrotPowder,
    average_rating: 4.8,
    review_count: 19,
    use_global_faqs: true,
    is_featured: false,
    is_active: true,
    categories: {
      id: 'cat-dehydrated-powders',
      name: 'Dehydrated Veg & Fruit Powders',
      slug: 'dehydrated-powders',
    },
    product_images: [
      { id: 'img-cr-1', image_url: SPICE_ASSETS.carrotPowder, sort_order: 1 },
    ],
    product_variants: [
      { id: 'var-cr-100', variant_name: '100g Pouch', price: 95, original_price: 125, stock_quantity: 95, is_active: true },
      { id: 'var-cr-250', variant_name: '250g Pouch', price: 210, original_price: 270, stock_quantity: 65, is_active: true },
      { id: 'var-cr-500', variant_name: '500g Value Pack', price: 390, original_price: 495, stock_quantity: 40, is_active: true },
    ],
    product_information: [
      { id: 'info-cr-1', label: 'Ingredients', value: '100% Pure Dehydrated Carrots (Daucus carota)', display_order: 1 },
      { id: 'info-cr-2', label: 'Key Nutrients', value: 'Rich in Beta-Carotene (Pro-Vitamin A), Antioxidants & Dietary Fiber', display_order: 2 },
      { id: 'info-cr-3', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 3 },
    ],
    product_faqs: [],
  },

  'radish-powder': {
    id: 'prod-radish-01',
    name: 'Dehydrated White Radish Powder (Mooli)',
    slug: 'radish-powder',
    short_description:
      'Pure sun-cured white radish (mooli) powder rich in digestive enzymes and detoxifying minerals. Ideal for parathas, soups, wellness tonics, and savory blends.',
    description: `HS AgroFoods Dehydrated White Radish Powder is prepared from crisp, farm-fresh white radishes (mooli) gently dehydrated at low temperatures to retain their natural digestive enzymes, Vitamin C, potassium, and distinctive peppery-sweet flavor.

Use year-round in mooli parathas, kachoris, sambar, detoxifying herbal drinks, soups, and traditional Ayurvedic digestive preparations.`,
    featured_image_url: SPICE_ASSETS.radishPowder,
    average_rating: 4.8,
    review_count: 16,
    use_global_faqs: true,
    is_featured: false,
    is_active: true,
    categories: {
      id: 'cat-dehydrated-powders',
      name: 'Dehydrated Veg & Fruit Powders',
      slug: 'dehydrated-powders',
    },
    product_images: [
      { id: 'img-rd-1', image_url: SPICE_ASSETS.radishPowder, sort_order: 1 },
    ],
    product_variants: [
      { id: 'var-rd-100', variant_name: '100g Pouch', price: 90, original_price: 120, stock_quantity: 90, is_active: true },
      { id: 'var-rd-250', variant_name: '250g Pouch', price: 199, original_price: 255, stock_quantity: 60, is_active: true },
      { id: 'var-rd-500', variant_name: '500g Value Pack', price: 375, original_price: 475, stock_quantity: 35, is_active: true },
    ],
    product_information: [
      { id: 'info-rd-1', label: 'Ingredients', value: '100% Pure Dehydrated White Radish (Raphanus sativus)', display_order: 1 },
      { id: 'info-rd-2', label: 'Ideal Uses', value: 'Mooli Paratha Stuffing, Soups, Detox Drinks & Savory Mixes', display_order: 2 },
      { id: 'info-rd-3', label: 'Shelf Life', value: '12 Months from Packaging Date', display_order: 3 },
    ],
    product_faqs: [],
  },
}

// Helper to resolve legacy slugs gracefully
export function getFallbackProductBySlug(slug: string): FallbackProduct | undefined {
  if (FALLBACK_PRODUCTS[slug]) return FALLBACK_PRODUCTS[slug]
  const aliasMap: Record<string, string> = {
    'red-chilly-powder': 'red-chilli-powder',
    'cumin-powder': 'zeera-powder',
    'garam-masala': 'shahi-garam-masala',
  }
  const mapped = aliasMap[slug]
  return mapped ? FALLBACK_PRODUCTS[mapped] : undefined
}
