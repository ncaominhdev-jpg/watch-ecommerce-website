import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getUserFromToken } from '../../../../../lib/auth';

export async function PATCH(req, context) {
    try {
        const { orderId } = await context.params;
        const parsedOrderId = parseInt(orderId);
        if (isNaN(parsedOrderId)) {
            return NextResponse.json({ message: 'ID đơn hàng không hợp lệ' }, { status: 400 });
        }

        const decoded = await getUserFromToken();
        const userId = decoded.id;

        const order = await prisma.orders.findUnique({
            where: { id: parsedOrderId },
        });

        if (!order || order.user_id !== userId) {
            return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
        }

        if (order.status !== 'pending') {
            return NextResponse.json({ message: 'Chỉ huỷ được đơn hàng đang chờ xác nhận' }, { status: 400 });
        }

        const updated = await prisma.orders.update({
            where: { id: parsedOrderId },
            data: {
                status: 'canceled',
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, order: updated });
    } catch (err) {
        console.error('Lỗi huỷ đơn hàng:', err.message);
        return NextResponse.json({ message: err.message || 'Lỗi máy chủ' }, { status: 500 });
    }
}
