import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '../../../../../lib/prisma';

export async function GET(_req, context) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('jwt-datt')?.value;

    if (!token) {
      const authHeader = _req.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const userId = decoded.id;

    const { orderId } = context.params; // bỏ await vì params là object trực tiếp
    const parsedOrderId = parseInt(orderId);

    if (isNaN(parsedOrderId)) {
      return NextResponse.json({ message: 'ID đơn hàng không hợp lệ' }, { status: 400 });
    }

    const order = await prisma.orders.findUnique({
      where: { id: parsedOrderId },
      include: {
        order_details: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    product_images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order || order.user_id !== userId) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const items = await Promise.all(
      order.order_details.map(async (item) => {
        const product = item.variant.product;
        const image = product.product_images[0]?.image_url || '';

        const reviewed = await prisma.reviews.findFirst({
          where: {
            user_id: userId,
            product_id: product.id,
            order_id: order.id,
          },
        });

        return {
          id: item.id,
          productId: product.id,
          productName: product.name,
          variantName: item.variant.name_color,
          image,
          quantity: item.quantity,
          price: item.price,
          total_price: item.total_price,
          reviewed: !!reviewed,
        };
      })
    );
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true, phone: true, email: true },
    });

    const formatted = {
      id: order.id,
      user_id: order.user_id,
      name: order.name,
      phone: order.phone,
      email: order.email,
      address: order.address,
      status: order.status,
      total_price: order.total_price,
      note: order.note,
      createdAt: order.createdAt,
      items,
      customer: {
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
      },
    };

    return NextResponse.json({ order: formatted });
  } catch (err) {
    console.error('Lỗi lấy chi tiết đơn hàng:', err);
    return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function PUT(req, context) {
  const { orderId  } = context.params;
  const id = parseInt(orderId);
  const { status } = await req.json();

  try {
    const cookieStore = cookies();
    let token = cookieStore.get("jwt-datt")?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization') || '';
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }
    if (!token) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    const userId = decoded.id;

    const order = await prisma.orders.findUnique({ where: { id } });

    if (!order || order.user_id !== userId) {
      return NextResponse.json({ message: "Không tìm thấy hoặc không có quyền" }, { status: 403 });
    }

    await prisma.orders.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return NextResponse.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
