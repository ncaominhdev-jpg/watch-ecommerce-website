import brandsIntent from './intents/brands';
import categoriesIntent from './intents/categories';
import productsIntent from './intents/products';
import blogsIntent from './intents/blogs';
import { removeVietnameseTones } from './utils';

export async function POST(req) {
    const { message } = await req.json();
    const msg = removeVietnameseTones(message);

    console.log("Raw message:", message);
    console.log("Processed msg (no tones):", msg);

    const intents = [brandsIntent, categoriesIntent, productsIntent, blogsIntent];

    console.log("✅ Loaded intents:", intents.map(i => i ? i.name : "undefined"));

    for (let intent of intents) {
        if (!intent) {
            console.log("⚠️ Intent undefined, skipping...");
            continue;
        }
        const reply = await intent(msg);
        console.log(`Intent ${intent.name || 'unknown'} reply:`, reply);
        if (reply) {
            return Response.json(reply);
        }
    }

    return Response.json({ reply: "Xin lỗi, tôi không hiểu yêu cầu của bạn. Vui lòng thử lại." });
}
