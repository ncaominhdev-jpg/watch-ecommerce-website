import React from "react";

const DescriptionModal = ({ show, onClose, description }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl mx-4">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-blue-600 rounded-t-xl">
                    <h2 className="text-white text-lg font-semibold">
                        Mô tả chi tiết sản phẩm
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white text-xl hover:opacity-75"
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[60vh] text-gray-800 leading-relaxed prose prose-sm sm:prose">
                    <div
                        dangerouslySetInnerHTML={{
                            __html: description || "<em>Không có mô tả</em>",
                        }}
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DescriptionModal;
