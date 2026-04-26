import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const keyword = searchParams.get('q') || '';

        const products = await prisma.products.findMany({
            where: {
                status: true,
                OR: [
                    { name: { contains: keyword } },
                    {
                        brand: {
                            name: { contains: keyword }
                        }
                    },
                    {
                        category: {
                            name: { contains: keyword }
                        }
                    }
                ]
            },
            include: {
                brand: true,
                category: true,
                product_images: true,
                product_variants: true,
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
        return NextResponse.json({ message: 'Lỗi tìm kiếm sản phẩm' }, { status: 500 });
    }
}
