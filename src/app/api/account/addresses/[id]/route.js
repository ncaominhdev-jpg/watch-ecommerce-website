import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

export async function GET(req) {
    try {
        // ✅ Lấy token từ cookie
        const cookieStore = await cookies();
        const token = cookieStore.get('jwt-datt')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const userId = decoded.id;

        // ✅ Lấy ID từ URL
        const urlParts = req.url.split('/');
        const addressId = parseInt(urlParts[urlParts.length - 1]);

        if (!addressId || isNaN(addressId)) {
            return NextResponse.json({ message: 'ID không hợp lệ' }, { status: 400 });
        }

        // ✅ Truy vấn và kiểm tra quyền sở hữu
        const address = await prisma.addresses.findFirst({
            where: {
                id: addressId,
                user_id: userId,
            },
        });

        if (!address) {
            return NextResponse.json({ message: 'Không tìm thấy địa chỉ hoặc không có quyền' }, { status: 404 });
        }

        return NextResponse.json({ success: true, address });
    } catch (err) {
        console.error('Lỗi khi lấy địa chỉ:', err);
        return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
    }
}

// PUT: Cập nhật địa chỉ
export async function PUT(req) {
    try {
        // Lấy cookie và giải mã token
        const cookieStore = await cookies();
        const token = cookieStore.get('jwt-datt')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const userId = decoded.id;

        // ✅ Trích xuất ID từ URL
        const urlParts = req.url.split('/');
        const addressId = parseInt(urlParts[urlParts.length - 1]);
        if (!addressId || isNaN(addressId)) {
            return NextResponse.json({ message: 'ID không hợp lệ' }, { status: 400 });
        }

        const { recipient_name, phone, address, province, district, ward, note } = await req.json();
        const fullAddress = `${address}, ${ward}, ${district}, ${province}`;

        // Kiểm tra quyền sở hữu
        const existing = await prisma.addresses.findFirst({
            where: { id: addressId, user_id: userId },
        });

        if (!existing) {
            return NextResponse.json({ message: 'Không tìm thấy địa chỉ hoặc không có quyền' }, { status: 404 });
        }

        // Cập nhật địa chỉ
        const updated = await prisma.addresses.update({
            where: { id: addressId },
            data: {
                recipient_name,
                phone,
                address: fullAddress,
                note: note || '',
            },
        });

        return NextResponse.json({ success: true, address: updated });
    } catch (err) {
        console.error('Lỗi cập nhật địa chỉ:', err);
        return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
    }
}

// DELETE: Xoá địa chỉ
export async function DELETE(req, context) {
    try {
        const cookieStore = await cookies(); // ✅ Bắt buộc await
        const token = cookieStore.get('jwt-datt')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const userId = decoded.id;

        const params = await context.params; // ✅ Bắt buộc await
        const addressId = parseInt(params?.id || '');

        if (isNaN(addressId)) {
            return NextResponse.json({ message: 'ID không hợp lệ' }, { status: 400 });
        }

        const address = await prisma.addresses.findUnique({
            where: { id: addressId },
        });

        if (!address || address.user_id !== userId) {
            return NextResponse.json({ message: 'Không tìm thấy địa chỉ hoặc không có quyền' }, { status: 403 });
        }

        await prisma.addresses.delete({
            where: { id: addressId },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Lỗi xoá địa chỉ:', err);
        return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
    }
}
