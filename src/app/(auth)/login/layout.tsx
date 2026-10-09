import { buildPageMetadata } from '@/lib/seo'

export const generateMetadata = () => buildPageMetadata('/login', { page: 'login', noindex: true })

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
