'use client';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../../components/CardProduct';
import { FaBars, FaUndo } from 'react-icons/fa';
import Pagination from '../../../components/Pagination';

const Product = () => {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialBrand = searchParams.get('brands');

  const [allProducts, setAllProducts] = useState([]); // ✅ giữ toàn bộ sản phẩm để tính số lượng
  const [products, setProducts] = useState([]);       // ✅ danh sách sản phẩm hiển thị theo filter
  const [categories, setCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const productsRef = useRef(null);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [counts, setCounts] = useState({ products: 0, categories: 0, brands: 0, orders: 0 });

  useEffect(() => {
    fetch("/api/count")
      .then((res) => res.json())
      .then((data) => setCounts(data));
  }, []);

  const stats = [
    { number: `${counts.products || 0}+`, name: 'Sản phẩm' },
    { number: `${counts.brands || 0}+`, name: 'Thương hiệu' },
    { number: `${counts.categories || 0}+`, name: 'Danh mục' },
    { number: `${counts.orders || 0}+`, name: 'Lượt mua' },
  ];


  useEffect(() => {
    if (initialCategory) setCategoryFilter(initialCategory);
    if (initialBrand) setBrandFilter(initialBrand);
  }, [initialCategory, initialBrand]);

  // Lấy tất cả sản phẩm để tính số lượng cho bộ lọc
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(error => console.error("Lỗi khi lấy tất cả sản phẩm:", error));
  }, []);

  // Lấy sản phẩm theo filter
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [categoryFilter, brandFilter, priceFilter]);

  function fetchProducts() {
    let url = '/api/products?';
    if (categoryFilter) url += `category=${categoryFilter}&`;
    if (brandFilter) url += `brand=${brandFilter}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setCurrentPage(1);
      })
      .catch(error => console.error("Lỗi khi lấy sản phẩm:", error));
  }

  function fetchCategories() {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(error => console.error("Lỗi khi lấy danh mục:", error));
  }

  const filteredProducts = products.filter((p) => {
    const matchStatus = p.status === true;
    const matchCategoryStatus = p.category?.status === true;
    const matchBrandStatus = p.brand?.status === true;
    const matchCategory = categoryFilter ? p.category?.slug === categoryFilter : true;
    const matchBrand = brandFilter ? p.brand?.slug === brandFilter : true;
    const matchPrice = (() => {
      if (!priceFilter) return true;
      const { min, max } = priceFilter;
      return p.product_variants?.some(v => v.price >= min && v.price <= max);
    })();

    return (
      matchStatus &&
      matchCategoryStatus &&
      matchBrandStatus &&
      matchCategory &&
      matchBrand &&
      matchPrice
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  function getPagination() {
    const pages = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  }

  function renderProductList() {
    if (currentProducts.length === 0) {
      return <p className="text-center text-gray-500 mt-8">Không tìm thấy sản phẩm phù hợp.</p>;
    }
    return currentProducts.map((product, index) => (
      <div className="product-list-item" key={index}>
        <ProductCard product={product} />
      </div>
    ));
  }

  // ✅ Đếm dựa trên allProducts, không phụ thuộc filter
  function getBrandCount(slug) {
    return allProducts.filter(
      (p) =>
        p.status === true &&
        p.brand?.status === true &&
        p.brand?.slug === slug
    ).length;
  }

  function getCategoryCount(slug) {
    return allProducts.filter(
      (p) =>
        p.status === true &&
        p.category?.status === true &&
        p.category?.slug === slug
    ).length;
  }

  function renderSidebar() {
    return (
      <aside className="filter-sidebar">
        <div className="filter-header">
          <h4 className="filter-title">Bộ lọc sản phẩm</h4>
          <button
            onClick={() => {
              setCategoryFilter('');
              setBrandFilter('');
              setPriceFilter('');
            }}
            className="filter-reset"
          >
            <FaUndo /> Đặt lại
          </button>
        </div>

        <div className="filter-group">
          <label className="filter-label">Danh mục</label>
          <div className="filter-options custom-scrollbar">
            {categories
              .filter(cat => cat.status === true)
              .map((category, index) => (
                <button
                  key={index}
                  onClick={() => setCategoryFilter(categoryFilter === category.slug ? '' : category.slug)}
                  className={`filter-option ${categoryFilter === category.slug ? 'active' : ''}`}
                >
                  {category.name}
                  <span className="filter-count">({getCategoryCount(category.slug)})</span>
                </button>
              ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Thương hiệu</label>
          <div className="filter-options custom-scrollbar">
            {[...new Set(allProducts.map((p) => p.brand?.slug))].filter(Boolean).map((slug, i) => {
              const brand = allProducts.find((p) => p.brand?.slug === slug)?.brand;
              if (!brand?.status) return null;
              return (
                <button
                  key={i}
                  onClick={() => setBrandFilter(brandFilter === slug ? '' : slug)}
                  className={`filter-option ${brandFilter === slug ? 'active' : ''}`}
                >
                  {brand.name}
                  <span className="filter-count">({getBrandCount(slug)})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Khoảng giá</label>
          <select
            className="filter-select"
            onChange={(e) => {
              const val = e.target.value;
              setPriceFilter(val ? JSON.parse(val) : '');
            }}
            value={priceFilter ? JSON.stringify(priceFilter) : ''}
          >
            <option value="">Tất cả mức giá</option>
            <option value='{"min":0,"max":1000000}'>Dưới 1 triệu</option>
            <option value='{"min":1000000,"max":3000000}'>Từ 1 - 3 triệu</option>
            <option value='{"min":3000000,"max":5000000}'>Từ 3 - 5 triệu</option>
            <option value='{"min":5000000,"max":7000000}'>Từ 5 - 7 triệu</option>
            <option value='{"min":7000000,"max":10000000}'>Từ 7 - 10 triệu</option>
            <option value='{"min":10000000,"max":15000000}'>Từ 10 - 15 triệu</option>
            <option value='{"min":15000000,"max":20000000}'>Từ 15 - 20 triệu</option>
            <option value='{"min":20000000,"max":30000000}'>Từ 20 - 30 triệu</option>
            <option value='{"min":30000000,"max":50000000}'>Từ 30 - 50 triệu</option>
            <option value='{"min":50000000,"max":999999999}'>Trên 50 triệu</option>
          </select>
        </div>
      </aside>
    );
  }

  return (
    <div>
      <section className="!bg-white shadow-[10px_10px_30px_#e8e8e8,-10px_-10px_30px_#ffffff]">
        <div className="w-10/12 !mx-auto flex">
          <div
            className="w-2/3 bg-no-repeat bg-bottom-right bg-white flex flex-col justify-center"
            style={{ backgroundImage: "url('/image/main/bg-bannerRight.png')", backgroundSize: "65%" }}>
            <div className="ml-[5%] space-y-4">
              <h1 className="text-5xl font-bold leading-tight w-2/3 text-black">
                KHÁM PHÁ <span className="text-orange-700 font-serif italic">Những Cỗ Máy Thời Gian Tinh Xảo</span><br />CHO MỌI KHOẢNH KHẮC
              </h1>
              <p className="text-gray-600 w-2/2">
                "Nơi phong cách gặp gỡ sự chính xác - <br /> khám phá bộ sưu tập đồng hồ của chúng tôi."
              </p>
              <button onClick={scrollToProducts} className="bg-orange-700 hover:bg-orange-800 text-white !mt-2 !pt-2 !px-6 !py-2 rounded shadow">
                Xem sản phẩm
              </button>
            </div>
          </div>
          <div className="w-1/3 relative bg-[#1f1f1f] shadow-[-10px_0_100px_0_rgba(0,0,0,0.5)] h-[32rem]">
            <img src="/image/main/slide1.webp" alt="Banner" className="absolute bottom-0 w-full h-auto drop-shadow-[15px_15px_20px_rgba(0,0,0,0.66)]" />
          </div>
        </div>
      </section>

      <section className="bg-orange-700 !py-6 ">
        <div className="container !mx-auto flex justify-between">
          {stats.map((stat, index) => (
            <div key={index} className="w-1/4 text-center">
              <p className="text-4xl font-semibold !text-white">{stat.number}</p>
              <p className="text-lg font-semibold !text-white">{stat.name}</p>
            </div>
          ))}
        </div>
      </section>

      <main className="product-layout">
        {renderSidebar()}
        <article className="product-content" ref={productsRef}>
          <nav className="product-nav">
            <div className="product-sort" onMouseEnter={() => setIsFilterOpen(true)} onMouseLeave={() => setIsFilterOpen(false)}>
              <FaBars size={24} />
              <div className={`product-sort-menu ${isFilterOpen ? 'show' : ''}`}>
                <Link href="#">A-Z</Link>
                <Link href="#">Z-A</Link>
              </div>
            </div>
          </nav>

          <div className="product-list gap-4">
            {renderProductList()}
          </div>

          {filteredProducts.length > 10 && (
            <div className="flex justify-center mt-6">
              <Pagination
                count={filteredProducts.length}
                itemsPerPage={productsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

        </article>
      </main>
    </div>
  );
};

export default Product;
