'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChangePasswordForm = () => {
    const { register, handleSubmit, watch, formState: { errors }, setError, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            const res = await fetch('/api/account/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) {
                if (result.message === 'Mật khẩu hiện tại không đúng') {
                    setError('currentPassword', {
                        type: 'manual',
                        message: result.message
                    });
                } else {
                    toast.error(result.message || 'Đổi mật khẩu thất bại', { icon: false });
                }
                return;
            }

            toast.success('Mật khẩu đã được thay đổi', { icon: false });
            reset();
        } catch (err) {
            toast.error('' + err.message, { icon: false });
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="password-form">
                <h3 className="password-title">Đổi mật khẩu</h3>

                <div className="password-grid">
                    <div>
                        <input
                            type="password"
                            placeholder="Mật khẩu hiện tại"
                            {...register('currentPassword', { required: 'Vui lòng nhập mật khẩu hiện tại' })}
                            className={`password-input ${errors.currentPassword ? 'error' : ''}`}
                        />
                        {errors.currentPassword && (
                            <p className="password-error">{errors.currentPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            {...register('newPassword', {
                                required: 'Vui lòng nhập mật khẩu mới',
                                minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
                            })}
                            className={`password-input ${errors.newPassword ? 'error' : ''}`}
                        />
                        {errors.newPassword && (
                            <p className="password-error">{errors.newPassword.message}</p>
                        )}
                    </div>

                    <div className="full-width">
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu mới"
                            {...register('confirmPassword', {
                                required: 'Vui lòng xác nhận mật khẩu',
                                validate: value =>
                                    value === watch('newPassword') || 'Mật khẩu không khớp'
                            })}
                            className={`password-input ${errors.confirmPassword ? 'error' : ''}`}
                        />
                        {errors.confirmPassword && (
                            <p className="password-error">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                </div>

                <button type="submit" className="password-submit">Đổi mật khẩu</button>
            </form>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </>
    );
};

export default ChangePasswordForm;
