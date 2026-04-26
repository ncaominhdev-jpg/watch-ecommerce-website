import CookiesWrapper from '../components/CookiesWrapper';

export const metadata = {
  title: 'Shop Đồng Hồ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <CookiesWrapper>
          {children}
        </CookiesWrapper>
      </body>
    </html>
  );
}
