import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = parseInt(searchParams.get('product_id') || '');

        const cookieStore = await cookies();
        const token = cookieStore.get('jwt-datt')?.value;

        if (!token) return NextResponse.json({ reviewed: false });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const userId = decoded.id;

        const review = await prisma.reviews.findFirst({
            where: { product_id: productId, user_id: userId },
        });

        return NextResponse.json({ reviewed: !!review });
    } catch (err) {
        return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('jwt-datt')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const userId = decoded.id;

        const body = await req.json();
        const { product_id, order_id, rating, comment, images } = body;

        if (!product_id || !order_id || !rating) {
            return NextResponse.json({ message: 'Thiếu dữ liệu' }, { status: 400 });
        }

        const review = await prisma.reviews.create({
            data: {
                product_id,
                order_id,
                rating,
                comment,
                user_id: userId,
                review_images: {
                    create: images?.map((url) => ({ image_url: url })) || [],
                },
            },
            include: {
                review_images: true,
            },
        });

        return NextResponse.json({ review });
    } catch (err) {
        console.error('Lỗi tạo review:', err);
        return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
    }
}
