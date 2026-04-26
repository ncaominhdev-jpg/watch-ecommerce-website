import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split("/").pop());

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Lỗi khi lấy người dùng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
