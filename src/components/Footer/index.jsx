'use client';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-12/12 !mx-auto">
      <div className="footer_top flex justify-between flex-wrap gap-4 mb-4 lg:mb-0">
        <div className="footer_top_icon text-center flex-1 min-w-[180px]">
          <img src="/image/icon/icon_footer_1.svg" alt="" width="100px" />
          <p className="mt-2">Thanh toán khi nhận hàng</p>
        </div>
        <div className="footer_top_icon text-center flex-1 !min-w-[180px]">
          <img src="/image/icon/icon_footer_2.svg" alt="" width="130px" />
          <p className="mt-2">Giao hàng nhanh miễn phí</p>
        </div>
        <div className="footer_top_icon text-center flex-1 min-w-[180px]">
          <img src="/image/icon/icon_footer_3_200x200.png" alt="" width="100px" />
          <p className="mt-2">30 ngày đổi trả miễn phí</p>
        </div>
        <div className="footer_top_icon text-center flex-1 min-w-[180px]">
          <img src="/image/icon/icon_footer_4.svg" alt="" width="100px" />
          <p className="mt-2">Thương hiệu uy tín toàn cầu</p>
        </div>
      </div>

      <div className="footer_bottom">
        <div className="w-6/12 !mx-auto flex flex-wrap gap-4 justify-between">
          <div className="w-full sm:w-[30%]">
            <ul className="menu_footer space-y-2">
              <li><Link href="#" className="hover:underline">Về Bloom</Link></li>
              <li><Link href="#">Giới thiệu Bloom</Link></li>
              <li><Link href="#">Tuyển Dụng</Link></li>
              <li><Link href="#">Chính sách bảo mật</Link></li>
              <li><Link href="#">Liên hệ</Link></li>
            </ul>
          </div>

          <div className="w-full sm:w-[30%]">
            <ul className="menu_footer space-y-2">
              <li><Link href="#" className="hover:underline">Hỗ trợ khách hàng</Link></li>
              <li><Link href="#">Hướng dẫn mua hàng</Link></li>
              <li><Link href="#">Thanh toán & vận chuyển</Link></li>
              <li><Link href="#">Đổi trả & bảo hành</Link></li>
              <li><Link href="#">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          <div className="w-full sm:w-[30%]">
            <ul className="menu_footer space-y-2">
              <li><Link href="#">Đồng hồ nam</Link></li>
              <li><Link href="#">Đồng hồ nữ</Link></li>
              <li><Link href="#">Đồng hồ cặp đôi</Link></li>
              <li><Link href="#">Phụ kiện đồng hồ</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
