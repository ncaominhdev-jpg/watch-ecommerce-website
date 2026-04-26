const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

function slugify(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function main() {
  // Xóa dữ liệu cũ 
  await prisma.products.deleteMany();
  await prisma.product_images.deleteMany();
  await prisma.product_variants.deleteMany();

  await prisma.brands.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.users.deleteMany();

  // ===========================[ USERS ]==================================
  const hashPassword = async (plain) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
  };

  const users = [
    {
      name: 'Super Admin',
      email: 'superadmin@gmail.com',
      password: await hashPassword('123456'),
      phone: '0999999999',
      role: 'super_admin',
      status: true,
      image: '/uploads/users/superadmin.jpg',
      reset_token: 'super-token'
    },
    {
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: await hashPassword('123456'),
      phone: '0888888888',
      role: 'admin',
      status: true,
      image: '/uploads/users/admin.jpg',
      reset_token: 'admin-token'
    },
    {
      name: 'Customer One',
      email: 'customer1@gmail.com',
      password: await hashPassword('123456'),
      phone: '0777777777',
      role: 'customers',
      status: true,
      image: '/uploads/users/customer1.jpg',
      reset_token: 'cust1-token'
    }
  ];

  const createdUsers = [];
  for (const user of users) {
    createdUsers.push(await prisma.users.create({ data: user }));
  }

  // ===========================[ CATEGORIES ]==================================
  const categoriesData = [
    { name: "Đồng hồ nam", image: "https://res.cloudinary.com/dovmddijy/image/upload/v1753807490/s9lzxzucutwhosp2msmr.jpg" },
    { name: "Đồng hồ nữ", image: "https://res.cloudinary.com/dovmddijy/image/upload/v1753807549/sgawas7uhu8btrbf9cz7.jpg" },
    { name: "Thể thao", image: "https://res.cloudinary.com/dovmddijy/image/upload/v1753807244/tzyrwcuwopelzdzxpxcl.jpg" },
    { name: "Thông minh", image: "https://res.cloudinary.com/dovmddijy/image/upload/v1753807352/ycu0vuvkghj7enoujqhf.jpg" }
  ];

  const categories = await Promise.all(
    categoriesData.map(cat =>
      prisma.categories.create({
        data: {
          name: cat.name,
          slug: slugify(cat.name),
          status: true,
          image: cat.image
        }
      })
    )
  );

  // ===========================[ BRANDS ]==================================
  const brandsData = [
    {
      name: 'Seiko',
      slug: 'seiko',
      description: 'Thương hiệu đồng hồ Nhật Bản chất lượng cao.',
      logo_url: 'https://res.cloudinary.com/dovmddijy/image/upload/v1753808022/wccykvonssf1pjrwgyss.avif',
      status: true,
    },
    {
      name: 'Casio',
      slug: 'casio',
      description: 'Đồng hồ Casio được yêu thích bởi thiết kế đơn giản và độ bền cao.',
      logo_url: 'https://res.cloudinary.com/dovmddijy/image/upload/v1753807954/dgpi08wkrsvwe4rdskd2.avif',
      status: true,
    },
    {
      name: 'KOI',
      slug: 'koi',
      description: 'Được định vị là “KOI Watch – Dẫn đầu về chất lượng và thời trang”.',
      logo_url: 'https://res.cloudinary.com/dovmddijy/image/upload/v1753808874/ldefgfwnebxkwyslzovf.avif',
      status: true,
    },
    {
      name: 'SAGA',
      slug: 'saga',
      description: 'Saga là thương hiệu thời trang đến từ Mỹ với phong cách tinh tế.',
      logo_url: 'https://res.cloudinary.com/dovmddijy/image/upload/v1753808904/iwyeots3wxrcrvjsjyfm.avif',
      status: true,
    },
    {
      name: 'Citizen',
      slug: 'citizen',
      description: 'Citizen là thương hiệu đồng hồ Nhật Bản được thành lập vào năm 1918.',
      logo_url: 'https://res.cloudinary.com/dovmddijy/image/upload/v1753808936/lcosvvswa5unkdngqdvq.avif',
      status: true,
    },
    {
      name: 'Orient',
      slug: 'orient',
      description: 'Orient – Thương hiệu đồng hồ nổi bật thuộc Seiko với giá cả hợp lý.',
      logo_url: 'https://res.cloudinary.com/dovmddijy/image/upload/v1753808972/uqzxqfd5khohdzcgyrke.avif',
      status: true,
    },];

  const brands = [];
  for (const brand of brandsData) {
    brands.push(await prisma.brands.create({ data: brand }));
  }

  // ===========================[ PRODUCTS + IMAGES + VARIANTS ]==================================
  const productsData = [
    {
      name: "Apple Watch SE 2 2024 40mm (GPS) Viền Nhôm Dây Cao Su",
      slug: "apple-watch-se-2-2024-40mm-gps-vien-nhom-day-cao-su",
      price: 2800000,
      short_description: "Apple Watch SE 2 2024 40mm viền nhôm dây cao su mang đến thiết kế mới mẻ với kích thước 40mm cùng bộ kính cường lực Ion-X cứng cáp. Sử dụng con chip S8 SiP cùng khả năng theo dõi nhịp tim, cùng nhiều tính năng như theo dõi giấc ngủ, phát hiện té ngã Apple Watch SE 2024 sẽ giúp bạn theo dõi sức khỏe liên tục cả ngày.",
      description: "Apple Watch SE 2 2024 40mm viền nhôm dây cao su mang đến thiết kế mới mẻ với kích thước 40mm cùng bộ kính cường lực Ion-X cứng cáp. Sử dụng con chip S8 SiP cùng khả năng theo dõi nhịp tim, cùng nhiều tính năng như theo dõi giấc ngủ, phát hiện té ngã Apple Watch SE 2024 sẽ giúp bạn theo dõi sức khỏe liên tục cả ngày.",
      status: true,
      category_id: 4,
      brand_id: 1,
      images: [
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753813490/uha1er8xq6ylf1phnpwx.webp",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753813491/tlyf1dfg6g7l7sb2boc6.webp",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753813492/ilsv5b6fi4uc3qae5rl6.webp",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753813493/kopgp3pvnkbof4tgaznc.webp"
      ],
      variants: [
        { name_color: "Bạc", code_color: "#c0c0c0", quantity: 60, price: 2799000, discount: 550000, status: true },
        { name_color: "Đen", code_color: "#000000", quantity: 15, price: 2799000, discount: 2500000, status: true }
      ]
    },
    {
      name: "Orient Star RE-AU0109L00B",
      slug: "orient-star-re-au0109l00b",
      price: 20180000,
      short_description: "Orient Star Mechanical Contemporary RE-AU0109L00B tôn lên nét quyến rũ nhẹ nhàng màu xanh băng. Phong cách sang trọng đương đại với bộ chuyển động cơ khí in-house trữ cót 50 giờ uy tín, chất lượng cao.",
      description: "Orient Star RE-AU0109L00B...Orient Star Mechanical Contemporary RE-AU0109L00B tôn lên nét quyến rũ nhẹ nhàng màu xanh băng. Phong cách sang trọng đương đại với bộ chuyển động cơ khí in-house trữ cót 50 giờ uy tín, chất lượng cao.",
      status: true,
      category_id: 1,
      brand_id: 6,
      images: [
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753812805/ypoxtgc4k67lu59vuulp.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753812806/yu92djqw0fjv9j1ijklq.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753812807/tigodyujiimqxdrgn6ga.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753812808/kwrzlccumhdkdphyzb00.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753812970/ii0phftagph2h5tqeltn.avif"
      ],
      variants: [
        { name_color: "Nguyên bản", code_color: "#98cfe7", quantity: 40, price: 20180000, discount: 0, status: true },
        { name_color: "Mặt số màu xanh lá", code_color: "#808000", quantity: 15, price: 20180000, discount: 0, status: true },
        { name_color: "Màu cam đất", code_color: "#ff8000", quantity: 15, price: 20180000, discount: 0, status: true }
      ]
    },
    {
      name: "Saga Stella 71836-SVWHBL-2",
      slug: "saga-stella-71836-svwhbl-2",
      price: 4050000,
      short_description: "Mẫu Saga 71836-SVWHBL-2 phiên bản mặt số hình chữ nhật kết hợp nền cọc số la mã tạo nên vẻ ngoài hoài cổ, mặt số trắng với thiết kế họa tiết Guilloche.",
      description: "Mẫu Saga 71836-SVWHBL-2 phiên bản mặt số hình chữ nhật kết hợp nền cọc số la mã tạo nên vẻ ngoài hoài cổ, mặt số trắng với thiết kế họa tiết Guilloche.",
      status: true,
      category_id: 3,
      brand_id: 4,
      images: [
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753811427/svb3fi4yx7gjbtbwhtrd.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753811428/ed1i8o1oigddbz69hmbs.jpg",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753811429/ycljqovvthfz3hjzew8q.jpg",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753811430/nk2gmflnivrunbfx7y1y.avif"
      ],
      variants: [
        { name_color: "Nâu dây da", code_color: "#5A3825", quantity: 20, price: 2600000, discount: 200000, status: true }
      ]
    },
    {
      name: "Casio World Time AE-1200WHD-1AVDF",
      slug: "casio-world-time-ae-1200whd-1avdf",
      price: 1627000,
      short_description: "Đồng hồ nam Casio AE-1200WHD-1AVDF thiết kế mặt số LCD vuông kích thước phong cách quân đội, với những tính năng hiện đại tiện dụng, kết hợp với dây đeo bằng kim loại đem lại vẻ mạnh mẽ cá tính dành cho phái mạnh.",
      description: "Đồng hồ nam Casio AE-1200WHD-1AVDF thiết kế mặt số LCD vuông kích thước phong cách quân đội, với những tính năng hiện đại tiện dụng, kết hợp với dây đeo bằng kim loại đem lại vẻ mạnh mẽ cá tính dành cho phái mạnh.",
      status: true,
      category_id: 2,
      brand_id: 2,
      images: [
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753810068/eq9zayvcn99imnfnnddf.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753810069/jthqjhelmqrf0zlyovtl.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753810071/uvxivzhr5ywm2nw3pwrl.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753810070/box5amemcfyvcncdgo4r.avif"
      ],
      variants: [
        { name_color: "Bạc", code_color: "#C0C0C0", quantity: 20, price: 1627000, discount: 300000, status: true }
      ]
    },
    {
      name: "KOI Sheen MTP-V002GL-7BUDF",
      slug: "koi-sheen-mtp-v002gl-7budf",
      price: 1500000,
      short_description: "KOI Sheen K004.101.64.14.01.11.05 sở hữu mặt số xà cừ cùng 90 viên đá CZ cùng dây ceramic thanh thoát, bộ máy Thụy Sĩ mạnh mẽ, như một chiếc vòng ngọc quý giá dành cho những nàng tiểu thư đài cát và sang trọng.",
      description: "KOI Sheen K004.101.64.14.01.11.05 sở hữu mặt số xà cừ cùng 90 viên đá CZ cùng dây ceramic thanh thoát, bộ máy Thụy Sĩ mạnh mẽ, như một chiếc vòng ngọc quý giá dành cho những nàng tiểu thư đài cát và sang trọng.",
      status: true,
      category_id: 1,
      brand_id: 5,
      images: [
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753810787/wdvodmhczjxzi3l6bjwe.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753810772/hcm5vnbzffrxyvi7aap7.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753810777/wtzswyowlz9a86hd1qz7.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753810773/b0hnajtmo8qjzadabatt.avif"
      ],
      variants: [
        { name_color: "Nâu dây da", code_color: "#5A3825", quantity: 25, price: 1500000, discount: 150000, status: true }
      ]
    },
    {
      name: "Seiko Prospex SSC817P1",
      slug: "seiko-prospex-ssc817p1",
      price: 22000000,
      short_description: "Seiko Prospex Speedtimer SSC817P1 với thiết kế lấy cảm hứng từ di sản đồng hồ chuyên nghiệp của Seiko. Sử dụng bộ máy năng lượng ánh sáng, tích hợp nhiều tính năng hữu ích trong đời sống.",
      description: "Seiko Prospex Speedtimer SSC817P1 với thiết kế lấy cảm hứng từ di sản đồng hồ chuyên nghiệp của Seiko. Sử dụng bộ máy năng lượng ánh sáng, tích hợp nhiều tính năng hữu ích trong đời sống.",
      status: true,
      category_id: 1,
      brand_id: 3,
      images: [
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753813127/pddt8izpn5ycaschxjnk.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753813126/fohszzuvynpq4rvnfacn.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753813128/izm1eedx28l3vckkegk1.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753813129/f1yyqcdmxeo3l6cqibh9.avif",
      ],
      variants: [
        { name_color: "Đen", code_color: "#000000", quantity: 12, price: 22000000, discount: 400000, status: true }
      ]
    },
    {
      name: "Saga nữ 71836-SVWHBL-1",
      slug: "saga-nu-71836-svwhbl-1",
      price: 3700000,
      short_description: "Saga nữ 71836-SVWHBL-1 dây da...",
      description: "Saga nữ...",
      status: true,
      category_id: 3,
      brand_id: 4,
      images: [
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753811429/ycljqovvthfz3hjzew8q.jpg",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753811430/nk2gmflnivrunbfx7y1y.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753811427/svb3fi4yx7gjbtbwhtrd.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753811428/ed1i8o1oigddbz69hmbs.jpg"
      ],
      variants: [
        { name_color: "Đỏ dây da", code_color: "#800000", quantity: 18, price: 3700000, discount: 200000, status: true }
      ]
    },
    {
      name: "KOI Titanium Moonphase",
      slug: "koi-titanium-moonphase",
      price: 18500000,
      short_description: "KOI Moonphase K006.152.65.2.33.11.04 – Kiệt tác Lịch tuần trăng tinh xảo – Máy Thụy Sỹ chất lượng cao chưa từng có với mức giá chưa đến 5 triệu đồng.",
      description: "KOI Moonphase K006.152.65.2.33.11.04 – Kiệt tác Lịch tuần trăng tinh xảo – Máy Thụy Sỹ chất lượng cao chưa từng có với mức giá chưa đến 5 triệu đồng.",
      status: true,
      category_id: 1,
      brand_id: 5,
      images: [
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753814278/slun3jdvvkn6gpzzlp8c.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753814276/ytenqkxem2xoiedwei1b.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753814279/elprvzyhnaoa9u4e7qlg.avif",
        "https://res.cloudinary.com/dovmddijy/image/upload/v1753814277/m0ijwilcykt8hwu5d0ps.avif"
      ],
      variants: [
        { name_color: "Xanh dương", code_color: "#0000FF", quantity: 10, price: 18500000, discount: 500000, status: true }
      ]
    }
  ];

  for (const p of productsData) {
    const product = await prisma.products.create({
      data: {
        name: p.name,
        slug: slugify(p.slug),
        price: p.price,
        short_description: p.short_description,
        description: p.description,
        status: p.status,
        category_id: p.category_id,
        brand_id: p.brand_id,
      },
    });

    await prisma.product_images.createMany({
      data: p.images.map((img) => ({
        product_id: product.id,
        image_url: img,
      })),
    });

    await prisma.product_variants.createMany({
      data: p.variants.map((v) => ({
        product_id: product.id,
        ...v,
      })),
    });
  }
}

main()
  .then(() => {
    console.log(' Seed dữ liệu thành công!');
  })
  .catch((e) => {
    console.error(' Lỗi khi seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
