import prisma from "../../utils/prisma.js";
import { awardAchievement } from "../achievement/achievement.service.js";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const getAllProducts = async (skip = 0, take = 10) => {
    const [products, total] = await prisma.$transaction([
        prisma.product.findMany({
            where: { approval: "approved" },
            skip: parseInt(skip),
            take: parseInt(take),
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: {
                            select: { firstName: true, lastName: true, avatar: true }
                        }
                    }
                },
                reviews: {
                    select: { rating: true }
                }
            }
        }),
        prisma.product.count({ where: { approval: "approved" } })
    ]);

    const productsWithStats = products.map(p => {
        const reviewCount = p.reviews.length;
        const avgRating = reviewCount > 0
            ? parseFloat((p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
            : 0;
        return {
            ...p,
            rating: avgRating,
            reviewCount,
            reviews: undefined
        };
    });

    return { products: productsWithStats, total };
}

const getProductWithDetails = async (id) => {
    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
            creator: {
                select: {
                    id: true,
                    username: true,
                    userDetails: {
                        select: { firstName: true, lastName: true, avatar: true }
                    }
                }
            },
            reviews: {
                select: { rating: true }
            }
        }
    });

    if (!product) return null;

    const reviewCount = product.reviews.length;
    const avgRating = reviewCount > 0
        ? parseFloat((product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 0;

    return {
        ...product,
        rating: avgRating,
        reviewCount,
        reviews: undefined
    };
}

const createProduct = async (name, description, price, stock, image, creatorId, approval = "pending", metadata = {}, productType = "physical") => {
    const product = await prisma.product.create({
        data: {
            name,
            description,
            price,
            stock,
            image,
            creatorId,
            approval,
            metadata,
            productType
        }
    })
    return product;
}

const updateProduct = async (id, data) => {
    return await prisma.product.update({
        where: { id: parseInt(id) },
        data: data
    });
};

const deleteProduct = async (id) => {
    return await prisma.product.delete({
        where: { id: parseInt(id) }
    });
};

const findProductByName = async (name) => {
    return await prisma.product.findMany({
        where: {
            name: {
                contains: name,
                mode: 'insensitive'
            },
            approval: "approved"
        }
    });
};

const addToCart = async (userId, productId, quantity = 1) => {
    const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) }
    });

    if (!product) throw new Error("Product not found");
    if (product.stock < quantity) throw new Error("Insufficient stock");

    const existingItem = await prisma.cart.findFirst({
        where: {
            userId: userId,
            productId: parseInt(productId)
        }
    });

    if (existingItem) {
        return await prisma.cart.update({
            where: { id: existingItem.id },
            data: {
                quantity: existingItem.quantity + quantity
            }
        });
    }

    return await prisma.cart.create({
        data: {
            userId,
            productId: parseInt(productId),
            quantity,
            price: Number(product.price)
        }
    });
};

const getCart = async (userId) => {
    return await prisma.cart.findMany({
        where: { userId },
        include: {
            product: {
                select: {
                    name: true,
                    description: true,
                    image: true,
                    price: true,
                    stock: true,
                    productType: true
                }
            }
        }
    });
};

const removeFromCart = async (userId, cartItemId) => {
    const item = await prisma.cart.findUnique({
        where: { id: parseInt(cartItemId) }
    });

    if (!item || item.userId !== userId) {
        throw new Error("Cart item not found or unauthorized");
    }

    return await prisma.cart.delete({
        where: { id: parseInt(cartItemId) }
    });
};

