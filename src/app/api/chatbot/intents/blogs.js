import prisma from "../../../lib/prisma";
import { removeVietnameseTones } from '../utils';

export default async function blogsIntent(msg) {
    console.log("✅ blogsIntent received msg:", msg);
    const processedMsg = removeVietnameseTones(msg).toLowerCase();

    const keywords = [
        'bai viet',
        'blog',
        'tin tuc',
        'bai viet moi',
        'bai viet gan day',
        'xem bai viet',
        'co bai viet nao'
    ];

    if (!keywords.some(k => processedMsg.includes(k))) return null;

    const blogs = await prisma.blogs.findMany({
        where: { status: true },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            short_description: true,
            image_url: true,
        },
        take: 3,
    });

    if (!blogs.length) {
        return {
            reply: "Hiện chưa có bài viết mới.",
            blogs: [],
            type: "blog"
        };
    }

    const titles = blogs.map(b => b.title);

    return {
        reply: "Một số bài viết mới nhất, vui lòng xem chi tiết:",
        blogs,
        type: "blog"
    };
}
