'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const UserInfoForm = ({ user }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty }
    } = useForm();


    useEffect(() => {
        if (user) {
            reset({
                fullName: user.name || '',
                phone: user.phone || '',
                email: user.email || ''
            });
        }
    }, [user, reset]);

    const onSubmit = async (data) => {
        try {
            const res = await fetch('/api/account/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.message || 'Cập nhật thất bại');
            toast.success('Thông tin đã được cập nhật');
        } catch (err) {
            console.error('Lỗi cập nhật thông tin:', err);
            toast.error('Lỗi trong quá trình cập nhật');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="user-info-form">
            <h3 className="user-info-title">Thông tin cá nhân</h3>

            <div className="user-info-grid">
                <div>
                    <label htmlFor="">Họ và tên:</label>

                    <input
                        type="text"
                        placeholder="Họ và tên"
                        {...register('fullName', { required: 'Họ và tên không được để trống' })}
                        className="user-info-input"
                    />
                    {errors.fullName && <p className="input-error">{errors.fullName.message}</p>}
                </div>

                <div>
                    <label htmlFor="">Số điện thoại:</label>
                    <input
                        type="text"
                        placeholder="Số điện thoại"
                        {...register('phone', {
                            required: 'Số điện thoại không được để trống',
                            pattern: { value: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                        })}
                        className="user-info-input"
                    />
                    {errors.phone && <p className="input-error">{errors.phone.message}</p>}
                </div>

                <div className="full-width">
                    <label htmlFor="">Địa chỉ email:</label>
                    <input
                        type="email"
                        placeholder="Email"
                        disabled
                        {...register('email')}
                        className="user-info-input"
                    />
                    {errors.email && <p className="input-error">{errors.email.message}</p>}
                </div>
            </div>

            <button
                type="submit"
                className="user-info-submit"
                disabled={!isDirty}
            >
                Lưu thay đổi
            </button>

        </form>
    );
};

const inputClass =
    'w-full border border-gray-300 rounded-md px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

export default UserInfoForm;
