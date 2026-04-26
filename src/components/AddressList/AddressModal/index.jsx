'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const AddressModal = ({ visible, onClose, onSubmit: onParentSubmit, address = null }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm();

    const [provinceInput, setProvinceInput] = useState('');
    const [districtInput, setDistrictInput] = useState('');
    const [wardInput, setWardInput] = useState('');

    const [provinceSuggestions, setProvinceSuggestions] = useState([]);
    const [districtSuggestions, setDistrictSuggestions] = useState([]);
    const [wardSuggestions, setWardSuggestions] = useState([]);

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [provinceName, setProvinceName] = useState('');
    const [districtName, setDistrictName] = useState('');
    const [wardName, setWardName] = useState('');

    // Gọi API lấy địa chỉ theo ID
    const fetchAddressById = async (id) => {
        try {
            const res = await fetch(`/api/account/addresses/${id}`, {
                method: 'GET',
                credentials: 'include',
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Không lấy được địa chỉ');

            const addr = result.address;

            // Tách chuỗi "số nhà, phường, quận, tỉnh" → các phần riêng
            const parts = addr.address.split(',').map(p => p.trim());
            const addressDetail = parts[0] || '';
            const ward = parts[1] || '';
            const district = parts[2] || '';
            const province = parts[3] || '';

            // Reset form
            reset({
                recipient_name: addr.recipient_name,
                phone: addr.phone,
                address: addressDetail,
                note: addr.note || '',
                province,
                district,
                ward,
            });

            setProvinceInput(province);
            setDistrictInput(district);
            setWardInput(ward);

            setProvinceName(province);
            setDistrictName(district);
            setWardName(ward);

            // Gọi API để load danh sách quận
            const provinceData = await fetch(`https://provinces.open-api.vn/api/?depth=2`).then(res => res.json());
            const selectedProvince = provinceData.find(p => p.name === province);
            if (selectedProvince) {
                setDistricts(selectedProvince.districts);
                const selectedDistrict = selectedProvince.districts.find(d => d.name === district);
                if (selectedDistrict) {
                    const districtDetail = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`).then(res => res.json());
                    setWards(districtDetail.wards);
                }
            }
        } catch (err) {
            console.error('Lỗi khi fetch địa chỉ theo ID:', err);
            alert('❌ Không thể lấy dữ liệu địa chỉ.');
        }
    };


    // Load tỉnh ban đầu
    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/?depth=1')
            .then((res) => res.json())
            .then(setProvinces);
    }, []);

    // Khi mở modal
    useEffect(() => {
        if (visible && address?.id) {
            fetchAddressById(address.id);
        } else if (visible) {
            reset();

            setProvinceInput('');
            setDistrictInput('');
            setWardInput('');

            setProvinceName('');
            setDistrictName('');
            setWardName('');

            setDistricts([]);
            setWards([]);
            setProvinceSuggestions([]);
            setDistrictSuggestions([]);
            setWardSuggestions([]);
        }
    }, [visible, address?.id]);

    const handleProvinceChange = (e) => {
        const value = e.target.value;
        setProvinceInput(value);
        const filtered = provinces.filter((p) =>
            p.name.toLowerCase().includes(value.toLowerCase())
        );
        setProvinceSuggestions(filtered);
    };

    const handleSelectProvince = async (province) => {
        setProvinceInput(province.name);
        setProvinceSuggestions([]);
        setProvinceName(province.name);
        setValue('province', province.name);

        const res = await fetch(
            `https://provinces.open-api.vn/api/p/${province.code}?depth=2`
        );
        const data = await res.json();
        setDistricts(data.districts);
        setDistrictInput('');
        setWards([]);
        setWardInput('');
    };

    const handleDistrictChange = (e) => {
        const value = e.target.value;
        setDistrictInput(value);
        const filtered = districts.filter((d) =>
            d.name.toLowerCase().includes(value.toLowerCase())
        );
        setDistrictSuggestions(filtered);
    };

    const handleSelectDistrict = async (district) => {
        setDistrictInput(district.name);
        setDistrictSuggestions([]);
        setDistrictName(district.name);
        setValue('district', district.name);

        const res = await fetch(
            `https://provinces.open-api.vn/api/d/${district.code}?depth=2`
        );
        const data = await res.json();
        setWards(data.wards);
        setWardInput('');
    };

    const handleWardChange = (e) => {
        const value = e.target.value;
        setWardInput(value);
        const filtered = wards.filter((w) =>
            w.name.toLowerCase().includes(value.toLowerCase())
        );
        setWardSuggestions(filtered);
    };

    const handleSelectWard = (ward) => {
        setWardInput(ward.name);
        setWardSuggestions([]);
        setWardName(ward.name);
        setValue('ward', ward.name);
    };

    const onSubmit = (formData) => {
        const payload = {
            recipient_name: formData.recipient_name,
            phone: formData.phone,
            address: formData.address,
            province: provinceName,
            district: districtName,
            ward: wardName,
            note: formData.note || '',
        };
        onParentSubmit?.(payload);
        onClose();
    };

    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3 className="modal-title">{address ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
                    {/* Họ tên */}
                    <input
                        {...register('recipient_name', { required: 'Vui lòng nhập họ tên' })}
                        placeholder="Họ tên người nhận"
                        className={`modal-input ${errors.recipient_name ? 'error' : ''}`}
                    />
                    {errors.recipient_name && <p className="form-error">{errors.recipient_name.message}</p>}

                    {/* Số điện thoại */}
                    <input
                        {...register('phone', {
                            required: 'Vui lòng nhập số điện thoại',
                            pattern: { value: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' },
                        })}
                        placeholder="Số điện thoại"
                        className={`modal-input ${errors.phone ? 'error' : ''}`}
                    />
                    {errors.phone && <p className="form-error">{errors.phone.message}</p>}

                    {/* Tỉnh / Thành phố */}
                    <div className="modal-autocomplete-wrapper">
                        <input
                            value={provinceInput}
                            onChange={handleProvinceChange}
                            placeholder="Tỉnh/Thành phố"
                            className={`modal-input ${errors.province ? 'error' : ''}`}
                        />
                        {provinceSuggestions.length > 0 && (
                            <div className="suggestion-list">
                                {provinceSuggestions.map((p) => (
                                    <div
                                        key={p.code}
                                        onClick={() => handleSelectProvince(p)}
                                        className="suggestion"
                                    >
                                        {p.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quận / Huyện */}
                    <div className="modal-autocomplete-wrapper">
                        <input
                            value={districtInput}
                            onChange={handleDistrictChange}
                            placeholder="Quận/Huyện"
                            className={`modal-input ${errors.district ? 'error' : ''}`}
                        />
                        {districtSuggestions.length > 0 && (
                            <div className="suggestion-list">
                                {districtSuggestions.map((d) => (
                                    <div
                                        key={d.code}
                                        onClick={() => handleSelectDistrict(d)}
                                        className="suggestion"
                                    >
                                        {d.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Phường / Xã */}
                    <div className="modal-autocomplete-wrapper">
                        <input
                            value={wardInput}
                            onChange={handleWardChange}
                            placeholder="Phường/Xã"
                            className={`modal-input ${errors.ward ? 'error' : ''}`}
                        />
                        {wardSuggestions.length > 0 && (
                            <div className="suggestion-list">
                                {wardSuggestions.map((w) => (
                                    <div
                                        key={w.code}
                                        onClick={() => handleSelectWard(w)}
                                        className="suggestion"
                                    >
                                        {w.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Địa chỉ chi tiết */}
                    <textarea
                        {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
                        placeholder="Địa chỉ (số nhà, tên đường...)"
                        className={`modal-textarea ${errors.address ? 'error' : ''}`}
                    />
                    {errors.address && <p className="form-error">{errors.address.message}</p>}

                    {/* Ghi chú */}
                    <textarea
                        {...register('note')}
                        placeholder="Ghi chú (tuỳ chọn)"
                        className="modal-textarea"
                    />

                    {/* Nút hành động */}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Huỷ
                        </button>
                        <button type="submit" className="btn-save">
                            {address ? 'Cập nhật' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressModal;
