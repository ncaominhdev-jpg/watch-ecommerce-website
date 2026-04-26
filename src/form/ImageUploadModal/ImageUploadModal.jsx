import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";

const ImageUploadModal = ({ show, onClose, onUpload }) => {
    const [previews, setPreviews] = useState([]);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    const handleSelectFiles = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const imageFiles = selectedFiles.filter(file => file.type.startsWith("image/"));

        if (imageFiles.length !== selectedFiles.length) {
            setError("Chỉ cho phép tải lên file hình ảnh.");
        } else {
            setError("");
        }

        setFiles(imageFiles);
        setPreviews(imageFiles.map(file => URL.createObjectURL(file)));
    };

    const handleRemove = (index) => {
        const newPreviews = [...previews];
        const newFiles = [...files];
        newPreviews.splice(index, 1);
        newFiles.splice(index, 1);
        setPreviews(newPreviews);
        setFiles(newFiles);
    };

    const handleUpload = () => {
        if (files.length > 0) {
            onUpload(files); 
            onClose();   
            setPreviews([]);
            setFiles([]);
            setError("");
        }
    };

    if (!show) return null;

    return (
        <>
            <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content p-3">
                        <div className="modal-header">
                            <h5 className="modal-title">Thêm ảnh sản phẩm</h5>
                            <button className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <input type="file" className="form-control mb-3" multiple onChange={handleSelectFiles} accept="image/*" />

                            {error && <div className="text-danger mb-2">{error}</div>}

                            <div className="d-flex flex-wrap gap-2">
                                {previews.map((src, index) => (
                                    <div key={index} className="position-relative">
                                        <img
                                            src={src}
                                            alt={`preview-${index}`}
                                            style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }}
                                        />
                                        <button
                                            className="btn btn-sm btn-danger position-absolute top-1 end-1"
                                            onClick={() => handleRemove(index)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={onClose}>Huỷ</button>
                            <button className="btn btn-primary" onClick={handleUpload} disabled={files.length === 0}>Thêm ảnh</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose}></div>
        </>
    );
};

export default ImageUploadModal;
