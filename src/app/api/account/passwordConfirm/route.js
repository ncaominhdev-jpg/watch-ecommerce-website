import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email không được bỏ trống' }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Email không tồn tại trong hệ thống' }, { status: 404 });
    }

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    await prisma.users.update({
      where: { email },
      data: { reset_token: token },
    });

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const resetUrl = `${process.env.BASE_URL}/dat-lai-mat-khau?token=${token}`;

    await transporter.sendMail({
      from: `"Yêu cầu đặt lại mật khẩu" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <p>Chào bạn,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu. Hãy nhấn vào nút bên dưới để tiếp tục:</p>
            <div style="text-align: left;  margin: 20px 0;">
              <a href="${resetUrl}" 
                style="background-color: #1f2438; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Đặt lại mật khẩu
              </a>
            </div>
            <p><strong>Lưu ý:</strong> Liên kết này chỉ có hiệu lực trong 5 phút.</p>
            <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
          </div>
  `,
    });

    return NextResponse.json({ message: 'Đã gửi email đặt lại mật khẩu thành công.' });

  } catch (err) {
    console.error('Lỗi gửi email:', err);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống.' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const { newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Thiếu token hoặc mật khẩu mới' }, { status: 400 });
    }
    let decoded;
    try {
     decoded = jwt.verify(token, process.env.JWT_SECRET);

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json({ error: 'Liên kết đặt lại mật khẩu đã hết hạn' }, { status: 401 });
      }

      return NextResponse.json({ error: 'Token không hợp lệ !' }, { status: 401 });
    }

    const { email } = decoded;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || user.reset_token !== token) {
      return NextResponse.json({ error: 'Token không khớp hoặc đã hết hạn' }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: {
        password: hashedPassword,
        reset_token: null,
      },
    });

    return NextResponse.json({ message: 'Mật khẩu đã được cập nhật thành công' });

  } catch (err) {
    console.error('Lỗi cập nhật mật khẩu:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
