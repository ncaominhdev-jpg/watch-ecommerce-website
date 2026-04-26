'use client';
import Link from 'next/link';
import { FaShoppingCart } from 'react-icons/fa';
import HeaderAccount from '../HeaderAccount';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [keyword, setKeyword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('jwt-datt');
    if (!token) return;

    const fetchCart = () => {
      fetch(`/api/cart`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const count = data.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(count);
          }
        })
        .catch(console.error);
    };

    fetchCart();

    const interval = setInterval(fetchCart, 2000);
    return () => clearInterval(interval);
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`/tim-kiem?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  return (
    <header className="banner !pt-2">
      <div className="box_top_bottom">
        <div className="banner_top border border-gray-200 flex justify-center" />
        <div className="banner_bottom">
          <div className="menu flex items-center w-10/12 !mx-auto">
            <div className="flex items-center box w-1/2">
              <div className="logo w-32">
                <img src="/image/main/logolight.jpg" alt="logo" className="w-full" />
              </div>
              <form onSubmit={handleSearch} className="search !w-4/6 ml-4">
                <div className="relative">
                  <input
                    placeholder="Search sản phẩm, thương hiệu..."
                    id="input"
                    name="text"
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="input border !w-full border-gray-300 rounded-full !pl-4 !pr-10 !py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    aria-label="Tìm kiếm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 512 512">...</svg>
                  </button>
                </div>
              </form>
            </div>

            <div className="flex items-center box w-1/2 justify-end gap-6">
              <div className="account pt-3 relative">
                <HeaderAccount />
              </div>

              <Link href="/gio-hang" className="relative text-white hover:text-gray-300">
                <FaShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full !px-2 text-xs">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="banner_menu_main flex items-center bg-gray-100">
        <ul className="flex w-10/12 mx-auto gap-2 py-2 text-white font-medium">
          <li><Link href="/" className="!text-white">Trang chủ</Link></li>
          <li><Link href="/gioi-thieu" className="!text-white">Giới thiệu</Link></li>
          <li><Link href="/tin-tuc" className="!text-white">Tin Tức</Link></li>
          <li><Link href="/san-pham" className="!text-white">Sản phẩm</Link></li>
          <li><Link href="/lien-he" className="!text-white">Liên hệ</Link></li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
