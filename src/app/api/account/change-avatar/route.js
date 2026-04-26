import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        const cookieStore = await cookies(); // ✅ fix ở đây
        const cookie = cookieStore.get('jwt-datt');

        if (!cookie) {
            return NextResponse.json({ message: 'Không xác thực' }, { status: 401 });
        }

        const token = cookie.value;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const userId = decoded.id;

        // ✅ Debug log
        console.log("JWT:", token);
        console.log("Giải mã:", decoded);
        console.log("User ID:", userId);

        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ message: 'Thiếu đường dẫn ảnh' }, { status: 400 });
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                image: image,
                updatedAt: new Date()
            },
        });

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (err) {
        console.error('Lỗi cập nhật ảnh:', err);
        return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
    }
}
