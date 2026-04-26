"use client";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

const BrandForm = ({ onSubmit, defaultValues = {}, isEdit = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ mode: "onSubmit", reValidateMode: "onChange" });

  const prevDefaults = useRef();
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const currentDefaultsStr = JSON.stringify(defaultValues);
    const prevDefaultsStr = JSON.stringify(prevDefaults.current);

    if (currentDefaultsStr !== prevDefaultsStr) {
      reset(defaultValues);
      prevDefaults.current = defaultValues;

      if (defaultValues.logo_url && typeof defaultValues.logo_url === "string") {
        setImagePreview(defaultValues.logo_url);
      }
    }
  }, [defaultValues, reset]);

  const logoFile = watch("logo");
  useEffect(() => {
    if (logoFile && logoFile.length > 0) {
      const file = logoFile[0];
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, [logoFile]);

  const submitHandler = async (data) => {
    try {
      const url = `/api/brands/check-name?name=${encodeURIComponent(data.name)}${isEdit && defaultValues.id ? `&excludeId=${defaultValues.id}` : ""}`;
      const res = await fetch(url);
      const check = await res.json();

      if (check.exists) {
        setError("name", { type: "manual", message: "Tên thương hiệu đã tồn tại." });
        return;
      } else {
        clearErrors("name");
      }

      await onSubmit(data, setError);
    } catch (err) {
      console.error("Lỗi khi submit:", err);
      setError("name", { type: "manual", message: "Có lỗi xảy ra. Vui lòng thử lại." });
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} noValidate className="space-y-4">
      {/* Tên thương hiệu */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">Tên thương hiệu</label>
        <input
          type="text"
          placeholder="Nhập tên thương hiệu"
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.name ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-500"}`}
          {...register("name", { required: "Không được để trống tên thương hiệu" })}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
      </div>

      {/* Mô tả */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">Mô tả</label>
        <textarea
          rows="3"
          placeholder="Nhập mô tả thương hiệu"
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.description ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-500"}`}
          {...register("description")}
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
      </div>

      {/* Logo thương hiệu */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">Logo thương hiệu</label>
        <input
          type="file"
          accept="image/*"
          className={`w-full border rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-100 file:text-blue-800 file:font-semibold hover:file:bg-blue-200 ${errors.logo ? "border-red-500" : "border-gray-300"}`}
          {...register("logo", {
            validate: (fileList) => {
              if (!isEdit && (!fileList || fileList.length === 0)) {
                return "Vui lòng chọn logo";
              }
              return true;
            },
          })}
        />
        {errors.logo && <p className="text-sm text-red-600 mt-1">{errors.logo.message}</p>}

        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-1 font-medium">Xem trước logo:</p>
            <img
              src={imagePreview}
              alt="Preview"
              className="w-44 h-44 object-cover rounded-lg border border-gray-300 shadow"
            />
          </div>
        )}
      </div>

      {/* Trạng thái (ẩn khi isEdit) */}
      {!isEdit && (
        <div>
          <label className="block mb-1 font-medium text-gray-700">Trạng thái</label>
          <select
            className={`w-full border rounded px-3 py-2 ${errors.status ? "border-red-500" : "border-gray-300"}`}
            {...register("status", { required: "Vui lòng chọn trạng thái" })}
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="true">Hiển thị</option>
            <option value="false">Ẩn</option>
          </select>
          {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>}
        </div>
      )}

      {/* Nút Submit */}
      <div>
        <button
          type="submit"
          className="w-full bg-blue-900 text-white py-2 px-4 rounded hover:bg-blue-800 transition mt-4 font-semibold shadow"
        >
          {isEdit ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}
        </button>
      </div>
    </form>
  );
};

export default BrandForm;