const getCreatorSales = async (userId) => {
    const products = await prisma.product.findMany({
        where: { creatorId: userId },
        include: {
            reviews: { select: { rating: true } },
            orderItems: {
                include: {
                    order: {
                        select: {
                            userId: true,
                            orderDate: true,
                            status: true
                        }
                    }
                }
            }
        }
    });

    let totalEarnings = 0;
    let digitalUnits = 0;
    let digitalRevenue = 0;
    let physicalUnits = 0;
    let physicalRevenue = 0;

    const productBreakdown = products.map(p => {
        const unitsSold = p.orderItems.reduce((sum, oi) => {
            if (oi.order.status === 'completed' || oi.order.status === 'delivered') {
                return sum + oi.quantity;
            }
            return sum;
        }, 0);
        const revenue = unitsSold * Number(p.price);
        const reviewCount = p.reviews.length;
        const avgRating = reviewCount > 0
            ? parseFloat((p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
            : 0;

        totalEarnings += revenue;

        if (p.productType === 'digital') {
            digitalUnits += unitsSold;
            digitalRevenue += revenue;
        } else {
            physicalUnits += unitsSold;
            physicalRevenue += revenue;
        }

        return {
            productId: p.id,
            name: p.name,
            productType: p.productType,
            unitsSold,
            revenue,
            avgRating,
            reviewCount
        };
    });

    const allTransactions = products.flatMap(p =>
        p.orderItems
            .filter(oi => oi.order.status === 'completed' || oi.order.status === 'delivered')
            .map(oi => ({
                buyer: oi.order.userId,
                product: p.name,
                date: oi.order.orderDate,
                amount: Number(oi.price) * oi.quantity,
                productType: p.productType
            }))
    ).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50);

    return {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        productBreakdown,
        recentTransactions: allTransactions,
        digitalSales: { units: digitalUnits, revenue: parseFloat(digitalRevenue.toFixed(2)) },
        physicalSales: { units: physicalUnits, revenue: parseFloat(physicalRevenue.toFixed(2)) }
    };
};

const checkout = async (userId, pin) => {
    return await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new Error("Wallet not configured");

        let pinMatch = false;
        if (wallet.pin && wallet.pin.length > 6) {
            pinMatch = await bcrypt.compare(pin, wallet.pin);
        } else {
            pinMatch = wallet.pin === pin;
        }
        if (!pinMatch) throw new Error("Invalid Wallet PIN");

        const cartItems = await tx.cart.findMany({
            where: { userId },
            include: { product: true }
        });

        if (cartItems.length === 0) throw new Error("Cart is empty");

        let totalAmount = 0;
        const digitalItems = [];
        const physicalItems = [];

        for (const item of cartItems) {
            if (item.product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.product.name}`);
            }

            const alreadyOwned = await tx.library.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId: item.productId
                    }
                }
            });

            if (item.product.productType === 'digital' && alreadyOwned) {
                throw new Error(`You already own "${item.product.name}". Remove it from your cart.`);
            }

            totalAmount += parseFloat(String(item.product.price)) * item.quantity;

            if (item.product.productType === 'digital') {
                digitalItems.push(item);
            } else {
                physicalItems.push(item);
            }
        }

        const balanceNum = parseFloat(String(wallet.balance));
        if (balanceNum < totalAmount) {
            throw new Error("Insufficient wallet balance");
        }

        await tx.wallet.update({
            where: { userId },
            data: { balance: { decrement: totalAmount } }
        });

        const orderItemsData = cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            deliveryStatus: item.product.productType === 'physical' ? 'pending' : 'delivered'
        }));

        const hasPhysical = physicalItems.length > 0;
        const hasDigital = digitalItems.length > 0;

        let orderStatus = 'completed';
        let orderType = 'digital';
        let qrCode = null;

        if (hasPhysical && hasDigital) {
            orderStatus = 'order_placed';
            orderType = 'mixed';
            qrCode = randomUUID();
        } else if (hasPhysical) {
            orderStatus = 'order_placed';
            orderType = 'physical';
            qrCode = randomUUID();
        }

        const order = await tx.order.create({
            data: {
                userId,
                totalAmount,
                status: orderStatus,
                orderType,
                qrCode,
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        for (const item of digitalItems) {
            await tx.library.upsert({
                where: {
                    userId_productId: {
                        userId,
                        productId: item.productId
                    }
                },
                create: {
                    userId,
                    productId: item.productId,
                    purchasedAt: new Date()
                },
                update: {
                    purchasedAt: new Date()
                }
            });

            const creatorWallet = await tx.wallet.findUnique({
                where: { userId: item.product.creatorId }
            });

            if (creatorWallet) {
                const itemTotal = parseFloat(String(item.product.price)) * item.quantity;
                await tx.wallet.update({
                    where: { userId: item.product.creatorId },
                    data: { balance: { increment: itemTotal } }
                });

                await tx.transactionHistory.create({
                    data: {
                        userId: item.product.creatorId,
                        amount: itemTotal,
                        type: 'credit',
                        status: 'success',
                        category: 'other',
                        note: `Digital product sale: ${item.product.name}`,
                        referenceId: String(order.id)
                    }
                });
            }
        }

        if (hasPhysical) {
            const physicalTotal = physicalItems.reduce((sum, item) => {
                return sum + (parseFloat(String(item.product.price)) * item.quantity);
            }, 0);

            await tx.wallet.update({
                where: { userId },
                data: { heldBalance: { increment: physicalTotal } }
            });

            const sellerIds = [...new Set(physicalItems.map(i => i.product.creatorId))];
            for (const sellerId of sellerIds) {
                await tx.notification.create({
                    data: {
                        userId: sellerId,
                        title: 'New Order Placed',
                        message: `A buyer has ordered your physical product(s). Check your orders to prepare for delivery.`,
                        type: 'market',
                        relatedId: String(order.id)
                    }
                });
            }
        }

        for (const item of cartItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
            });
        }

        await tx.cart.deleteMany({ where: { userId } });

        await tx.transactionHistory.create({
            data: {
                userId,
                amount: totalAmount,
                type: 'debit',
                status: 'success',
                note: `Order #${order.id} Payment`
            }
        });

        await tx.auditLog.create({
            data: {
                user: { connect: { id: userId } },
                category: "MARKET",
                action: "CHECKOUT",
                entity: "Order",
                entityId: String(order.id)
            }
        });

        await awardAchievement(userId, "First Purchase");

        return { order, qrCode };
    });
};

