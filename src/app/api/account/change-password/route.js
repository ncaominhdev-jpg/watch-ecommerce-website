import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export async function PUT(req) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('jwt-datt')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        } catch (err) {
            return NextResponse.json({ message: 'Token không hợp lệ' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Thiếu thông tin mật khẩu' }, { status: 400 });
        }

        const user = await prisma.users.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Mật khẩu hiện tại không đúng' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.users.update({
            where: { id: decoded.id },
            data: {
                password: hashedPassword,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        console.error('❌ Lỗi đổi mật khẩu:', err);
        return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
    }
}
