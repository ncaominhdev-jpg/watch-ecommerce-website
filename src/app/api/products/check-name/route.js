import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

function slugify(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
        return NextResponse.json({ exists: false });
    }

    const slug = slugify(name);

    const product = await prisma.products.findFirst({
        where: { slug },
    });

    return NextResponse.json({ exists: !!product });
}
