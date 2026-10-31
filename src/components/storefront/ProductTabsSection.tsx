"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Leaf,
  ShieldCheck,
  Award,
  ChevronDown,
  Star,
  MessageSquare,
  Package,
  Clock,
  Phone,
  CheckCircle2,
  Lock,
  FileText,
  HelpCircle,
  Sprout,
} from "lucide-react";
import { submitReview } from "@/actions/reviews";

type ProductTabsSectionProps = {
  productId: string;
  productName: string;
  description?: string | null;
  shortDescription?: string | null;
  specs: { id?: string; label: string; value: string }[];
  faqs: { id: string; question: string; answer: string }[];
  reviews: {
    id: string;
    rating: number;
    review_text: string | null;
    created_at: string;
    user: { full_name: string } | null;
  }[];
  isAuthenticated: boolean;
  averageRating?: number;
};

export function ProductTabsSection({
  productId,
  productName,
  description,
  shortDescription,
  specs = [],
  faqs = [],
  reviews = [],
  isAuthenticated,
  averageRating = 0,
}: ProductTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<
    "about" | "specs" | "faqs" | "reviews"
  >("about");

  const calculatedRating =
    reviews.length > 0
      ? averageRating > 0
        ? averageRating
        : reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;
  const roundedStars = Math.min(5, Math.max(1, Math.round(calculatedRating)));

  // Review Form state
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // FAQ Accordion state
  const [openFaqId, setOpenFaqId] = useState<string | null>(
    faqs.length > 0 ? faqs[0].id : null,
  );

  useEffect(() => {
    const handleHash = () => {
      if (
        typeof window !== "undefined" &&
        window.location.hash === "#reviews"
      ) {
        setActiveTab("reviews");
        setWriteReviewOpen(true);
        const el = document.getElementById("reviews");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleReviewSubmit = async (formData: FormData) => {
    setIsSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);

    formData.append("product_id", productId);
    formData.append("rating", reviewRating.toString());

    const result = await submitReview({}, formData);
    if (result.error) {
      setReviewError(result.error);
    } else {
      setReviewSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
    setIsSubmittingReview(false);
  };

  // Standard verified spice specifications
  const defaultSpecs = [
    { label: "Dietary Preference", value: "100% Vegetarian & Vegan Pure" },
    {
      label: "Processing Method",
      value: "Low-Temp Dehydrated / Cold Stone-Ground",
    },
    {
      label: "Preservatives & Additives",
      value: "Zero Artificial Color, Zero Starch, No Fillers",
    },
    { label: "Shelf Life", value: "12 Months from Packaging Date" },
    {
      label: "Storage Instructions",
      value: "Store in an airtight container in a cool, dry place",
    },
    {
      label: "Quality Certification",
      value: "FSSAI Certified & Quality Batch Tested",
    },
  ];

  const displaySpecs =
    specs.length > 0
      ? specs.map((s: any) => ({
          id: s.id,
          label: s.label || s.title || "Specification",
          value: s.value || s.content || "",
        }))
      : defaultSpecs;

  return (
    <div
      id="reviews"
      className="mt-10 sm:mt-16 bg-white rounded-[5px] border border-[#EDE4D9] shadow-sm overflow-hidden scroll-mt-24"
    >
      {/* ─── Tab Navigation Bar (Exact Reference Image Pill Styling) ─── */}
      <div className="border-b border-[#EDE4D9] bg-[#FAF7F2] px-3 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2.5 sm:py-3.5">
          {/* About & Origin */}
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-[5px] text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "about"
                ? "bg-[#E07B0C] text-white shadow-xs"
                : "text-[#6E5951] hover:text-[#14361F] hover:bg-white/80"
            }`}
          >
            <Leaf className="w-4 h-4 fill-current/20" />
            <span>About &amp; Origin</span>
          </button>

          {/* Specifications */}
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-[5px] text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "specs"
                ? "bg-[#E07B0C] text-white shadow-xs"
                : "text-[#6E5951] hover:text-[#14361F] hover:bg-white/80"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Specifications</span>
          </button>

          {/* FAQs & Care */}
          <button
            type="button"
            onClick={() => setActiveTab("faqs")}
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-[5px] text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "faqs"
                ? "bg-[#E07B0C] text-white shadow-xs"
                : "text-[#6E5951] hover:text-[#14361F] hover:bg-white/80"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQs &amp; Care</span>
          </button>

          {/* Customer Reviews */}
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-[5px] text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "reviews"
                ? "bg-[#E07B0C] text-white shadow-xs"
                : "text-[#6E5951] hover:text-[#14361F] hover:bg-white/80"
            }`}
          >
            <Star className="w-4 h-4 fill-current/20" />
            <span>Customer Reviews ({reviews.length})</span>
          </button>
        </div>
      </div>

      {/* ─── Tab 1: About & Origin (Exact Reference Image 2-Column Layout) ─── */}
      {activeTab === "about" && (
        <div className="p-6 sm:p-8 lg:p-10 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Product Story & Pure Tradition Callout */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#14361F]">
                The Story of{" "}
                <span className="text-[#E07B0C]">{productName}</span>
              </h3>

              <div className="text-xs sm:text-sm lg:text-[15px] text-[#5A433B] leading-relaxed space-y-3 whitespace-pre-wrap font-normal">
                {description ||
                  shortDescription ||
                  `${productName} is our signature culinary masterpiece. Handcrafted from an authentic royal recipe using carefully hand-sorted whole spices. Every spice is individually sun-dried and cold-ground so that just a pinch transforms any dish into a royal feast.`}
              </div>

              {/* Pure Tradition Highlight Callout Banner */}
              <div className="p-4 sm:p-5 rounded-[5px] bg-[#FFF8F2] border border-[#F09819]/35 text-[#8A5A12] text-xs sm:text-sm font-medium flex items-start gap-3.5 mt-5 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#EAF5ED] text-[#227B44] flex items-center justify-center shrink-0 mt-0.5">
                  <Leaf className="w-4 h-4 fill-[#227B44]/20" />
                </div>
                <p className="leading-relaxed text-[#6B4B28]">
                  <strong className="text-[#D96B1C] font-extrabold">
                    Pure Tradition:
                  </strong>{" "}
                  Unlike commercial high-heat processing which destroys natural
                  nutrients and aromas, HS AgroFoods uses gentle low-temperature
                  dehydration and cold-grinding for intense natural flavor and
                  long-lasting freshness.
                </p>
              </div>
            </div>

            {/* Right Column: 4 Content-Driven Icon Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Card 1: Gentle Process */}
              <div className="bg-[#FAF7F2] rounded-[5px] border border-[#EDE4D9] p-3 sm:p-3.5 text-center flex flex-col items-center justify-center shadow-2xs group hover:shadow-xs hover:border-[#E07B0C]/40 hover:bg-white transition-all">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[5px] bg-[#FFF4E6] border border-[#E07B0C]/25 flex items-center justify-center text-[#E07B0C] mb-2 sm:mb-2.5 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="block text-[11px] sm:text-xs font-bold text-[#14361F] leading-tight">
                  Gentle Process
                </span>
                <span className="block text-[9.5px] sm:text-[10px] text-[#7A6458] mt-1 leading-tight">
                  Nutrients &amp; Oils Retained
                </span>
              </div>

              {/* Card 2: 100% Pure */}
              <div className="bg-[#FAF7F2] rounded-[5px] border border-[#EDE4D9] p-3 sm:p-3.5 text-center flex flex-col items-center justify-center shadow-2xs group hover:shadow-xs hover:border-[#227B44]/40 hover:bg-white transition-all">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[5px] bg-[#EAF5ED] border border-[#227B44]/25 flex items-center justify-center text-[#227B44] mb-2 sm:mb-2.5 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 fill-[#227B44]/20" />
                </div>
                <span className="block text-[11px] sm:text-xs font-bold text-[#14361F] leading-tight">
                  100% Pure
                </span>
                <span className="block text-[9.5px] sm:text-[10px] text-[#7A6458] mt-1 leading-tight">
                  Zero Artificial Colors
                </span>
              </div>

              {/* Card 3: Farm Origin */}
              <div className="bg-[#FAF7F2] rounded-[5px] border border-[#EDE4D9] p-3 sm:p-3.5 text-center flex flex-col items-center justify-center shadow-2xs group hover:shadow-xs hover:border-[#D97706]/40 hover:bg-white transition-all">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[5px] bg-[#FAF3EB] border border-[#D97706]/25 flex items-center justify-center text-[#D97706] mb-2 sm:mb-2.5 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="block text-[11px] sm:text-xs font-bold text-[#14361F] leading-tight">
                  Farm Origin
                </span>
                <span className="block text-[9.5px] sm:text-[10px] text-[#7A6458] mt-1 leading-tight">
                  Hand-Sorted Batches
                </span>
              </div>

              {/* Card 4: FSSAI Tested */}
              <div className="bg-[#FAF7F2] rounded-[5px] border border-[#EDE4D9] p-3 sm:p-3.5 text-center flex flex-col items-center justify-center shadow-2xs group hover:shadow-xs hover:border-[#B87024]/40 hover:bg-white transition-all">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[5px] bg-[#FAF3E8] border border-[#B87024]/25 flex items-center justify-center text-[#B87024] mb-2 sm:mb-2.5 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="block text-[11px] sm:text-xs font-bold text-[#14361F] leading-tight">
                  FSSAI Tested
                </span>
                <span className="block text-[9.5px] sm:text-[10px] text-[#7A6458] mt-1 leading-tight">
                  Safety Guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab 2: Specifications ─────────────────────────────────────────── */}
      {activeTab === "specs" && (
        <div className="p-6 sm:p-8 lg:p-10 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#14361F]">
              Product Specifications &amp; Quality
            </h3>
            <span className="text-xs text-[#E07B0C] font-semibold bg-[#FAF3EB] px-3 py-1 rounded-[5px] border border-[#F09819]/30">
              Verified Batch Standards
            </span>
          </div>

          <div className="overflow-hidden bg-white border border-[#EDE4D9] rounded-[5px] shadow-xs">
            <table className="min-w-full divide-y divide-[#EDE4D9]">
              <tbody className="divide-y divide-[#EDE4D9]">
                {displaySpecs.map((spec, index) => (
                  <tr
                    key={spec.label || index}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#FAF7F2]"}
                  >
                    <td className="py-3.5 pl-4 sm:pl-6 pr-3 text-xs sm:text-sm font-bold text-[#14361F] w-2/5 sm:w-1/3 border-r border-[#EDE4D9]">
                      {spec.label}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-xs sm:text-sm text-[#5A433B] font-medium whitespace-pre-wrap">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Tab 3: FAQs & Care ────────────────────────────────────────────── */}
      {activeTab === "faqs" && (
        <div className="p-6 sm:p-8 lg:p-10 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#14361F]">
                Frequently Asked Questions
              </h3>
              <p className="text-xs sm:text-sm text-[#6E5951] mt-0.5">
                Everything you need to know about this spice, cooking usage,
                shelf life, and storage.
              </p>
            </div>
          </div>

          {faqs.length > 0 ? (
            <div className="space-y-3">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-[#EDE4D9] rounded-[5px] overflow-hidden bg-white shadow-xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left group cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold text-[#14361F] group-hover:text-[#E07B0C] transition-colors pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#8C766E] transition-transform duration-200 shrink-0 ${
                          isOpen ? "rotate-180 text-[#E07B0C]" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-[#5A433B] leading-relaxed border-t border-[#EDE4D9]/60 pt-3 whitespace-pre-line bg-[#FAF7F2]/60">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EDE4D9] text-center space-y-3">
              <Package className="w-8 h-8 text-[#8C766E] mx-auto" />
              <p className="text-sm font-semibold text-[#14361F]">
                Have questions about {productName}?
              </p>
              <p className="text-xs text-[#6E5951] max-w-md mx-auto">
                Speak directly with our spice master team on WhatsApp for
                cooking tips, bulk supply, or doorstep delivery queries.
              </p>
              <a
                href={`https://wa.me/919540048786?text=${encodeURIComponent(
                  `Hi HS AgroFoods, I have a query about ${productName}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow-xs transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                Ask on WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab 4: Customer Reviews ───────────────────────────────────────── */}
      {activeTab === "reviews" && (
        <div className="p-6 sm:p-8 lg:p-10 space-y-8 animate-in fade-in duration-200">
          {/* Rating Summary Header */}
          <div className="p-5 sm:p-6 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-[5px] bg-white border border-[#EDE4D9] flex flex-col items-center justify-center shadow-xs">
                <span className="text-2xl font-black text-[#E07B0C]">
                  {reviews.length > 0 ? calculatedRating.toFixed(1) : "5.0"}
                </span>
                <span className="text-[10px] font-bold text-amber-600 flex items-center tracking-widest">
                  {reviews.length > 0
                    ? "★".repeat(roundedStars) + "☆".repeat(5 - roundedStars)
                    : "★★★★★"}
                </span>
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-[#14361F]">
                  Customer Reviews &amp; Ratings
                </h4>
                <p className="text-xs text-[#6E5951] mt-0.5">
                  {reviews.length > 0
                    ? `Based on ${reviews.length} verified customer ${
                        reviews.length === 1 ? "review" : "reviews"
                      }`
                    : "Be the first to review this pure spice product!"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWriteReviewOpen(!writeReviewOpen)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[5px] bg-[#E07B0C] text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#C86A08] transition-all cursor-pointer"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>
                {writeReviewOpen ? "Close Review Form" : "Write a Review"}
              </span>
            </button>
          </div>

          {/* Write Review Form */}
          {writeReviewOpen && (
            <div className="p-6 rounded-[5px] bg-white border-2 border-[#E07B0C]/40 shadow-sm animate-in fade-in duration-200">
              <h4 className="font-serif text-lg font-bold text-[#14361F] mb-4">
                Share Your Experience with {productName}
              </h4>

              {reviewSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Thank you! Your review has been submitted for verification.
                  </span>
                </div>
              ) : (
                <form action={handleReviewSubmit} className="space-y-4">
                  {reviewError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                      {reviewError}
                    </div>
                  )}

                  {/* Star Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#14361F] uppercase tracking-wider mb-1.5">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReviewRating(s)}
                          onMouseEnter={() => setHoveredRating(s)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              s <= (hoveredRating || reviewRating)
                                ? "fill-amber-400 text-amber-500"
                                : "text-stone-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-[#E07B0C] ml-2">
                        {reviewRating} out of 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Review Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-[#14361F] uppercase tracking-wider mb-1.5">
                      Your Review
                    </label>
                    <textarea
                      name="review_text"
                      rows={4}
                      required
                      placeholder={`Tell us about the aroma, taste, color, or cooking experience with ${productName}...`}
                      className="w-full bg-[#FAF7F2] border border-[#EDE4D9] rounded-[5px] p-3 text-xs sm:text-sm text-[#14361F] placeholder-[#8C766E] focus:outline-none focus:border-[#E07B0C] focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[5px] bg-[#14361F] text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#E07B0C] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Existing Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EDE4D9] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#E07B0C]/15 text-[#E07B0C] font-bold text-xs flex items-center justify-center">
                        {(review.user?.full_name || "V")[0].toUpperCase()}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#14361F]">
                        {review.user?.full_name || "Verified Customer"}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8C766E]">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {"★".repeat(
                      Math.min(5, Math.max(1, Math.round(review.rating))),
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#5A433B] leading-relaxed">
                    {review.review_text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#8C766E] text-xs sm:text-sm">
              No reviews yet. Be the first to try this pure spice and write a
              review!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
