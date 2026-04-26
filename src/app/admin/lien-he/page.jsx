"use client";
import dayjs from 'dayjs';
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Pagination from '../../../components/Pagination';

export default function ContactPage() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('unanswered');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


useEffect(() => {
  setCurrentPage(1);
}, [activeTab, searchQuery]);

  useEffect(() => {
    dataContact();
  }, []);

  const dataContact = async () => {
    try {
      const res = await fetch("/api/contact");
      if (res.ok) {
        const contact = await res.json();
        setData(contact);
      }
    } catch (error) {
      console.log("Lỗi contact", error);
    }
  };


  const filteredData = data.filter(contact => {
    const matchTab = activeTab === 'unanswered' ? !contact.status : contact.status;
    const matchSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách liên hệ</h1>
      <div className="flex justify-between items-center">
        <div className="mb-4 flex gap-2">
          <button
            className={`px-4 py-2 rounded ${activeTab === 'unanswered' ? 'bg-blue-800 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('unanswered')}
          >
            Chưa trả lời
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'answered' ? 'bg-green-700 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('answered')}
          >
            Đã trả lời
          </button>
        </div>

        <div className="mb-4 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded w-64"
          />
          <button
            onClick={() => setSearchQuery(searchQuery.trim())}
            className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded"
          >
            Tìm kiếm
          </button>
        </div>
      </div>


      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="border !min-w-2 border-gray-300 px-4 py-3">ID</th>
              <th className="border border-gray-300 px-4 py-3">Tên</th>
              <th className="border border-gray-300 px-4 py-3">Email</th>
              <th className="border border-gray-300 px-4 py-3">Chủ đề</th>
              <th className="border border-gray-300 px-4 py-3">Ngày gửi</th>
              <th className="border border-gray-300 px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((contact, i) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="border  border-gray-300 px-4 py-3">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  <td className="border border-gray-300 px-4 py-3">{contact.name}</td>
                  <td className="border border-gray-300 px-4 py-3">{contact.email}</td>
                  <td className="border border-gray-300 px-4 py-3">{contact.title}</td>
                  <td className="border border-gray-300 px-4 py-3">
                    {dayjs(contact.createdAt).format('DD/MM/YYYY HH:mm')}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="flex flex-col gap-2 items-center">
                      {contact.status ? (
                        <Link
                          href={`/admin/lien-he/${contact.id}`}
                          className="w-24 text-center bg-blue-800 hover:bg-blue-900 text-white text-sm px-4 py-2 rounded"
                        >
                          Xem
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/lien-he/${contact.id}`}
                          className="w-24 text-center bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded"
                        >
                          Trả lời
                        </Link>
                      )}

                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">Không có liên hệ nào</td>
              </tr>
            )}
          </tbody>
        </table>
    
      </div>  
       {totalItems > itemsPerPage && (
          <div className=" !flex !mx-auto !justify-center !items-center w-full">
            <Pagination
              count={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
    </div>
  );
}
