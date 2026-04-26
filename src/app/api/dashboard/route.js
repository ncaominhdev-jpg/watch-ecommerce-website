import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        //==============[ Tổng doanh thu]================
        const totalRevenue = await prisma.orders.aggregate({
            where: { status: 'delivered' },
            _sum: { total_price: true },
        });

        // //=============[ Tổng số sp đã bán]==============
        const totalProductQuantity = await prisma.order_detail.aggregate({
            where: {
                order: {
                    status: 'delivered',
                },
            },
            _sum: {
                quantity: true,
            },
        });

        const totalProduct = await prisma.products.count();
        const totalCategories = await prisma.categories.count();


        // //==========[ Doanh thu theo tháng 8 tháng gần]================
        const monthlyRevenue = await prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(createdAt, "%Y-%m") as month, 
            SUM(total_price) as revenue 
          FROM orders 
          WHERE status = 'delivered'
          GROUP BY month 
          ORDER BY month DESC 
          LIMIT 8;
        `;

        // //==================[ Giao dịch gần đây]==========================
        const recentOrders = await prisma.orders.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true } },
            },
        });

        // // ====================[Tổng số nhân viên]========================
        const totalAdmin = await prisma.users.count({
            where: {
                role: 'admin',
            },
        });

        const totalSuperAdmin = await prisma.users.count({
            where: {
                role: 'super_admin',
            },
        });
        const totalCustommer = await prisma.users.count({
            where: {
                role: 'customers',
            },
        });

        return NextResponse.json({
            totalRevenue: totalRevenue._sum.total_price || 0,
            totalProductQuantity,
            totalAdmin,
            totalSuperAdmin,
            totalCustommer,
            monthlyRevenue,
            recentOrders,
            totalProduct,
            totalCategories,
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu dashboard:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}
