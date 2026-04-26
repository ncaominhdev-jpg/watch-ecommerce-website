"use client";
import { useForm } from "react-hook-form";

export default function CategoryForm({ onSubmit, isEdit = false, defaultValues = {} }) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: defaultValues.name || "",
      status: defaultValues.status || "active",
    },
  });

  const submitHandler = async (data) => {
    try {
      if (isEdit && data.name === defaultValues?.name) {
        await onSubmit(data, setError);
        return;
      }

      const url = `/api/categories/check-name?name=${encodeURIComponent(data.name)}`;
      const res = await fetch(url);
      const check = await res.json();

      if (check.exists) {
        setError("name", { type: "manual", message: "Tên danh mục đã tồn tại." });
        return;
      } else {
        clearErrors("name");
      }
    } catch (err) {
      console.error("Lỗi khi check tên:", err);
      setError("name", { type: "manual", message: "Không thể kiểm tra tên danh mục" });
      return;
    }

    await onSubmit(data, setError);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      {/* Tên danh mục */}
      <div>
        <label className="form-label">Tên danh mục</label>
        <input
          type="text"
          {...register("name", { required: "Vui lòng nhập tên danh mục" })}
          className={`form-control ${errors.name ? "is-invalid" : ""}`}
        />
        {errors.name && (
          <div className="invalid-feedback">{errors.name.message}</div>
        )}
      </div>

      {/* Ảnh danh mục */}
      <div>
        <label className="form-label">Ảnh danh mục</label>
        <input
          type="file"
          accept="image/*"
          {...register("image", {
            required: isEdit ? false : "Vui lòng chọn ảnh",
          })}
          className={`form-control ${errors.image ? "is-invalid" : ""}`}
        />
        {errors.image && (
          <div className="invalid-feedback">{errors.image.message}</div>
        )}
        {isEdit && defaultValues.imageUrl && (
          <div className="mt-2">
            <img
              src={defaultValues.imageUrl}
              alt="Ảnh hiện tại"
              className="w-32 h-32 object-cover rounded"
            />
          </div>
        )}
      </div>

      {/* Trạng thái */}
      <div>
        <label className="form-label">Trạng thái</label>
        <select
          {...register("status")}
          className="form-select"
        >
          <option value="active">Hiển thị</option>
          <option value="inactive">Ẩn</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary mt-3">
          {isEdit ? "Cập nhật" : "Thêm"}
        </button>
      </div>
    </form>
  );
}
