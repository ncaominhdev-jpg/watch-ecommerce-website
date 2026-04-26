import { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";

export default function ModalSuccess({ isOpen, onClose, message, duration = 1500 }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center">
            <div className="modal-header border-0 justify-content-center">
              <FaCheckCircle className="text-success mx-auto d-block" size={48} />
            </div>

            <div className="modal-body">
              <h5 className="modal-title mb-3">Thành công</h5>
              <p className="text-gray-700">{message || "Thao tác thành công!"}</p>
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
