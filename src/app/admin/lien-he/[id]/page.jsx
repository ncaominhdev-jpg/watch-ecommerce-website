"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

export default function ContactDetailPage() {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchContact();
  }, [id]);

  useEffect(() => {
    fetchUser();
    console.log('Decode cookie result:', user);
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/account/decodeJwtCookie', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();
      console.log('Decode cookie result:', data);
      setUser(data.user);
    } catch (err) {
      console.error('Lỗi khi gọi API decodeJwtCookie:', err);
    }
  }

  const fetchContact = async () => {
    try {
      const res = await fetch(`/api/contact/${id}`);
      if (res.ok) {
        const data = await res.json();
        setContact(data);
        setReply(data.reply_message || "");
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết liên hệ:", error);
    }
  };
    console.log('du lieu contact', contact);

  const handleReply = async (data) => {
    const replyMessage = data.reply?.trim();

    if (!replyMessage) {
      toast.error("Vui lòng nhập nội dung trả lời.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reply_message: replyMessage,
          user_id: user.id
        }),
      });

      if (res.ok) {
        toast.success("Đã trả lời liên hệ thành công.");
        fetchContact();
      } else {
        const resData = await res.json();
        toast.error(resData.error || "Lỗi khi gửi trả lời.");
      }
    } catch (error) {
      console.error("Lỗi gửi trả lời:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!contact) return <div className="text-center py-10 text-gray-600">Đang tải...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="!my-4 text-left">
        <Link
          href="/admin/lien-he"
          className="inline-block hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded">
          ←  Quay lại danh sách
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Chi tiết liên hệ</h1>

      <form onSubmit={handleSubmit(handleReply)} className="bg-white shadow-lg rounded-lg p-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 pb-4 gap-6 text-gray-700">
          <div className="p-3">
            <p><span className="font-semibold">Mã liên hệ:</span> #{contact.id}</p>
            <p><span className="font-semibold">Tên người gửi:</span> {contact.name}</p>
            <p><span className="font-semibold">Email:</span> {contact.email}</p>
            <p><span className="font-semibold">Ngày gửi:</span> {dayjs(contact.createdAt).format("DD/MM/YYYY HH:mm")}</p>
            <p><span className="font-semibold">Người trả lời:</span>{contact?.user?.name || ""} - {contact?.user?.email}</p>
            <div className="flex items-center gap-2 text-sm mt-2">
              {contact.status ? (
                <>
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-green-600 font-medium">Liên hệ đã được trả lời</span>
                </>
              ) : (
                <>
                  <FaTimesCircle className="text-yellow-500" />
                  <span className="text-yellow-600 font-medium">Chưa được trả lời</span>
                </>
              )}
            </div>

          </div>
          <div>
            <p><span className="font-semibold">Chủ đề:</span></p>
            <div className="bg-gray-100 p-3 rounded mt-1">{contact.title}</div>

            <p className="mt-4 font-semibold">Nội dung:</p>
            <div className="bg-gray-100 p-4 rounded mt-1 leading-relaxed">
              {contact.message}
            </div>
          </div>

        </div>

        <div className="!pt-4 border-t">
          <h2 className="text-xl font-semibold mb-3">Phản hồi</h2>
          <textarea
            rows={4}
            {...register("reply", {
              required: "Vui lòng nhập nội dung phản hồi.",
              minLength: {
                value: 5,
                message: "Nội dung phản hồi phải có ít nhất 5 ký tự.",
              },
            })}
            defaultValue={contact.reply_message || ""}
            disabled={contact.status}
            className={`w-full p-3 border rounded bg-gray-50 focus:outline-none focus:ring-2 ${errors.reply ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
              }`}
          />

          {errors.reply && (
            <p className="text-red-500 text-sm mt-1">{errors.reply.message}</p>
          )}


          {!contact.status && (
            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded shadow"
            >
              {loading ? "Đang gửi..." : "Gửi trả lời"}
            </button>

          )}
        </div>
      </form>
    </div>
  );
}
