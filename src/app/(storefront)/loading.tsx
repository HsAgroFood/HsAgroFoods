import { PageLoadingSpinner } from '@/components/storefront/PageLoadingSpinner'

export default function StorefrontLoading() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-[#FAF7F2]">
      <PageLoadingSpinner />
    </div>
  )
}

