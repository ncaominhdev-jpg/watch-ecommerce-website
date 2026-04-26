import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const id = parseInt(params.id);
  try {
    const contact = await prisma.contacts.findUnique({
      where: { id },
      include:{
        user:{
          select:{
            name:true,
            email:true,
          }
        },
      }
    });

    if (!contact) {
      return NextResponse.json({ error: "Không tìm thấy liên hệ" }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết liên hệ:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const id = parseInt(params.id);
  const {
    reply_message,
    user_id,
  } = await req.json();

  if (!reply_message) {
    return NextResponse.json({ error: "Vui lòng nhập nội dung trả lời." }, { status: 400 });
  }

  try {
    const contact = await prisma.contacts.findUnique({
      where: { id },
    });

    if (!contact) {
      return NextResponse.json({ error: "Không tìm thấy liên hệ." }, { status: 404 });
    }

    const updated = await prisma.contacts.update({
      where: { id },
      data: {
        reply_message,
        user_id,
        status: true,
      },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: 'ĐỒNG HỒ WATCHES CẦN THƠ ',
      to: contact.email,
      subject: "Phản hồi từ đội ngũ hỗ trợ",
      text: `Xin chào ${contact.name},chúng tôi có nhận được câu hỏi của bạn về vấn đề ${contact.title} với câu hỏi:\n 
      ${contact.message}
      \n${reply_message}\n\nTrân trọng,\nĐội ngũ hỗ trợ`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Lỗi trả lời liên hệ:", error);
    return NextResponse.json({ error: "Không thể trả lời liên hệ." }, { status: 500 });
  }
}
