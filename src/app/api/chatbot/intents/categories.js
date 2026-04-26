import prisma from '../../../lib/prisma';
import { removeVietnameseTones } from '../utils';

export default async function categoriesIntent(msg) {
    const processedMsg = removeVietnameseTones(msg).toLowerCase();
    console.log('✅ processedMsg:', processedMsg);

    const rawKeywords = [
        'danh muc nao',
        'danh muc',
        'cac danh muc',
        'loai san pham nao',
        'loai san pham',
        'cac loai san pham',
        'loai dong ho nao',
        'loai dong ho',
        'cac loai dong ho',
        'co nhung loai dong ho nao',
        'co nhung loai san pham nao',
        'cua hang co loai nao',
        'cua hang co nhung loai nao',
        'shop co ban loai nao',
        'shop co ban dong ho nao',
        'shop co ban loai dong ho nao',
        'shop co ban nhung loai nao',
        'shop co nhung loai dong ho nao',
        'shop co nhung loai nao'
    ];

    const keywords = rawKeywords.map(k => removeVietnameseTones(k).toLowerCase());
    // console.log('✅ keywords:', keywords);

    const matchKeyword = keywords.find(k => processedMsg.includes(k));
    // console.log('✅ matchKeyword:', matchKeyword);

    if (!matchKeyword) return null;

    const categories = await prisma.categories.findMany({
        where: { status: true }
    });

    const names = categories.map(c => c.name);

    return {
        reply: "Hiện tại cửa hàng có các danh mục sau, vui lòng chọn:",
        options: names,
        type: "category"
    };
}
