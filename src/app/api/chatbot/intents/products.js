import prisma from '../../../lib/prisma';
import { removeVietnameseTones } from '../utils';
import Fuse from 'fuse.js';

export default async function productsIntent(msg) {
    try {
        const message = removeVietnameseTones(msg).toLowerCase();

        // === Function detectBrandOrCategory ===
        const detectBrandOrCategory = (list, msg) => {
            const processed = list.map(item => ({
                ...item,
                nameNoTone: removeVietnameseTones(item.name).toLowerCase(),
            }));

            const fuse = new Fuse(processed, {
                keys: ['nameNoTone'],
                threshold: 0.3,
                ignoreLocation: true,
            });

            const fuzzyResults = fuse.search(msg);
            if (fuzzyResults.length && fuzzyResults[0].score < 0.3) {
                return list.find(l => l.id === fuzzyResults[0].item.id);
            }

            for (const item of processed) {
                if (msg.includes(item.nameNoTone)) {
                    return list.find(l => l.id === item.id);
                }
            }

            return null;
        };

        // === Parse price range ===
        const parsePriceValue = (str) => {
            if (!str) return null;
            str = str.replace(/,/g, '').replace(/\s/g, '').toLowerCase();

            const regex = /^(\d+)(\.|,)?(\d+)?(tr|trieu|k)?$/i;
            const match = str.match(regex);
            if (!match) return null;

            let value = 0;
            if (match[4]?.includes('tr')) {
                value = parseInt(match[1]) * 1_000_000;
                if (match[3]) value += parseInt(match[3]) * 100_000;
            } else if (match[4] === 'k') {
                value = parseInt(match[1]) * 1_000;
            } else {
                value = parseInt(match[1]);
                if (value < 1000) value *= 1_000_000;
            }
            return value;
        };

        const parsePriceRange = (msg) => {
            const regexFromTo = /tu\s?([\d\.trk]+)\s?(den|-)\s?([\d\.trk]+)/i;
            const regexUnder = /(duoi|<=|nho hon|it hon)\s?([\d\.trk]+)/i;
            const regexAround = /(tam( gia)?|khoang)\s?([\d\.trk]+)/i;

            let min = null, max = null;
            if (regexFromTo.test(msg)) {
                const match = msg.match(regexFromTo);
                min = parsePriceValue(match[1]);
                max = parsePriceValue(match[3]);
            } else if (regexUnder.test(msg)) {
                const match = msg.match(regexUnder);
                max = parsePriceValue(match[2]);
            } else if (regexAround.test(msg)) {
                const match = msg.match(regexAround);
                const price = parsePriceValue(match[3]);
                if (price) {
                    min = price * 0.8;
                    max = price * 1.2;
                }
            } else {
                const direct = parsePriceValue(msg);
                if (direct) {
                    min = direct * 0.9;
                    max = direct * 1.1;
                }
            }

            return (min || max) ? { min, max } : null;
        };

        const priceRange = parsePriceRange(message);
        console.log('🔎 PriceRange:', priceRange);

        // === detectProductByName (fix includes + fuzzy) ===
        const detectProductByName = async (msg) => {
            const products = await prisma.products.findMany({
                include: {
                    product_variants: { select: { price: true, discount: true } },
                    product_images: { select: { image_url: true } }
                }
            });

            const processed = products.map(p => ({
                ...p,
                nameNoTone: removeVietnameseTones(p.name).toLowerCase(),
            }));

            const processedMsg = removeVietnameseTones(msg).toLowerCase();

            // ✅ Check includes first
            const exactMatch = processed.find(p => processedMsg.includes(p.nameNoTone));
            if (exactMatch) {
                const product = products.find(prod => prod.id === exactMatch.id);
                if (!product.status) {
                    return { notAvailable: true, name: product.name };
                }
                return product;
            }

            // ✅ Fallback to fuzzy
            const fuse = new Fuse(processed, {
                keys: ['nameNoTone'],
                threshold: 0.3,
                ignoreLocation: true,
            });

            const results = fuse.search(processedMsg);

            if (results.length && results[0].score < 0.3) {
                const product = products.find(p => p.id === results[0].item.id);
                if (!product.status) {
                    return { notAvailable: true, name: product.name };
                }
                return product;
            }
            return null;
        };

        // === Load brands & categories ===
        const brands = await prisma.brands.findMany({ where: { status: true } });
        const categories = await prisma.categories.findMany({ where: { status: true } });

        const calcDiscountedPrice = (price, discount) =>
            (!discount || discount <= 0) ? price : price - discount;

        const buildProductList = (products) =>
            products.map(p => {
                const prices = p.product_variants.map(v => calcDiscountedPrice(v.price, v.discount));
                const minPrice = prices.length ? Math.min(...prices) : p.price;
                return {
                    id: p.id,
                    name: p.name,
                    defaultPrice: p.price,
                    minVariantPrice: minPrice,
                    slug: p.slug,
                    image: p.product_images[0]?.image_url || '/no-image.png'
                };
            });

        const queryProducts = async (where) => {
            return await prisma.products.findMany({
                where: { ...where, status: true },
                include: {
                    product_variants: { where: { status: true }, select: { price: true, discount: true } },
                    product_images: { select: { image_url: true } }
                }
            });
        };

        const filterByPriceRange = (products, range) => {
            if (!range) return products;
            return products.filter(p =>
                p.product_variants.some(v => {
                    const finalPrice = calcDiscountedPrice(v.price, v.discount);
                    return finalPrice >= range.min && finalPrice <= range.max;
                })
            );
        };

        // === Return product if found ===
        const foundProduct = await detectProductByName(message);

        if (foundProduct) {
            if (foundProduct.notAvailable) {
                return {
                    reply: `Rất tiếc, sản phẩm ${foundProduct.name} hiện không có sẵn. Vui lòng tham khảo các sản phẩm khác.`
                };
            }

            const prices = foundProduct.product_variants.map(v => calcDiscountedPrice(v.price, v.discount));
            const minPrice = prices.length ? Math.min(...prices) : foundProduct.price;

            return {
                reply: `Đây là thông tin sản phẩm ${foundProduct.name}:`,
                products: [{
                    id: foundProduct.id,
                    name: foundProduct.name,
                    defaultPrice: foundProduct.price,
                    minVariantPrice: minPrice,
                    slug: foundProduct.slug,
                    image: foundProduct.product_images[0]?.image_url || '/no-image.png'
                }],
                seeMoreUrl: `/san-pham/${foundProduct.slug}`
            };
        }

        // === Detect brand & category ===
        const foundBrand = detectBrandOrCategory(brands, message);
        const foundCategory = detectBrandOrCategory(categories, message);

        console.log('🔎 foundBrand:', foundBrand);
        console.log('🔎 foundCategory:', foundCategory);
        console.log('🔎 foundProduct:', foundProduct);

        let products = [];

        if (foundBrand && foundCategory && priceRange) {
            let raw = await queryProducts({ brand_id: foundBrand.id, category_id: foundCategory.id });
            products = filterByPriceRange(raw, priceRange);
            if (products.length) {
                return {
                    reply: `Đây là các sản phẩm ${foundCategory.name} thương hiệu ${foundBrand.name} trong tầm giá bạn quan tâm:`,
                    products: buildProductList(products.slice(0, 5)),
                    seeMoreUrl: `/san-pham?category=${foundCategory.slug}&brand=${foundBrand.slug}&min=${priceRange.min}&max=${priceRange.max}`
                };
            } else {
                raw = await queryProducts({ category_id: foundCategory.id });
                products = filterByPriceRange(raw, priceRange);
                if (products.length) {
                    return {
                        reply: `Hiện không có sản phẩm ${foundCategory.name} thương hiệu ${foundBrand.name} trong tầm giá bạn quan tâm. Đây là các sản phẩm ${foundCategory.name} trong tầm giá bạn quan tâm:`,
                        products: buildProductList(products.slice(0, 5)),
                        seeMoreUrl: `/san-pham?category=${foundCategory.slug}&min=${priceRange.min}&max=${priceRange.max}`
                    };
                }
            }
        }

        if (foundBrand && foundCategory) {
            let raw = await queryProducts({ brand_id: foundBrand.id, category_id: foundCategory.id });
            if (raw.length) {
                return {
                    reply: `Đây là các sản phẩm ${foundCategory.name} thương hiệu ${foundBrand.name}:`,
                    products: buildProductList(raw.slice(0, 5)),
                    seeMoreUrl: `/san-pham?category=${foundCategory.slug}&brand=${foundBrand.slug}`
                };
            } else {
                // ✅ Fallback: Category only (brand khác)
                raw = await queryProducts({ category_id: foundCategory.id });
                if (raw.length) {
                    return {
                        reply: `Rất tiếc, shop hiện không có sản phẩm ${foundCategory.name} thương hiệu ${foundBrand.name}.  
                Đây là các sản phẩm ${foundCategory.name} từ thương hiệu khác mà bạn có thể tham khảo:`,
                        products: buildProductList(raw.slice(0, 5)),
                        seeMoreUrl: `/san-pham?category=${foundCategory.slug}`
                    };
                } else {
                    return {
                        reply: `Rất tiếc, shop hiện không có sản phẩm ${foundCategory.name} thương hiệu ${foundBrand.name}.`,
                        products: [],
                        seeMoreUrl: `/`
                    };
                }
            }
        }

        if (foundBrand && priceRange) {
            let raw = await queryProducts({ brand_id: foundBrand.id });
            products = filterByPriceRange(raw, priceRange);
            if (products.length) {
                return {
                    reply: `Đây là các sản phẩm thương hiệu ${foundBrand.name} trong tầm giá bạn quan tâm:`,
                    products: buildProductList(products.slice(0, 5)),
                    seeMoreUrl: `/san-pham?brand=${foundBrand.slug}&min=${priceRange.min}&max=${priceRange.max}`
                };
            } else if (raw.length) {
                return {
                    reply: `Hiện không có sản phẩm nào của thương hiệu ${foundBrand.name} trong tầm giá ${(priceRange.min / 1e6).toFixed(1)}-${(priceRange.max / 1e6).toFixed(1)} triệu. Đây là các sản phẩm khác của ${foundBrand.name}:`,
                    products: buildProductList(raw.slice(0, 5)),
                    seeMoreUrl: `/san-pham?brand=${foundBrand.slug}`
                };
            } else {
                return {
                    reply: `Hiện không có sản phẩm nào của thương hiệu ${foundBrand.name}.`,
                    products: [],
                    seeMoreUrl: `/san-pham?brand=${foundBrand.slug}`
                };
            }
        }

        if (foundCategory && priceRange) {
            let raw = await queryProducts({ category_id: foundCategory.id });
            products = filterByPriceRange(raw, priceRange);
            if (products.length) {
                return {
                    reply: `Đây là các sản phẩm ${foundCategory.name} trong tầm giá bạn quan tâm:`,
                    products: buildProductList(products.slice(0, 5)),
                    seeMoreUrl: `/san-pham?category=${foundCategory.slug}&min=${priceRange.min}&max=${priceRange.max}`
                };
            } else if (raw.length) {
                // ✅ Nếu có sản phẩm category này nhưng KHÔNG nằm trong priceRange
                return {
                    reply: `Hiện không có sản phẩm ${foundCategory.name} nào trong tầm giá ${(priceRange.min / 1e6).toFixed(1)}-${(priceRange.max / 1e6).toFixed(1)} triệu.  
            Đây là các sản phẩm ${foundCategory.name} khác mà bạn có thể tham khảo:`,
                    products: buildProductList(raw.slice(0, 5)),
                    seeMoreUrl: `/san-pham?category=${foundCategory.slug}`
                };
            } else {
                // ✅ Không có sản phẩm nào thuộc category này
                return {
                    reply: `Rất tiếc, hiện không có sản phẩm nào thuộc danh mục ${foundCategory.name}.`,
                    products: [],
                    seeMoreUrl: `/san-pham?category=${foundCategory.slug}`
                };
            }
        }

        if (foundBrand) {
            const raw = await queryProducts({ brand_id: foundBrand.id });
            if (raw.length) {
                return {
                    reply: `Đây là các sản phẩm của thương hiệu ${foundBrand.name}:`,
                    products: buildProductList(raw.slice(0, 5)),
                    seeMoreUrl: `/san-pham?brand=${foundBrand.slug}`
                };
            }
        }

        if (foundCategory) {
            const raw = await queryProducts({ category_id: foundCategory.id });
            if (raw.length) {
                return {
                    reply: `Đây là các sản phẩm ${foundCategory.name}:`,
                    products: buildProductList(raw.slice(0, 5)),
                    seeMoreUrl: `/san-pham?category=${foundCategory.slug}`
                };
            }
        }

        if (priceRange) {
            const raw = await queryProducts({});
            const filtered = filterByPriceRange(raw, priceRange);
            if (filtered.length) {
                return {
                    reply: `Đây là các sản phẩm trong tầm giá ${(priceRange.min / 1e6).toFixed(1)}-${(priceRange.max / 1e6).toFixed(1)} triệu:`,
                    products: buildProductList(filtered.slice(0, 5)),
                    seeMoreUrl: `/san-pham?min=${priceRange.min}&max=${priceRange.max}`
                };
            }
        }

        return null;

    } catch (error) {
        console.error('❌ Lỗi productsIntent:', error);
        return { reply: 'Đã xảy ra lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại.' };
    }
}
