'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import ProductCard from '../../../components/CardProduct';

const slidesData = {
  slider2: [
    "/image/category/1bdca5d0dd3ce9c02ee514d9039b07bc.jpg",
    "/image/category/2d1728b12060798c1236ddc0da830393.jpg",
    "/image/category/d47b82ec6b0ad4b045d7de38bf0e9c9b.jpg",
    "/image/category/0077c108e69ea8461cd43f9c40005ceb.jpg",
    "/image/category/34547b7a64a3b8f95b2bd7cdf9f234e4.jpg",
  ],
};

const products = [
  {
    name: "Patek Philippe",
    description: "Đồng hồ nam Patek Philippe Nautilus Automatic",
    image1: "/image/main/slide1.webp",
    image2: "/image/main/slide2.webp",
    originalPrice: "25.566.000",
    salePrice: "22.257.000",
    discountPercent: "-12%",
    onSale: true,
  },
  {
    name: "Rolex Submariner",
    description: "Đồng hồ nam Rolex Submariner Date Oystersteel",
    image1: "/image/main/slide1.webp",
    image2: "/image/main/slide2.webp",
    originalPrice: "30.000.000",
    salePrice: "27.500.000",
    discountPercent: "-8%",
    onSale: true,
  },
  {
    name: "Omega Seamaster",
    description: "Đồng hồ Omega Seamaster Diver 300M",
    image1: "/image/main/slide1.webp",
    image2: "/image/main/slide2.webp",
    originalPrice: "22.000.000",
    salePrice: "22.000.000",
    discountPercent: "",
    onSale: false,
  },
  {
    name: "Tissot Le Locle",
    description: "Đồng hồ Thụy Sĩ cổ điển Tissot Le Locle Powermatic 80",
    image1: "/image/main/slide1.webp",
    image2: "/image/main/slide2.webp",
    originalPrice: "14.900.000",
    salePrice: "12.500.000",
    discountPercent: "-16%",
    onSale: true,
  },
  {
    name: "Longines HydroConquest",
    description: "Đồng hồ thể thao Longines HydroConquest",
    image1: "/image/main/slide1.webp",
    image2: "/image/main/slide2.webp",
    originalPrice: "28.000.000",
    salePrice: "24.900.000",
    discountPercent: "-11%",
    onSale: true,
  },
  {
    name: "Seiko Presage",
    description: "Đồng hồ Nhật Seiko Presage Cocktail Time",
    image1: "/image/main/slide1.webp",
    image2: "/image/main/slide2.webp",
    originalPrice: "12.000.000",
    salePrice: "10.800.000",
    discountPercent: "-10%",
    onSale: true,
  },
  {
    name: "Casio G-Shock",
    description: "Đồng hồ thể thao bền bỉ Casio G-Shock GA-2100",
    image1: "/image/main/slide1.webp",
    image2: "/image/main/slide2.webp",
    originalPrice: "4.000.000",
    salePrice: "3.200.000",
    discountPercent: "-20%",
    onSale: true,
  },
  {
    name: "Citizen Eco-Drive",
    description: "Đồng hồ năng lượng ánh sáng Citizen Eco-Drive",
    image1: "/image/main/slide1.webp",
    image2: "/image/main/slide2.webp",
    originalPrice: "5.000.000",
    salePrice: "5.000.000",
    discountPercent: "",
    onSale: false,
  },
  {
    name: "Orient Bambino",
    description: "Đồng hồ cơ cổ điển Orient Bambino Gen 2",
    image1: "/image/main/slide1.webp",
    image2: "/image/main/slide2.webp",
    originalPrice: "6.000.000",
    salePrice: "5.200.000",
    discountPercent: "-13%",
    onSale: true,
  },
  {
    name: "Daniel Wellington Classic",
    description: "Đồng hồ tối giản Daniel Wellington Classic Sheffield",
    image1: "/image/main/slide1.webp",
    image2: "/image/main/slide2.webp",
    originalPrice: "4.500.000",
    salePrice: "4.050.000",
    discountPercent: "-10%",
    onSale: true,
  }
];

