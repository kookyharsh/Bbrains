import prisma from '../../utils/prisma.js';

export const getOrdersByUser = async (userId, skip = 0, take = 20) => {
    const [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
            where: { userId },
            skip, take,
            include: {
                product: { select: { name: true, price: true, imageUrl: true } }
            },
            orderBy: { orderDate: 'desc' }
        }),
        prisma.order.count({ where: { userId } })
    ]);
    return { orders, total };
};

export const getOrderById = async (id) => {
    return await prisma.order.findUnique({
        where: { id },
        include: {
            product: true,
            user: { select: { id: true, username: true } }
        }
    });
};

export const getAllOrders = async (skip = 0, take = 20, status = null) => {
    const where = status ? { status } : {};
    const [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
            where,
            skip, take,
            include: {
                product: { select: { name: true, price: true } },
                user: { select: { username: true } }
            },
            orderBy: { orderDate: 'desc' }
        }),
        prisma.order.count({ where })
    ]);
    return { orders, total };
};

export const updateOrderStatus = async (id, status) => {
    return await prisma.order.update({
        where: { id },
        data: { status }
    });
};
