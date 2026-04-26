"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getProfitChartOptions } from "../../styles/admin/js/dashboard.js";
import { FaBox, FaMoneyBillWave, FaUserTie, FaUserCog, FaUser } from 'react-icons/fa';


const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

function Dashboard() {
  const [dataDash, setDataDash] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        setDataDash(data);
        console.log(data);
      } catch (err) {
        console.error("Lỗi fetch dashboard:", err);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-8 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body">
              <div className="d-sm-flex d-block align-items-center justify-content-between mb-9">
                <div className="mb-3 mb-sm-0">
                  <h5 className="card-title fw-semibold">Tổng Quan Doanh Thu</h5>
                </div>
       
              </div>
              {dataDash?.monthlyRevenue && (
                <Chart
                  options={getProfitChartOptions(dataDash.monthlyRevenue)}
                  series={getProfitChartOptions(dataDash.monthlyRevenue).series}
                  type="bar"
                  height={345}
                />
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="row">
            <div className="col-lg-12">
              <div className="card overflow-hidden">
                <div className="card-body p-4">
                  <h5 className="card-title mb-9 fw-semibold">Tổng Kết </h5>
                  <div className="row align-items-center">
                    <div className="col-8">
                      <h4 className="fw-semibold mb-3">
                        {dataDash?.totalProductQuantity?._sum?.quantity ?? 0}
                      </h4>
                      sản phẩm đã bán
                    </div>
                      <div className="col-4">
                      <div className="d-flex justify-content-end">
                        <div className="text-white bg-secondary rounded-circle !px-4 !py-4 d-flex align-items-center justify-content-center">
                          <span className="fs-6">      <FaBox className="text-white" title="Sản phẩm" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-start">
                    <div className="col-8">
                      <h5 className="card-title mb-9 fw-semibold">Doanh Thu Tháng</h5>
                      <h4 className="fw-semibold mb-3">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(dataDash?.totalRevenue || 0)}
                      </h4>
                    </div>
                    <div className="col-4">
                      <div className="d-flex justify-content-end">
                        <div className="text-white bg-secondary rounded-circle !px-4 !py-4 d-flex align-items-center justify-content-center">
                          <span className="fs-6">
                            <FaMoneyBillWave className="text-white" title="VNĐ" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="earning"></div>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-start">
                    <div className="col-8">
                      <h5 className="card-title mb-9 fw-semibold">Tổng Số Sản Phẩm</h5>
                      <h4 className="fw-semibold mb-3">
                        {dataDash?.totalProduct || 0} sản phẩm
                      </h4>
                      <p>{dataDash?.totalCategories || 0} danh mục</p>
                    </div>
                    <div className="col-4">
                      <div className="d-flex justify-content-end">
                        <div className="text-white bg-secondary rounded-circle !px-4 !py-4 d-flex align-items-center justify-content-center">
                          <span className="fs-6">      <FaBox className="text-white" title="Sản phẩm" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div className=" flex  gap-5 col-lg-11">

        <div className="card col-lg-4">
          <div className="card-body">
            <div className="row align-items-start">
              <div className="col-8">
                <h5 className="card-title mb-9 fw-semibold">Quản Lý Cấp Cao</h5>
                <h4 className="fw-semibold mb-3">
                  {dataDash?.totalSuperAdmin || 0}
                </h4>
              </div>
              <div className="col-4">
                <div className="d-flex justify-content-end">
                  <div className="text-white bg-secondary rounded-circle !px-4 !py-4 d-flex align-items-center justify-content-center">
                    <span className="fs-6">
                      <FaUserTie className="text-white" title="Quản lý" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card col-lg-4">
          <div className="card-body">
            <div className="row align-items-start">
              <div className="col-8">
                <h5 className="card-title mb-9 fw-semibold">Nhân Viên</h5>
                <h4 className="fw-semibold ">
                  {dataDash?.totalAdmin || 0}
                </h4>
              </div>
              <div className="col-4">
                <div className="d-flex justify-content-end">
                  <div className="text-white bg-secondary rounded-circle !px-4 !py-4 d-flex align-items-center justify-content-center">
                    <span className="fs-6">
                     <FaUserCog className="text-white" title="Nhân viên" />  
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card col-lg-4">
          <div className="card-body">
            <div className="row align-items-start">
              <div className="col-8">
                <h5 className="card-title mb-9 fw-semibold">Tài Khoản Khách Hàng</h5>
                <h4 className="fw-semibold ">
                  {dataDash?.totalCustommer || 0}
                </h4>
              </div>
              <div className="col-4">
                <div className="d-flex justify-content-end">
                  <div className="text-white bg-secondary rounded-circle !px-4 !py-4 d-flex align-items-center justify-content-center">
                    <span className="fs-6">
                      <FaUser className="text-white" title="Người dùng" />  
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div id="earning"></div>
          </div>
        </div>

      </div>

      <div className="row">
        <div className="col-lg-4 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <div className="mb-4">
                <h5 className="card-title fw-semibold">Giao Dịch Gần Đây</h5>
              </div>
              <ul className="timeline-widget mb-0 position-relative mb-n5">
                {dataDash?.recentOrders?.slice(0, 3).map((order) => (
                  <li
                    key={order.id}
                    className="timeline-item d-flex position-relative overflow-hidden"
                  >
                    <div className={`timeline-time flex-shrink-0 text-end ${order.status === "delivered"
                      ? "text-green-700"
                      : order.status === "cancelled"
                        ? "text-red-600"
                        : "text-gray-500"
                      }`}>
                      {order.status === "delivered"
                        ? "Hoàn thành"
                        : order.status === "cancelled"
                          ? "Đã hủy"
                          : "Đang xử lý"}
                    </div>

                    <div className="timeline-badge-wrap d-flex flex-column align-items-center">
                      <span className={`timeline-badge border ${order.status === "delivered"
                        ? "border-success"
                        : order.status === "cancelled"
                          ? "border-danger"
                          : "border-info"
                        } flex-shrink-0 my-8`}></span>
                      <span className="timeline-badge-border d-block flex-shrink-0"></span>
                    </div>

                    <div className="timeline-desc fs-3 mt-n1 text-dark">
                      {order.status === "cancelled" ? (
                        <>
                          Đặt nhầm chuyến
                          <a
                            href="javascript:void(0)"
                            className="text-primary d-block fw-normal"
                          >
                            #{order.id}
                          </a>
                        </>
                      ) : (
                        <>
                          {order.user?.name || "Khách"} thanh toán{" "}
                          {Number(order.total_price).toLocaleString("vi-VN")} VND
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

            </div>
          </div>
        </div>
        <div className="col-lg-8 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Giao Dịch Gần Đây</h5>
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th><h6 className="fw-semibold mb-0">STT</h6></th>
                      <th><h6 className="fw-semibold mb-0">Khách Hàng</h6></th>
                      <th><h6 className="fw-semibold mb-0">Số Điện Thoại</h6></th>
                      <th><h6 className="fw-semibold mb-0">Trạng Thái</h6></th>
                      <th><h6 className="fw-semibold mb-0">Giá</h6></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataDash?.recentOrders?.map((order, index) => (
                      <tr key={order.id}>
                        <td><h6 className="fw-semibold mb-0">{index + 1}</h6></td>
                        <td><p className="mb-0 fw-normal">{order.name}</p></td>
                        <td><p className="mb-0 fw-normal">{order.phone}</p></td>
                        <td>
                          <span className={`badge rounded-3 fw-semibold ${order.status === "delivered"
                            ? "bg-success"
                            : order.status === "pending"
                              ? "bg-secondary"
                              : "bg-danger"
                            }`}>
                            {order.status === "delivered" ? "Đã giao" :
                              order.status === "pending" ? "Chờ xác nhận" :
                                order.status === "cancelled" ? "Đã hủy" : order.status}
                          </span>
                        </td>
                        <td><h6 className="fw-semibold mb-0 fs-4">{Number(order.total_price).toLocaleString("vi-VN")} VND</h6></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;