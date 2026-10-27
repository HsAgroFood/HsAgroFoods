import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us — Our Purity Story & Farm-to-Kitchen Process',
  description:
    'Discover how HS AgroFoods crafts 100% pure cold-ground Indian spices and low-temperature dehydrated vegetable & fruit powders with zero artificial colors or fillers.',
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
