import { buildPageMetadata } from '@/lib/seo'

export const generateMetadata = () => buildPageMetadata('/cadastro', { page: 'cadastro' })

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
