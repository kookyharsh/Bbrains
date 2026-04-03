import prisma from '../../utils/prisma.js';

export const getOrdersByUser = async (userId, skip = 0, take = 20) => {
    const [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
            where: { userId },
            skip, take,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                price: true,
                                productType: true,
                                metadata: true
                            }
                        }
                    }
                }
            },
            orderBy: { orderDate: 'desc' }
        }),
        prisma.order.count({ where: { userId } })
    ]);
    return { orders, total };
};

export const getOrderById = async (id, userId = null) => {
    const where = { id };
    if (userId) where.userId = userId;

    return await prisma.order.findUnique({
        where,
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            price: true,
                            productType: true,
                            metadata: true,
                            creatorId: true
                        }
                    }
                }
            },
            user: {
                select: {
                    id: true,
                    username: true,
                    userDetails: {
                        select: { firstName: true, lastName: true, avatar: true }
                    }
                }
            }
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
                items: {
                    include: {
                        product: { select: { name: true, price: true, productType: true } }
                    }
                },
                user: { select: { username: true } }
            },
            orderBy: { orderDate: 'desc' }
        }),
        prisma.order.count({ where })
    ]);
    return { orders, total };
};

export const scanAndDeliver = async (orderId, sellerId) => {
    return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
            where: { id: parseInt(orderId) },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    include: { wallet: true }
                }
            }
        });

        if (!order) throw new Error('Order not found');

        if (order.status === 'delivered') {
            throw new Error('Order already delivered');
        }

        if (order.status !== 'order_placed') {
            throw new Error('Order is not in a deliverable state');
        }

        const isSeller = order.items.some(item => item.product.creatorId === sellerId);
        if (!isSeller) {
            throw new Error('You are not the seller of this order');
        }

        const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: {
                status: 'delivered',
                deliveredAt: new Date(),
                items: {
                    updateMany: {
                        where: {
                            orderId: order.id,
                            deliveryStatus: 'pending'
                        },
                        data: { deliveryStatus: 'delivered' }
                    }
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        const physicalTotal = order.items.reduce((sum, item) => {
            if (item.product.productType === 'physical') {
                return sum + (Number(item.product.price) * item.quantity);
            }
            return sum;
        }, 0);

        if (physicalTotal > 0) {
            await tx.wallet.update({
                where: { userId: order.userId },
                data: { heldBalance: { decrement: physicalTotal } }
            });

            const sellerIds = [...new Set(order.items
                .filter(i => i.product.productType === 'physical')
                .map(i => i.product.creatorId))];

            for (const sId of sellerIds) {
                const sellerItems = order.items.filter(i => i.product.creatorId === sId && i.product.productType === 'physical');
                const sellerAmount = sellerItems.reduce((sum, i) => sum + (Number(i.product.price) * i.quantity), 0);

                if (sellerAmount > 0) {
                    await tx.wallet.update({
                        where: { userId: sId },
                        data: { balance: { increment: sellerAmount } }
                    });

                    await tx.transactionHistory.create({
                        data: {
                            userId: sId,
                            amount: sellerAmount,
                            type: 'credit',
                            status: 'success',
                            category: 'other',
                            note: `Physical product sale delivered: Order #${order.id}`,
                            referenceId: String(order.id)
                        }
                    });
                }
            }
        }

        for (const item of order.items) {
            if (item.product.productType === 'physical') {
                await tx.library.upsert({
                    where: {
                        userId_productId: {
                            userId: order.userId,
                            productId: item.productId
                        }
                    },
                    create: {
                        userId: order.userId,
                        productId: item.productId,
                        purchasedAt: new Date()
                    },
                    update: {
                        purchasedAt: new Date()
                    }
                });
            }
        }

        await tx.notification.create({
            data: {
                userId: order.userId,
                title: 'Order Delivered',
                message: `Your order #${order.id} has been delivered. The product is now in your Library.`,
                type: 'market',
                relatedId: String(order.id)
            }
        });

        await tx.auditLog.create({
            data: {
                user: { connect: { id: sellerId } },
                category: 'MARKET',
                action: 'DELIVER_ORDER',
                entity: 'Order',
                entityId: String(order.id)
            }
        });

        return updatedOrder;
    });
};

export const updateOrderStatus = async (id, status) => {
    return await prisma.order.update({
        where: { id },
        data: { status }
    });
};
