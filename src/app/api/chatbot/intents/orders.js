import prisma from "../../../lib/prisma";

export default async function handleOrdersIntent(msg, userId) {
    if (!userId) return "Vui lòng đăng nhập để xem trạng thái đơn hàng của bạn.";

    const orderId = parseInt(msg.match(/\d+/)[0]);
    const order = await prisma.orders.findUnique({
        where: { id: orderId, user_id: parseInt(userId) },
        select: { status: true },
    });

    return order
        ? `Đơn hàng #${orderId} của bạn có trạng thái: ${order.status}`
        : `Không tìm thấy đơn hàng #${orderId}.`;
}
