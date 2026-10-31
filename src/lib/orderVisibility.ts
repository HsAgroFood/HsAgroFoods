// An online order is created BEFORE the Razorpay window opens. If the customer closes the
// window (or the payment fails) it stays unpaid, and it must not appear as a real order in
// the admin, in revenue, or in the customer's order list. COD orders are always real; online
// orders count once paid (or refunded). A late webhook flips an abandoned order to "paid",
// at which point it appears on its own.
//
// PostgREST `or` filter for supabase-js: `query.or(REAL_ORDER_FILTER)`
export const REAL_ORDER_FILTER =
  'payment_method.ilike.*cash on delivery*,payment_status.in.(paid,refunded)'

// Admin screens do NOT use this filter: the admin sees every order, with unpaid / failed online orders
// tagged (see paymentTag). Revenue, counts and the customer's own order list use REAL_ORDER_FILTER.
