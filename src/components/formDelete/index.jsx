import { FaExclamationTriangle } from "react-icons/fa";

export default function FormDelete({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white border border-gray-300 p-6 rounded-xl shadow-2xl text-center max-w-sm w-full">
        <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Xác nhận xóa</h3>
        <p className="text-gray-600 mb-6">
          {message || "Bạn có chắc chắn muốn xóa không?"}
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Xóa
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};
