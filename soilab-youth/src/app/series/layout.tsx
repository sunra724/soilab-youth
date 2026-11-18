import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
export default function SeriesLayout({ children }: { children: React.ReactNode }) {
  return <><Header /><main id="series-main">{children}</main><Footer /></>;
}
