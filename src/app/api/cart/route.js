import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';

export async function POST(request) {
  try {
    const { product_id, quantity, user_id, product_variant_id } = await request.json();

    const newCart = await prisma.cart.upsert({
      where: {
        user_id_product_variant_id: {
          user_id,
          product_variant_id,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        product_id,
        quantity,
        user_id,
        product_variant_id,
      },
    });

    return NextResponse.json(newCart, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi thêm vào giỏ hàng:', error);
    return NextResponse.json(
      { error: 'Không thể thêm vào giỏ hàng' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt-datt')?.value;

    if (!token) {
      return NextResponse.json([], { status: 200 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;

    const carts = await prisma.cart.findMany({
      where: { user_id },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            product_images: {
              take: 1,
              select: { image_url: true }
            }
          }
        },
        variant: {
          select: {
            name_color: true,
            price: true,
            discount: true
          }
        }
      }
    });

    return NextResponse.json(carts);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách giỏ hàng:", error);
    return NextResponse.json({ error: "Không thể lấy dữ liệu giỏ hàng" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { user_id, product_variant_id } = await request.json();

    const deletedCart = await prisma.cart.delete({
      where: {
        user_id_product_variant_id: {
          user_id,
          product_variant_id,
        },
      },
    });

    return NextResponse.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng', deletedCart });
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    return NextResponse.json(
      { error: 'Không thể xóa sản phẩm khỏi giỏ hàng' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { user_id, product_variant_id, quantity } = await request.json();

    if (!user_id || !product_variant_id || quantity < 1) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }

    const updatedCart = await prisma.cart.update({
      where: {
        user_id_product_variant_id: {
          user_id,
          product_variant_id,
        },
      },
      data: {
        quantity,
      },
    });

    return NextResponse.json({
      message: 'Cập nhật số lượng thành công',
      updatedCart,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật số lượng giỏ hàng:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật giỏ hàng' },
      { status: 500 }
    );
  }
}
