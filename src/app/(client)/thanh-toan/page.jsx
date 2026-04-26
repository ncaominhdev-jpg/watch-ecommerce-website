'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import { useForm } from 'react-hook-form'; // ✅ thêm

const Checkout = () => {
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [addressList, setAddressList] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [useSavedAddress, setUseSavedAddress] = useState(true);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');

    const router = useRouter();

    // ✅ hook form
    const { register, handleSubmit, formState: { errors } } = useForm();

    useEffect(() => {
        const token = Cookies.get('jwt-datt');
        const stored = localStorage.getItem('checkoutItems');
        if (!token) {
            toast.error("Vui lòng đăng nhập để tiếp tục thanh toán.");
            setTimeout(() => router.push('/dang-nhap'), 1500);
            return;
        }
        if (!stored) {
            toast.error("Không có sản phẩm nào để thanh toán.");
            setTimeout(() => router.push('/gio-hang'), 1500);
            return;
        }
        let parsedItems = [];
        try {
            parsedItems = JSON.parse(stored);
        } catch (error) {
            console.error("Dữ liệu checkoutItems lỗi:", error);
        }
        if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
            toast.error("Danh sách sản phẩm không hợp lệ.");
            setTimeout(() => router.push('/gio-hang'), 1500);
            return;
        }
        setCheckoutItems(parsedItems);

        const fetchAddresses = async () => {
            try {
                const res = await fetch('/api/account/addresses');
                const data = await res.json();
                if (data.success) {
                    setAddressList(data.addresses);
                    if (data.addresses.length > 0) {
                        setSelectedAddressId(data.addresses[0].id);
                        setSelectedAddress(data.addresses[0]);
                    }
                }
            } catch (err) {
                console.error('Lỗi khi lấy địa chỉ:', err);
            }
        };
        fetchAddresses();
    }, [router]);

    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/p/')
            .then(res => res.json())
            .then(data => setProvinces(data))
            .catch(() => setProvinces([]));
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
                .then(res => res.json())
                .then(data => setDistricts(data.districts || []))
                .catch(() => setDistricts([]));
        } else {
            setDistricts([]);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                .then(res => res.json())
                .then(data => setWards(data.wards || []))
                .catch(() => setWards([]));
        } else {
            setWards([]);
        }
    }, [selectedDistrict]);

    const formatCurrency = (value) => {
        if (!value) return '0 đ';
        return Number(value).toLocaleString('vi-VN') + ' đ';
    };

    const calculateTotal = () => {
        return checkoutItems.reduce((sum, item) => {
            const priceAfterDiscount = (item.variant?.price || 0) - (item.variant?.discount || 0);
            return sum + priceAfterDiscount * item.quantity;
        }, 0);
    };
    console.log("Tổg tiền:", calculateTotal());

    // ✅ gói lại handleAddToOrder để dùng handleSubmit
    const onSubmit = (data) => {
        handleAddToOrder(data);
    };

    const handleAddToOrder = async (formData) => {
        try {
            const token = Cookies.get('jwt-datt');
            if (!token) {
                toast.error('Bạn cần đăng nhập để đặt hàng.');
                return;
            }
            const decoded = jwtDecode(token);
            const userId = decoded.id;
            let name = '', phone = '', address = '', note = '';
            let fullAddress = '';

            if (useSavedAddress && selectedAddress) {
                name = selectedAddress.recipient_name;
                phone = selectedAddress.phone;
                address = selectedAddress.address;
                note = selectedAddress.note || '';
                fullAddress = address;
            } else {
                // ✅ lấy từ formData thay vì document.querySelector
                name = formData.name;
                phone = formData.phone;
                address = formData.address;
                note = formData.note;

                if (!name || !phone || !address || !selectedProvince || !selectedDistrict || !selectedWard) {
                    toast.error('Vui lòng nhập đầy đủ thông tin địa chỉ và chọn tỉnh/huyện/xã.');
                    return;
                }
                const provinceName = provinces.find(p => p.code === Number(selectedProvince))?.name || '';
                const districtName = districts.find(d => d.code === Number(selectedDistrict))?.name || '';
                const wardName = wards.find(w => w.code === Number(selectedWard))?.name || '';
                fullAddress = `${address}, ${wardName}, ${districtName}, ${provinceName}`;
            }

            const payload = {
                user_id: userId,
                name,
                phone,
                email: decoded.email,
                address: fullAddress,
                note,
                status: 'pending',
                total_price: calculateTotal(),
                address_id: useSavedAddress ? selectedAddress?.id : null,
                items: checkoutItems.map((item) => ({
                    variant_id: item.product_variant_id,
                    quantity: item.quantity,
                    price: item.variant?.price - (item.variant?.discount || 0),
                    total_price: (item.variant?.price - (item.variant?.discount || 0)) * item.quantity,
                })),
            };

            console.log(payload);
            const res = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                // localStorage.removeItem('checkoutItems');
                const ItemsLocal = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
                console.log("dulieu daluu", ItemsLocal);
                const items = ItemsLocal.map((item) => {
                    const price = (item.variant?.price || 0) - (item.variant?.discount || 0);
                    return {
                        nameProduct: item.product?.name || "Sản phẩm",
                        nameVariant: item.variant?.name_color || "",
                        quantity: item.quantity || 1,
                        price,
                    };
                });

                const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

                const invoicePayload = {
                    name,
                    email: decoded.email,
                    address,
                    phone,
                    payment: "COD",
                    total,
                    items,
                };

                console.log("Invoice data:", invoicePayload);

                await fetch("/api/invoice", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(invoicePayload),
                });
                toast.success('Đặt hàng thành công!');
                setTimeout(() => router.push('/'), 2500);

            } else {
                toast.error(data.error || 'Đặt hàng thất bại!');
            }
        } catch (err) {
            console.error('Lỗi khi đặt hàng:', err.message);
            toast.error('Lỗi hệ thống. Vui lòng thử lại sau.');
        }
    };


    return (
        <div className="checkout-page py-10">
            <div className="container !mx-auto flex flex-col lg:flex-row gap-8">
                <form className="flex w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="content-left !w-[50%] lg:w-2/3">
                        <h1 className="text-2xl font-bold mb-6">THANH TOÁN</h1>
                        <div className="!mt-2">
                            <label className="block font-medium">Tên</label>
                            <input
                                type="text"
                                placeholder="Tên"
                                className="w-full border border-gray-300 !p-1 rounded"
                                {...register("name", { required: "Tên không được bỏ trống" })}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>
                        <div className="!mt-2">
                            <label className="block font-medium">Số điện thoại</label>
                            <input
                                type="text"
                                placeholder="Số điện thoại"
                                className="w-full border border-gray-300 !p-1 rounded"
                                {...register("phone", {
                                    required: "SĐT không được bỏ trống",
                                    pattern: { value: /^[0-9]{9,11}$/, message: "SĐT không hợp lệ" }
                                })}
                            />
                            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                        </div>
                        <div className="!mt-2">
                            <label className="block font-medium">Địa chỉ</label>
                            <input
                                type="text"
                                placeholder="Địa chỉ"
                                className="w-full border border-gray-300 !p-1 rounded"
                                {...register("address", { required: "Địa chỉ không được bỏ trống" })}
                            />
                            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                        </div>
                        <div className="!mt-2 flex gap-3">
                            <div className='flex-1'>
                                <label className="font-medium">Tỉnh</label><br />
                                <select className="border !p-3 rounded w-full"
                                    value={selectedProvince}
                                    onChange={(e) => {
                                        setSelectedProvince(e.target.value);
                                        setSelectedDistrict('');
                                        setSelectedWard('');
                                    }}
                                >
                                    <option value="">Chọn tỉnh</option>
                                    {provinces.map(p => (
                                        <option key={p.code} value={p.code}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex-1'>
                                <label className=" font-medium">Huyện</label><br />
                                <select className="border !p-3 rounded w-full"
                                    value={selectedDistrict}
                                    onChange={(e) => {
                                        setSelectedDistrict(e.target.value);
                                        setSelectedWard('');
                                    }}
                                    disabled={!selectedProvince}
                                >
                                    <option value="">Chọn huyện</option>
                                    {districts.map(d => (
                                        <option key={d.code} value={d.code}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex-1'>
                                <label className="font-medium">Xã</label><br />
                                <select className="border !p-3 rounded w-full"
                                    value={selectedWard}
                                    onChange={(e) => setSelectedWard(e.target.value)}
                                    disabled={!selectedDistrict}
                                >
                                    <option value="">Chọn xã</option>
                                    {wards.map(w => (
                                        <option key={w.code} value={w.code}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="!mt-2">
                            <label className="block font-medium">Ghi chú</label>
                            <textarea placeholder="Ghi chú" className="w-full border border-gray-300 !p-1 rounded"></textarea>
                        </div>
                    </div>

                    <div className="content-right !w-[50%]">
                        <div className="content1">
                            <h1 className="text-2xl">Thành tiền</h1>
                            <table className="w-full table-auto border border-gray-200 rounded-md overflow-hidden">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="text-left px-4 py-2">Sản phẩm</th>
                                        <th className="text-left px-4 py-2">Phiên bản</th>
                                        <th className="text-center px-4 py-2">Số lượng</th>
                                        <th className="text-right px-4 py-2">Đơn giá</th>
                                        <th className="text-right px-4 py-2">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {checkoutItems.map((item, idx) => (
                                        <tr key={idx} className="border-t border-gray-200">
                                            <td className="product-name-cell" title={item.product?.name || item.name}>
                                                {item.product?.name || item.name}
                                            </td>
                                            <td className="px-4 py-2">{item.variant?.name_color}</td>
                                            <td className="text-center px-4 py-2">{item.quantity}</td>
                                            <td className="text-right px-4 py-2">
                                                {formatCurrency((item.variant?.price || 0) - (item.variant?.discount || 0))}
                                            </td>
                                            <td className="text-right px-4 py-2">
                                                {formatCurrency(((item.variant?.price || 0) - (item.variant?.discount || 0)) * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-100 font-semibold">
                                        <td colSpan={4} className="text-right px-4 py-3">Tổng tiền:</td>
                                        <td className="text-right px-4 py-3">{formatCurrency(calculateTotal())}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="payment-method mt-4">
                                <label className="payment-label">Phương thức thanh toán:</label>
                                <div className="payment-options mt-2">
                                    <label className="payment-option">
                                        <input type="radio" name="payment" defaultChecked />
                                        <span>Thanh toán trực tiếp</span>
                                    </label>
                                    <label className="payment-option">
                                        <input type="radio" name="payment" />
                                        <span>Thanh toán VNPay</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="mt-6 !bg-[#1f2438] text-white px-4 py-2 rounded w-full">
                                Thanh toán
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default Checkout;
