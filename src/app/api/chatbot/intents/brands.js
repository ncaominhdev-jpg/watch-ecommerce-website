import prisma from '../../../lib/prisma';
import { removeVietnameseTones } from '../utils';

export default async function brandsIntent(msg) {
    const processedMsg = removeVietnameseTones(msg).toLowerCase();

    const keywords = [
        'thuong hieu nao',
        'thuong hieu',
        'brand',
        'hang nao',
        'hang gi',
        'co nhung hang nao',
        'co nhung thuong hieu nao',
        'cac thuong hieu',
        'cac hang',
        'thuong hieu ban',
        'hang ban',
        'cua hang co thuong hieu nao',
        'cua hang co hang nao',
        'dong ho nao',
        'ban co hang dong ho nao',
        'shop co hang dong ho nao',
        'ban ban hang dong ho nao',
        'ban co nhung hang dong ho nao',
        'shop co nhung hang dong ho nao',
        'co hang dong ho nao',
        'co nhung hang dong ho nao'
    ];

    if (!keywords.some(k => processedMsg.includes(k))) return null;

    const brands = await prisma.brands.findMany({
        where: { status: true }
    });

    if (!brands.length) {
        return {
            reply: "Hiện tại cửa hàng chưa có thương hiệu nào khả dụng.",
            options: [],
            type: "brand"
        };
    }

    const names = brands.map(b => b.name);
    return {
        reply: "Hiện tại cửa hàng có các thương hiệu sau, vui lòng chọn:",
        options: names,
        type: "brand"
    };
}
