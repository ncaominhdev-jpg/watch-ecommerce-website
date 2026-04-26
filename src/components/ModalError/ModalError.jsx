import { FaTimesCircle } from "react-icons/fa";

export default function ModalError({ isOpen, onClose, message }) {
    if (!isOpen) return null;

    return (
        <>
            <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content text-center">
                        <div className="modal-header border-0 justify-center">
                            <FaTimesCircle className="text-danger mx-auto d-block" size={60} />
                        </div>

                        <div className="modal-body">
                            <h5 className="modal-title mb-3">Lỗi</h5>
                            <p className="text-gray-700">{message || "Đã xảy ra lỗi."}</p>
                        </div>

                        <div className="modal-footer border-0 justify-content-center pb-4">
                            <button className="btn btn-danger px-4" onClick={onClose}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="modal-backdrop fade show"
                style={{ zIndex: 1050 }}
                onClick={onClose}
            ></div>
        </>
    );
}
