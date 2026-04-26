'use client';

import '../globals.css';
import '../../styles/css/style.css';
import '../../styles/css/product.css';
import '../../styles/css/product-card.css';
import '../../styles/css/detail-product.css';
import "../../styles/css/User-profile.css"
import "../../styles/css/orderDetailModal.css"
import "../../styles/css/ReviewModal.css"
import "../../styles/css/searchResults.css"
import '../../styles/css/checkout.css';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import dynamic from 'next/dynamic';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChatboxButton = dynamic(() => import('../../components/ChatboxButton/ChatboxButton'), {
  ssr: false,
});

export default function ClientLayout({ children }) {
  return (
    <>
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      {children}
      <Footer />
      <ChatboxButton />
    </>
  );
}