const buyNow = async (userId, productId, quantity, pin) => {
    return await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new Error("Wallet not configured");

        let pinMatch = false;
        if (wallet.pin && wallet.pin.length > 6) {
            pinMatch = await bcrypt.compare(pin, wallet.pin);
        } else {
            pinMatch = wallet.pin === pin;
        }
        if (!pinMatch) throw new Error("Invalid Wallet PIN");

        const product = await tx.product.findUnique({
            where: { id: parseInt(productId, 10) },
            include: { creator: true }
        });
        if (!product) throw new Error("Product not found");
        if (product.stock < quantity) throw new Error("Insufficient stock");

        if (product.productType === 'digital') {
            const alreadyOwned = await tx.library.findUnique({
                where: {
                    userId_productId: { userId, productId: product.id }
                }
            });
            if (alreadyOwned) {
                throw new Error(`You already own "${product.name}". Check your Library.`);
            }
        }

        const totalAmount = Number(product.price) * quantity;
        if (parseFloat(String(wallet.balance)) < totalAmount) throw new Error("Insufficient wallet balance");

        await tx.wallet.update({
            where: { userId },
            data: { balance: { decrement: totalAmount } }
        });

        let orderStatus = 'completed';
        let orderType = product.productType;
        let qrCode = null;

        if (product.productType === 'physical') {
            orderStatus = 'order_placed';
            qrCode = randomUUID();
        }

        const order = await tx.order.create({
            data: {
                userId,
                totalAmount,
                status: orderStatus,
                orderType,
                qrCode,
                items: {
                    create: [
                        {
                            productId: product.id,
                            quantity,
                            price: product.price,
                            deliveryStatus: product.productType === 'physical' ? 'pending' : 'delivered'
                        }
                    ]
                }
            },
            include: { items: true }
        });

        if (product.productType === 'digital') {
            await tx.library.upsert({
                where: {
                    userId_productId: { userId, productId: product.id }
                },
                create: { userId, productId: product.id, purchasedAt: new Date() },
                update: { purchasedAt: new Date() }
            });

            const creatorWallet = await tx.wallet.findUnique({
                where: { userId: product.creatorId }
            });

            if (creatorWallet) {
                await tx.wallet.update({
                    where: { userId: product.creatorId },
                    data: { balance: { increment: totalAmount } }
                });

                await tx.transactionHistory.create({
                    data: {
                        userId: product.creatorId,
                        amount: totalAmount,
                        type: 'credit',
                        status: 'success',
                        category: 'other',
                        note: `Digital product sale: ${product.name}`,
                        referenceId: String(order.id)
                    }
                });
            }
        } else {
            await tx.wallet.update({
                where: { userId },
                data: { heldBalance: { increment: totalAmount } }
            });

            await tx.notification.create({
                data: {
                    userId: product.creatorId,
                    title: 'New Order Placed',
                    message: `${product.name} has been ordered. Check your orders to prepare for delivery.`,
                    type: 'market',
                    relatedId: String(order.id)
                }
            });
        }

        await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: quantity } }
        });

        await tx.transactionHistory.create({
            data: {
                userId,
                amount: totalAmount,
                type: "debit",
                status: "success",
                note: `Buy now order #${order.id} payment`
            }
        });

        await tx.auditLog.create({
            data: {
                user: { connect: { id: userId } },
                category: "MARKET",
                action: "BUY_NOW",
                entity: "Order",
                entityId: String(order.id)
            }
        });

        await awardAchievement(userId, "First Purchase");

        return { order, qrCode };
    });
};

export {
    getAllProducts,
    getProductWithDetails,
    createProduct,
    updateProduct,
    deleteProduct,
    findProductByName,
    addToCart,
    getCart,
    removeFromCart,
    checkout,
    buyNow,
    getCreatorSales
}
