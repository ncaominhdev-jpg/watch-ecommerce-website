import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req) {
    try {
        const cookieStore = cookies(); // không dùng await
        const token = cookieStore.get('jwt-datt')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const userId = decoded.id;

        const addresses = await prisma.addresses.findMany({
            where: { user_id: userId },
            orderBy: { id: 'desc' },
        });

        return NextResponse.json({ success: true, addresses });
    } catch (err) {
        console.error('Lỗi API /addresses:', err);
        return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const cookieStore = await cookies(); // ✅ thêm await
        const cookie = cookieStore.get('jwt-datt'); // ✅ đổi đúng cookie

        if (!cookie) {
            return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
        }

        const token = cookie.value;

        // ✅ giải mã JWT để lấy userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const userId = decoded.id;

        // ✅ lấy dữ liệu từ request
        const body = await req.json();
        const {
            recipient_name,
            phone,
            address,
            province,
            district,
            ward,
            note
        } = body;

        // ✅ ghép địa chỉ
        const fullAddress = `${address}, ${ward}, ${district}, ${province}`;

        const newAddress = await prisma.addresses.create({
            data: {
                user_id: userId,
                recipient_name,
                phone,
                address: fullAddress,
                note: note || ''
            }
        });

        return NextResponse.json({ success: true, address: newAddress }, { status: 201 });
    } catch (err) {
        console.error('Lỗi thêm địa chỉ:', err);
        return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
    }
}
