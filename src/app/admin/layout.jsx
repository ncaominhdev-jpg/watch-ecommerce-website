"use client";
import '../globals.css';
import { Outlet } from "react-router-dom";
import Aside from "../../components/aside";
import Header from "../../components/HeaderAdmin/index.jsx";
import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";

import '../../styles/admin/css/styles.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const loaderContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundColor: "#f0f4f8",
};

const AdminLayout = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../../styles/admin/js/app.min.js');
    import('../../styles/admin/js/sidebarmenu.js');
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500)

  }, []);


  return (
    <>
      {loading ? (
        <div style={loaderContainerStyle}>
          <HashLoader
            color="#0F3079"
            loading={loading}
            size={80}
          />
        </div>
      ) : (
        <div
          className="page-wrapper"
          id="main-wrapper"
          data-layout="vertical"
          data-navbarbg="skin6"
          data-sidebartype="full"
          data-sidebar-position="fixed"
          data-header-position="fixed">
          <Aside />
          <div className="body-wrapper">
            <Header className=""/>
            <div className="container-fluid !pt-2 !mt-[8%]">
              <div className="row rounded-1">
                <ToastContainer position="top-right" autoClose={3000} />
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminLayout;