const categories = [
  { id: 1, name: "Omega", image: "https://via.placeholder.com/200x200?text=Omega" },
  { id: 2, name: "Rolex", image: "https://via.placeholder.com/200x200?text=Rolex" },
  { id: 3, name: "Casio", image: "https://via.placeholder.com/200x200?text=Casio" },
  { id: 4, name: "Seiko", image: "https://via.placeholder.com/200x200?text=Seiko" },
  { id: 5, name: "Citizen", image: "https://via.placeholder.com/200x200?text=Citizen" },
  { id: 6, name: "Timex", image: "https://via.placeholder.com/200x200?text=Timex" },
  { id: 7, name: "Orient", image: "https://via.placeholder.com/200x200?text=Orient" },
  { id: 8, name: "Fossil", image: "https://via.placeholder.com/200x200?text=Fossil" },
  { id: 9, name: "Michael dwsafweadfwerf", image: "https://via.placeholder.com/200x200?text=M.Kors" },
  { id: 10, name: "Tissot", image: "https://via.placeholder.com/200x200?text=Tissot" },
  { id: 11, name: "Swatch", image: "https://via.placeholder.com/200x200?text=Swatch" },
  { id: 12, name: "Bulova", image: "https://via.placeholder.com/200x200?text=Bulova" },
  { id: 13, name: "Longines", image: "https://via.placeholder.com/200x200?text=Longines" },
  { id: 14, name: "Hamilton", image: "https://via.placeholder.com/200x200?text=Hamilton" },
  { id: 15, name: "Invicta", image: "https://via.placeholder.com/200x200?text=Invicta" },
  { id: 16, name: "Tag Heuer", image: "https://via.placeholder.com/200x200?text=Tag+Heuer" }
];


