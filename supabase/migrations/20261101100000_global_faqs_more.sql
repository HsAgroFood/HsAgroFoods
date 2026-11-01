-- Five more store-wide FAQs for the homepage FAQ section (Admin > Global FAQs can edit or hide them).
-- Safe to re-run: a question that already exists is skipped.
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
