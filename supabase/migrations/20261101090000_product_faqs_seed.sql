-- Starter product-specific FAQs (5 per product), shown on each product page under "FAQs & Care".
-- Safe to re-run: a product that already has FAQs is left untouched, so admin edits are never overwritten.
-- Product pages now show a product's own FAQs first; "Use Global FAQs" only appends the store-wide ones after them.
-- Global FAQs are shown on the homepage, so existing products are switched to "own FAQs only".

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