function Home() {
  const [currentIndex1, setCurrentIndex1] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);


  useEffect(() => {
    const interval2 = setInterval(() => {
      setCurrentIndex2((prev) => (prev + 1) % slidesData.slider2.length);
    }, 2000);
    return () => clearInterval(interval2);
  }, []);

  const nextSlide2 = () => {
    setCurrentIndex2((prev) => (prev + 1) % slidesData.slider2.length);
  };
  const prevSlide2 = () => {
    setCurrentIndex2((prev) => (prev - 1 + slidesData.slider2.length) % slidesData.slider2.length);
  };

  function chunkArray(array, size) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  }

  //================[ SLIDER BANNER 1]========================
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    { id: 1, image: '/image/main/slide1.webp', alt: 'Đồng hồ 1' },
    { id: 2, image: '/image/main/slide2.webp', alt: 'Đồng hồ 2' },
    { id: 3, image: '/image/main/slide3.webp', alt: 'Đồng hồ 3' },
    { id: 4, image: '/image/main/slide4.webp', alt: 'Đồng hồ 4' }
  ];

  useEffect(() => {
    console.log('Slides in useEffect:', slides);
    if (!Array.isArray(slides) || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSlideChange = (newIndex) => {
    if (isTransitioning || !slides.length) return;

    setIsTransitioning(true);
    setCurrentSlide(newIndex);

    const timeoutId = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleThumbnailClick = (index) => {
    handleSlideChange(index);
  };


  return (
    <>
      <section className="section_one !py-13 bg-[#1f1f1f] relative overflow-hidden">
        <div className="!w-10/12 !mx-auto text-white flex items-center justify-between md:px-20">
          <div className="w-full md:w-1/2 space-y-6">
            <div className="text-sm text-orange-700 tracking-widest uppercase">Bộ Sưu Tập</div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
              ĐỒNG HỒ WATCHES.<br />
              KHẲNG ĐỊNH PHONG CÁCH. LUÔN ĐÚNG GIỜ.
            </h1>
            <p className="text-base text-gray-300 max-w-md">
              Khám phá những thiết kế tinh xảo, kết hợp giữa nghệ thuật chế tác truyền thống và công nghệ hiện đại – dành riêng cho những ai trân trọng từng khoảnh khắc.
            </p>
            <button className="!mt-6 !p-2 inline-flex items-center gap-2 text-orange-700 border border-orange-700 px-6 py-2 rounded hover:bg-orange-700 hover:text-black transition duration-300 font-medium tracking-wide">
              Xem Bộ Sưu Tập
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 0 1 .7.3l5 5a1 1 0 0 1-1.4 1.4L11 6.42V17a1 1 0 1 1-2 0V6.41L5.7 9.7a1 1 0 0 1-1.4-1.4l5-5A1 1 0 0 1 10 3z" />
              </svg>
            </button>
          </div>

          <div
            className="section_one_right !mr-[10%] !h-[500px] flex justify-center items-center relative bg-cover bg-center"
            style={{
              backgroundImage: "url('/image/main/bg-banner.png')",
              backgroundSize: "80%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center"
            }}
          >
            <div className="relative w-[300px] h-[400px] overflow-hidden">
              {slides.map((slide, index) => (
                <img
                  key={slide.id}
                  src={slide.image}
                  alt={slide.alt}
                  className={`absolute inset-0 max-h-[400px] max-w-[300px] object-contain z-10 transition-all duration-500 ease-in-out transform ${index === currentSlide
                    ? 'opacity-100 scale-100 translate-x-0'
                    : index < currentSlide
                      ? 'opacity-0 scale-95 -translate-x-full'
                      : 'opacity-0 scale-95 translate-x-full'
                    }`}
                />
              ))}
            </div>

            <div className={`absolute inset-0 rounded-full bg-gradient-radial from-orange-700/20 to-transparent blur-xl transition-opacity duration-500 ${isTransitioning ? 'opacity-100' : 'opacity-50'
              }`}></div>
          </div>

          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 flex flex-col items-center gap-6 text-sm z-20">
            <button
              className="hover:text-white transition transform hover:scale-110"
              onClick={() => handleSlideChange((currentSlide - 1 + slides.length) % slides.length)}
            >
              &#9650;
            </button>
            <div className="rotate-90 text-xs tracking-widest text-orange-700">
              {String(currentSlide + 1).padStart(2, '0')}
            </div>
            <div className="rotate-90 text-xs tracking-widest text-gray-600">
              {String(slides.length).padStart(2, '0')}
            </div>
            <button
              className="hover:text-white transition transform hover:scale-110"
              onClick={() => handleSlideChange((currentSlide + 1) % slides.length)}
            >
              &#9660;
            </button>
          </div>

          <div className="absolute right-5 top-1/2 transform -translate-y-1/2 flex flex-col gap-3">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`relative cursor-pointer transition-all duration-300 transform hover:scale-110 ${index === currentSlide
                  ? 'ring-2 ring-orange-700 ring-opacity-80 scale-105'
                  : 'hover:ring-2 hover:ring-white hover:ring-opacity-50'
                  }`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={slide.image}
                  alt={`Thumbnail ${index + 1}`}
                  className={`max-w-[70px] h-[70px] object-cover rounded-lg transition-all duration-300 ${index === currentSlide
                    ? 'opacity-100 brightness-110'
                    : 'opacity-60 hover:opacity-100'
                    }`}
                />

                {index === currentSlide && (
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-orange-700 rounded-full animate-pulse"></div>
                )}

                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-orange-700/20 to-transparent opacity-0 transition-opacity duration-300 ${index === currentSlide ? 'opacity-30' : 'hover:opacity-20'
                  }`}></div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-10 left-1/2  transform -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide
                  ? 'w-8 bg-orange-700'
                  : 'w-4 bg-gray-600 hover:bg-gray-400'
                  }`}
                onClick={() => handleThumbnailClick(index)}
              ></div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 !right-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-700/5 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-orange-700/3 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-orange-700/4 rounded-full animate-pulse delay-500"></div>
        </div>
        <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(-100px) scale(0.9);
          }
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
      </section>


      <main className=" !mx-auto">
        <div className="flash !border-0 !bg-gray-300">
          <div className="box_title flex items-center text-center justify-center !p-3">
            <h3 className='text-3xl font-bold !text-[#1F2438]'>Khuyến Mãi Đặc Biệt</h3>
            {/* <Link href="">Xem tất cả</Link> */}
          </div>

          <div className="flash_box !pt-2 w-11/12">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={10}
              slidesPerView={5}
              autoplay={{
                delay: 500000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              className="product-swiper"
            >
              {products.map((product, index) => (
                <SwiperSlide key={index} className="px-2 hover:border-1 hover:shadow rounded-[10px] bg-white  " >
                  <ProductCard product={product} className="" />
                </SwiperSlide>
              ))}
            </Swiper>


          </div>
        </div>

        <section className="flex w-10/12 !mx-auto !py-7 gap-2">
          <div className="w-1/3 !rounded-3 img-box">
            <img className="!rounded-3" height="100%" src="/image/main/Men's watch.jpg" alt="" width="100%" />
          </div>
          <div className="w-1/3 !rounded-3 img-box">
            <img className="!rounded-3" height="100%" src="/image/main/shower-gel-bottle-template-for-ads-or-magazine-background-3d-realistic-iillustration-free-vector.jpg" alt="" width="100%" />
          </div>
          <div className="w-1/3 !rounded-3 img-box">
            <img className="!rounded-3" height="100%" src="/image/main/3d-realistic-perfume-bottle-concept_313044-65.jpg" alt="" width="100%" />
          </div>
        </section>

        <section className="brand !w-10/12 !mx-auto">
          <div className="box_title flex items-center justify-between">
            <h3 className='text-3xl'>Thương hiệu</h3>
            {/* <Link href="">Xem tất cả</Link> */}
          </div>
          <div className="flex box_category justify-center items-center">
            <div className="w-1/3 box_category_left">
              <div className="slide_banner" id="slider2">
                <img className="slide-image p-1" src={slidesData.slider2[currentIndex2]} alt="" width="100%" height="100%" />
                <div className="btn_slide flex p-2 justify-between">
                  <button onClick={prevSlide2} className="material-symbols-outlined">
                    <ArrowBackIosIcon />
                  </button>
                  <button onClick={nextSlide2} className="material-symbols-outlined">
                    <ArrowForwardIosIcon />
                  </button>
                </div>    
              </div>                           
            </div>
         
            <div className="w-2/3 box_category_right !px-2">
              <Swiper
                modules={[Navigation, Autoplay, Mousewheel]}
                spaceBetween={16}
                slidesPerView={1}          
                navigation={{
                  nextEl: '.btn-rightBrand',
                  prevEl: '.btn-leftBrand',
                }}
                // mousewheel={{ forceToAxis: true, sensitivity: 0.5 }}
                autoplay={{
                  delay: 5000,                                             
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={true}
                grabCursor={true}
                speed={600}
                className="w-full"
              >
                {chunkArray(categories, 8).map((group, idx) => (
                  <SwiperSlide key={idx} className="!w-full">
                    <div className="flex flex-col gap-4">

                      <ul className="category-list flex flex-nowrap gap-2">
                        {group
                          .filter((_, index) => index % 2 === 0)
                          .map((brand, index) => (
                            <li key={`even-${idx}-${index}`} className="min-w-[25%]">
                              <div className="card_category">
                                <Link href="#">
                                  <img
                                    src={brand.image}
                                    alt={brand.name}
                                    className="w-full h-[14rem] object-cover"
                                    loading="lazy"
                                  />
                                  <div className="name_brand">
                                    <h2 className='!w-[max-content] '>{brand.name}</h2>
                                  </div>
                                </Link>
                              </div>
                            </li>
                          ))}
                      </ul>

                      <ul className="category-list flex flex-nowrap gap-2">
                        {group
                          .filter((_, index) => index % 2 !== 0)
                          .map((brand, index) => (
                            <li key={`odd-${idx}-${index}`} className="min-w-[25%]">
                              <div className="card_category">
                                <Link href="#">
                                  <img
                                    src={brand.image}
                                    alt={brand.name}
                                    className="w-full h-[14rem] object-cover"
                                    loading="lazy"
                                  />
                                  <div className="name_brand">
                                    <h2 className='!w-[max-content] '>{brand.name}</h2>
                                  </div>
                                </Link>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* 
              <div className="box_btn_category">
                <button
                  className="btn-leftBrand custom-btn"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="material-symbols-outlined">
                    <ArrowBackIosIcon />
                  </span>
                </button>
                <button
                  className="btn-rightBrand custom-btn"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="material-symbols-outlined">
                    <ArrowForwardIosIcon />
                  </span>
                </button>
              </div> */}
            </div>
          </div>
        </section>

        <section className="all_product !w-10/12 !mx-auto">
          <div className="box_title flex items-center justify-between !py-3">
            <h3 className='text-3xl '>Sản phẩm</h3>
            <Link href="">Xem tất cả</Link>
          </div>

          <div className="flex flex-wrap w-full box_card">

            {products.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>

          <div className="title_all_product">
            <Link href="" className='!text-white'>Xem thêm</Link>
          </div>
        </section>
      </main>
    </>
  );
}





export default Home;