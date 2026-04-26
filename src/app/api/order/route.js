import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const order = await prisma.orders.findMany({
      orderBy: { id: 'desc' },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", error);
    return NextResponse.json({ error: "Không thể lấy dữ liệu hóa đơn" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const {
      user_id,
      name,
      phone,
      email,
      address,
      status,
      note,
      voucher_code,
      total_price,
      items
    } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Không có sản phẩm trong đơn hàng" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.orders.create({
        data: {
          user_id,
          name,
          phone,
          email,
          address,
          status,
          note,
          voucher_code,
          total_price
        }
      });

      const orderDetails = items.map((item) => ({
        order_id: newOrder.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price,
        total_price: item.total_price
      }));

      await tx.order_detail.createMany({ data: orderDetails });

      for (const item of items) {
        const variant = await tx.product_variants.findUnique({
          where: { id: item.variant_id }
        });

        if (!variant || variant.quantity < item.quantity) {
          throw new Error(`Không đủ hàng cho sản phẩm biến thể ID: ${item.variant_id}`);
        }

        await tx.product_variants.update({
          where: { id: item.variant_id },
          data: {
            quantity: variant.quantity - item.quantity
          }
        });
      }

      for (const item of items) {
        await tx.cart.deleteMany({
          where: {
            user_id: user_id,
            product_variant_id: item.variant_id
          }
        });
      }

      return { order: newOrder, details: orderDetails };
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    return NextResponse.json(
      { error: "Không thể tạo đơn hàng" },
      { status: 500 }
    );
  }
}
