import { buildPageMetadata } from '@/lib/seo'

export const generateMetadata = () => buildPageMetadata('/login')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
