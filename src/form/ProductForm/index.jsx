"use client";
import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import ProductVariantList from "../ProductVariantList/ProductVariantList";
import RichTextEditor from "../../components/RichTextEditor/RichTextEditor";

const ProductForm = ({ onSubmit, defaultValues = {}, isEdit = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm();

  const [variants, setVariants] = useState([]);
  const [variantErrors, setVariantErrors] = useState([]);
  const [productPriceError, setProductPriceError] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const hasInitialized = useRef(false);
  const [checkNameError, setCheckNameError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);
        setCategories(await catRes.json());
        setBrands(await brandRes.json());
      } catch (err) {
        console.error("Lỗi khi load danh mục và thương hiệu:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (
      !hasInitialized.current &&
      defaultValues &&
      categories.length > 0 &&
      brands.length > 0
    ) {
      reset({
        ...defaultValues,
        category_id: defaultValues.category_id?.toString() || "",
        brand_id: defaultValues.brand_id?.toString() || "",
        status: defaultValues.status?.toString() || "1",
      });

      if (defaultValues.variants) {
        setVariants(defaultValues.variants);
        setValue("variants", defaultValues.variants);
      }

      if (defaultValues.images) setImagesPreview(defaultValues.images);

      hasInitialized.current = true;
    }
  }, [defaultValues, categories, brands, reset, setValue]);

  const handleAddVariant = () => {
    const productPrice = watch("price");
    setProductPriceError("");

    if (!productPrice || isNaN(productPrice) || parseFloat(productPrice) <= 0) {
      setProductPriceError("Vui lòng nhập giá sản phẩm trước khi thêm biến thể.");
      return;
    }

    const newErrors = variants.map((v) => {
      const err = {};
      if (!v.name_color) err.name_color = "Bắt buộc";
      if (v.price === "" || isNaN(v.price)) err.price = "Bắt buộc";
      if (parseFloat(v.discount || 0) > parseFloat(v.price || 0))
        err.discount = "Giảm giá vượt quá giá";
      if (v.quantity === "" || isNaN(v.quantity)) err.quantity = "Bắt buộc";
      return err;
    });

    setVariantErrors(newErrors);

    const hasError = newErrors.some((e) => Object.keys(e).length > 0);
    if (hasError) {
      return;
    }

    setVariants([
      ...variants,
      { name_color: "", code_color: "#000000", price: "", discount: "", quantity: "" },
    ]);
  };

  const validateVariants = () => {
    const newErrors = variants.map((v) => {
      const err = {};
      if (!v.name_color) err.name_color = "Bắt buộc";
      if (v.price === "" || isNaN(v.price)) err.price = "Bắt buộc";
      if (parseFloat(v.discount || 0) > parseFloat(v.price || 0))
        err.discount = "Giảm giá vượt quá giá";
      if (v.quantity === "" || isNaN(v.quantity)) err.quantity = "Bắt buộc";
      return err;
    });
    setVariantErrors(newErrors);
    return newErrors.every((e) => Object.keys(e).length === 0);
  };

  const checkNameExists = async (name) => {
    if (!name) {
      setCheckNameError("");
      return;
    }
    try {
      const res = await fetch(`/api/products/check-name?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.exists) {
        setCheckNameError("Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác.");
      } else {
        setCheckNameError("");
      }
    } catch (err) {
      console.error("Lỗi kiểm tra tên sản phẩm:", err);
      setCheckNameError("Không thể kiểm tra tên sản phẩm.");
    }
  };


  const submitWithValidation = (data) => {
    if (!isEdit) {
      if (!validateVariants()) {
        return;
      }
      data.variants = variants;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitWithValidation)} className="flex flex-col gap-4">
      <div className="form-group">
        <label>Tên sản phẩm</label>
        <input
          type="text"
          className={`form-control ${errors.name || checkNameError ? "is-invalid" : ""}`}
          {...register("name", {
            required: "Không được để trống tên",
            onBlur: (e) => checkNameExists(e.target.value),
          })}
        />
        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
        {checkNameError && <div className="invalid-feedback">{checkNameError}</div>}
      </div>

      <div className="form-group">
        <label>Mô tả ngắn</label>
        <textarea rows={3} className="form-control" {...register("short_description")} />
      </div>

      <div className="form-group">
        <label>Mô tả chi tiết</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="form-group">
        <label>Giá sản phẩm (VNĐ)</label>
        <input
          type="number"
          className={`form-control ${errors.price || productPriceError ? "is-invalid" : ""}`}
          {...register("price", { required: "Bắt buộc", min: { value: 1000, message: "Giá tối thiểu là 1.000₫" } })}
        />
        {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
        {productPriceError && <div className="invalid-feedback">{productPriceError}</div>}
      </div>

      <div className="row">
        <div className="form-group col-md-6">
          <label>Danh mục</label>
          <select
            className={`form-select ${errors.category_id ? "is-invalid" : ""}`}
            {...register("category_id", { required: "Bắt buộc" })}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.category_id && <div className="invalid-feedback">{errors.category_id.message}</div>}
        </div>

        <div className="form-group col-md-6">
          <label>Thương hiệu</label>
          <select
            className={`form-select ${errors.brand_id ? "is-invalid" : ""}`}
            {...register("brand_id", { required: "Bắt buộc" })}
          >
            <option value="">-- Chọn thương hiệu --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {errors.brand_id && <div className="invalid-feedback">{errors.brand_id.message}</div>}
        </div>
      </div>

      {!isEdit && (
        <>
          <div className="form-group">
            <label>Ảnh sản phẩm</label>
            <Controller
              name="images"
              control={control}
              rules={{ required: "Bắt buộc" }}
              render={({ field }) => (
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className={`form-control ${errors.images ? "is-invalid" : ""}`}
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const previews = files.map((file) => URL.createObjectURL(file));
                    setImagesPreview(previews);
                    field.onChange(files);
                  }}
                />
              )}
            />
            {errors.images && <div className="invalid-feedback">{errors.images.message}</div>}
            <div className="flex flex-wrap gap-2 mt-2">
              {imagesPreview.map((url, i) => (
                <img key={i} src={url} alt={`Preview ${i}`} className="w-[100px] h-[100px] object-cover rounded border" />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="mb-2">Biến thể sản phẩm</label>
            <ProductVariantList
              variants={variants}
              setVariants={setVariants}
              errors={variantErrors}
              productPrice={Number(watch("price")) || 0}
            />
            <button type="button" onClick={handleAddVariant} className="btn btn-sm btn-outline-primary mt-2">
              + Thêm biến thể
            </button>
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select
              className={`form-select ${errors.status ? "is-invalid" : ""}`}
              {...register("status", { required: "Bắt buộc" })}
            >
              <option value="">-- Chọn trạng thái --</option>
              <option value="1">Hiển thị</option>
              <option value="0">Ẩn</option>
            </select>
            {errors.status && <div className="invalid-feedback">{errors.status.message}</div>}
          </div>
        </>
      )}

      <button type="submit" className="btn btn-primary mt-3">
        {isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
      </button>
    </form>
  );
};

export default ProductForm;
