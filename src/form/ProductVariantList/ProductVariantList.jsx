import React from "react";

const ProductVariantList = ({ variants, setVariants, errors, productPrice }) => {
    const handleChange = (index, field, value) => {
        const updated = [...variants];

        if (field === "price") {
            const priceValue = parseFloat(value);
            if (productPrice && priceValue > productPrice) {
                updated[index].priceError = `Phải bé hơn ${productPrice.toLocaleString("vi-VN")}₫`;
            } else {
                delete updated[index].priceError;
            }
        }

        updated[index][field] = value;
        setVariants(updated);
    };

    const handleRemove = (index) => {
        const updated = [...variants];
        updated.splice(index, 1);
        setVariants(updated);
    };

    return (
        <div>
            {variants.map((variant, index) => (
                <div key={index} className="border rounded p-3 bg-light mb-3 shadow-sm">
                    <div className="row gy-2">
                        <div className="col-md-2">
                            <label className="form-label">Tên màu</label>
                            <input
                                type="text"
                                value={variant.name_color}
                                onChange={(e) => handleChange(index, "name_color", e.target.value)}
                                className={`form-control bg-white ${errors[index]?.name_color ? "is-invalid" : ""}`}
                            />
                            {errors[index]?.name_color && (
                                <div className="invalid-feedback">{errors[index].name_color}</div>
                            )}
                        </div>

                        <div className="col-md-1">
                            <label className="form-label">Mã màu</label>
                            <input
                                type="color"
                                value={variant.code_color || "#000000"}
                                onChange={(e) => handleChange(index, "code_color", e.target.value)}
                                className="form-control form-control-color bg-white w-100"
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Giá (₫)</label>
                            <input
                                type="number"
                                value={variant.price}
                                onChange={(e) => handleChange(index, "price", e.target.value)}
                                className={`form-control bg-white ${errors[index]?.price || variant.priceError ? "is-invalid" : ""}`}
                            />
                            {errors[index]?.price && (
                                <div className="invalid-feedback">{errors[index].price}</div>
                            )}
                            {variant.priceError && (
                                <div className="invalid-feedback">{variant.priceError}</div>
                            )}
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Giảm giá (₫)</label>
                            <input
                                type="number"
                                value={variant.discount}
                                onChange={(e) => handleChange(index, "discount", e.target.value)}
                                className={`form-control bg-white ${errors[index]?.discount ? "is-invalid" : ""}`}
                            />
                            {errors[index]?.discount && (
                                <div className="invalid-feedback">{errors[index].discount}</div>
                            )}
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">Số lượng</label>
                            <input
                                type="number"
                                value={variant.quantity}
                                onChange={(e) => handleChange(index, "quantity", e.target.value)}
                                className={`form-control bg-white ${errors[index]?.quantity ? "is-invalid" : ""}`}
                            />
                            {errors[index]?.quantity && (
                                <div className="invalid-feedback">{errors[index].quantity}</div>
                            )}
                        </div>

                        <div className="col-md-1 d-flex align-items-center justify-content-center">
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="btn btn-outline-danger btn-sm w-100 h-10"
                            >
                                Xoá
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductVariantList;
