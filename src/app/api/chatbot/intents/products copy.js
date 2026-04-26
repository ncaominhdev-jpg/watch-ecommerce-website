import prisma from '../../../lib/prisma';
import { removeVietnameseTones } from '../utils';
import Fuse from 'fuse.js';

export default async function productsIntent(msg) {
    try {
        const message = removeVietnameseTones(msg).toLowerCase();

        // Load brands và categories
        const brands = await prisma.brands.findMany({ where: { status: true } });
        const categories = await prisma.categories.findMany({ where: { status: true } });

        console.log(' All categories:', categories.map(c => removeVietnameseTones(c.name).toLowerCase()));
        console.log(' All brands:', brands.map(b => removeVietnameseTones(b.name).toLowerCase()));

        const stopwords = ['toi', 'muon', 'tim', 'dong', 'ho', 'cua', 'la', 'se'];

        // Helper fuzzyMatchAllTokens with exact token + n-gram + fuzzy, and keep original name
        const fuzzyMatchAllTokens = (list, msg) => {
            const options = {
                keys: ['name'],
                threshold: 0.3, // stricter
                ignoreLocation: true,
            };
            const processedList = list.map(item => ({
                ...item,
                nameNoTone: removeVietnameseTones(item.name).toLowerCase(),
            }));
            const fuse = new Fuse(processedList, {
                keys: ['nameNoTone'],
                threshold: options.threshold,
                ignoreLocation: options.ignoreLocation,
                includeScore: true,
            });
            const tokens = msg.split(' ');

            // Match exact bigram
            for (let i = 0; i < tokens.length - 1; i++) {
                const bigram = `${tokens[i]} ${tokens[i + 1]}`;
                const exactBigram = processedList.find(item => item.nameNoTone === bigram);
                if (exactBigram) {
                    console.log(' Exact bigram match:', bigram, '=>', exactBigram.name);
                    return list.find(l => l.id === exactBigram.id);
                }
            }

            // Match exact token (skip stopwords)
            for (let token of tokens) {
                if (stopwords.includes(token)) continue;
                const exact = processedList.find(item => item.nameNoTone.split(' ').includes(token));
                if (exact) {
                    console.log(' Exact token match:', token, '=>', exact.name);
                    return list.find(l => l.id === exact.id);
                }
            }

            // Fuzzy match bigram with score filter
            for (let i = 0; i < tokens.length - 1; i++) {
                const bigram = `${tokens[i]} ${tokens[i + 1]}`;
                const result = fuse.search(bigram);
                if (result.length > 0 && result[0].score < 0.15) {
                    console.log(' Fuzzy bigram match:', bigram, '=>', result[0].item.name, '| score:', result[0].score);
                    return list.find(l => l.id === result[0].item.id);
                }
            }

            // Fuzzy match từng token with score filter
            for (let token of tokens) {
                if (stopwords.includes(token)) continue;
                const result = fuse.search(token);
                if (result.length > 0 && result[0].score < 0.15) {
                    console.log(' Fuzzy token match:', token, '=>', result[0].item.name, '| score:', result[0].score);
                    return list.find(l => l.id === result[0].item.id);
                }
            }

            // Fuzzy match full message with score filter
            const fullResult = fuse.search(msg);
            if (fullResult.length > 0 && fullResult[0].score < 0.2) {
                console.log(' Fuzzy full message match:', msg, '=>', fullResult[0].item.name, '| score:', fullResult[0].score);
                return list.find(l => l.id === fullResult[0].item.id);
            }

            console.log(' Không tìm thấy match cho:', msg);
            return null;
        };

        const foundBrand = fuzzyMatchAllTokens(brands, message);
        const foundCategory = fuzzyMatchAllTokens(categories, message);

        console.log(' FoundBrand:', foundBrand?.name);
        console.log(' FoundCategory:', foundCategory?.name);

        const calcDiscountedPrice = (price, discount) => (!discount || discount <= 0) ? price : price - discount;

        const buildProductList = (products) => {
            return products.map(p => {
                const prices = p.product_variants.map(v => calcDiscountedPrice(v.price, v.discount));
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                const image = p.product_images.length > 0 ? p.product_images[0].image_url : '/no-image.png';

                return {
                    id: p.id,
                    name: p.name,
                    defaultPrice: p.price,
                    minVariantPrice: minPrice,
                    slug: p.slug,
                    image: image
                };
            });
        };

        // Nếu có cả brand + category
        if (foundBrand && foundCategory) {
            const products = await prisma.products.findMany({
                where: { brand_id: foundBrand.id, category_id: foundCategory.id, status: true },
                include: {
                    product_variants: { where: { status: true }, select: { price: true, discount: true } },
                    product_images: { select: { image_url: true } }
                },
                take: 5,
            });

            if (products.length === 0) {
                // fallback tìm category (cặp đôi) với các brand khác
                const productsCategoryOnly = await prisma.products.findMany({
                    where: { category_id: foundCategory.id, status: true },
                    include: {
                        product_variants: { where: { status: true }, select: { price: true, discount: true } },
                        product_images: { select: { image_url: true } }
                    },
                    take: 5,
                });

                if (productsCategoryOnly.length > 0) {
                    return {
                        reply: `Hiện không có sản phẩm ${foundCategory.name} của thương hiệu ${foundBrand.name}. Đây là các sản phẩm ${foundCategory.name} của thương hiệu khác:`,
                        products: buildProductList(productsCategoryOnly),
                        seeMoreUrl: `/category/${foundCategory.slug}`
                    };
                }

                // fallback cuối cùng: chỉ brand nếu vẫn không có category
                const productsBrandOnly = await prisma.products.findMany({
                    where: { brand_id: foundBrand.id, status: true },
                    include: {
                        product_variants: { where: { status: true }, select: { price: true, discount: true } },
                        product_images: { select: { image_url: true } }
                    },
                    take: 5,
                });

                if (productsBrandOnly.length > 0) {
                    return {
                        reply: `Hiện không có sản phẩm ${foundCategory.name} của thương hiệu ${foundBrand.name}. Đây là các sản phẩm khác của ${foundBrand.name}:`,
                        products: buildProductList(productsBrandOnly),
                        seeMoreUrl: `/brand/${foundBrand.slug}`
                    };
                }

                return { reply: `Hiện không có sản phẩm nào của thương hiệu ${foundBrand.name}.` };
            }

            return {
                reply: `Đây là các sản phẩm ${foundCategory.name} thương hiệu ${foundBrand.name}:`,
                products: buildProductList(products),
                seeMoreUrl: `/brand/${foundBrand.slug}?category=${foundCategory.slug}`
            };
        }

        if (foundCategory && !foundBrand) {
            const products = await prisma.products.findMany({
                where: { category_id: foundCategory.id, status: true },
                include: {
                    product_variants: { where: { status: true }, select: { price: true, discount: true } },
                    product_images: { select: { image_url: true } }
                },
                take: 5,
            });

            if (products.length === 0) {
                return { reply: `Hiện chưa có sản phẩm nào trong danh mục ${foundCategory.name}.` };
            }

            return {
                reply: `Đây là các sản phẩm thuộc danh mục ${foundCategory.name}:`,
                products: buildProductList(products),
                seeMoreUrl: `/category/${foundCategory.slug}`
            };
        }

        if (foundBrand && !foundCategory) {
            const products = await prisma.products.findMany({
                where: { brand_id: foundBrand.id, status: true },
                include: {
                    product_variants: { where: { status: true }, select: { price: true, discount: true } },
                    product_images: { select: { image_url: true } }
                },
                take: 5,
            });

            if (products.length === 0) {
                return { reply: `Hiện chưa có sản phẩm nào của thương hiệu ${foundBrand.name}.` };
            }

            return {
                reply: `Đây là các sản phẩm của thương hiệu ${foundBrand.name}:`,
                products: buildProductList(products),
                seeMoreUrl: `/brand/${foundBrand.slug}`
            };
        }

        return null;

    } catch (error) {
        console.error(' Lỗi productsIntent:', error);
        return { reply: 'Đã xảy ra lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại.' };
    }
};
