import {
  getAllProducts as getProductsList, getProductWithDetails, createProduct as createProductSvc, updateProduct as updateProductSvc,
  deleteProduct as deleteProductSvc, findProductByName, addToCart, getCart,
  removeFromCart, checkout, buyNow, getCreatorSales
} from "./market.service.js";
import { sendSuccess, sendCreated, sendPaginated, sendError } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import { z } from 'zod';
import prisma from "../../utils/prisma.js";

const approvalSchema = z.object({
  status: z.enum(['approved', 'rejected'])
});

const productSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
  productType: z.enum(['digital', 'physical']).default('physical'),
  fileUrl: z.string().url().optional(),
  fileType: z.string().optional(),
  category: z.string().max(50).optional(),
  metadata: z.record(z.any()).optional()
});

const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1)
});
const buyNowSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  pin: z.string().length(6)
});

// GET /market/products
// Public marketplace listing: only approved products
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const result = await getProductsList((page - 1) * limit, limit);
    return sendPaginated(res, result.products, { page, limit, total: result.total });
  } catch (error) {
    console.error('[getAllProducts] Error:', error);
    return sendError(res, error.message || 'Failed to fetch products', 500);
  }
};

// GET /market/products/:id
export const getProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);
        const product = await getProductWithDetails(id);
        if (!product) return sendError(res, 'Product not found', 404);
        if (product.approval !== 'approved') {
            const isCreator = product.creatorId === req.user?.id;
            const isAdmin = req.user?.type === 'admin' || req.user?.type === 'teacher';
            if (!isCreator && !isAdmin) {
                return sendError(res, 'Product not found', 404);
            }
        }
        return sendSuccess(res, product);
    } catch (error) {
        return sendError(res, 'Failed to fetch product', 500);
    }
};

export const createProduct = async (req, res) => {
    try {
        const body = req.body;
        if (!body) return sendError(res, 'No data provided', 400);

        const schema = z.object({
            name: z.string(),
            description: z.string().optional(),
            price: z.number(),
            stock: z.number().optional(),
            imageUrl: z.string().optional(),
            productType: z.enum(['digital', 'physical']).default('physical'),
            fileUrl: z.string().optional(),
            fileType: z.string().optional(),
            category: z.string().optional(),
            metadata: z.any().optional()
        });

        const validated = schema.parse(body);
        
        if (!req.user) {
            console.error('[createProduct] req.user is missing! Auth middleware might have failed silently.');
            return sendError(res, 'User context missing', 401);
        }

        const isPrivileged = req.user.type === "teacher" || req.user.type === "admin";
        const approval = isPrivileged ? "approved" : "pending";
        
        const metadata = typeof validated.metadata === 'object' ? validated.metadata : {};
        if (validated.category) {
            metadata.category = validated.category;
        }

        const productData = {
            name: validated.name,
            description: validated.description || '',
            price: Number(validated.price),
            stock: validated.productType === 'physical' ? Number(validated.stock || 0) : 999999,
            image: validated.imageUrl || null,
            creatorId: req.user.id,
            approval,
            metadata,
            productType: validated.productType
        };

        if (validated.productType === 'digital' && validated.fileUrl) {
            metadata.fileUrl = validated.fileUrl;
            metadata.fileType = validated.fileType || 'file';
        }

        const product = await createProductSvc(
            productData.name,
            productData.description,
            productData.price,
            productData.stock,
            productData.image,
            productData.creatorId,
            productData.approval,
            productData.metadata,
            productData.productType
        );

        await createAuditLog(req.user.id, 'MARKET', 'CREATE', 'Product', product.id);
        return sendCreated(res, product, 'Product created');
    } catch (error) {
        console.error('[createProduct] CATCH BLOCK:', error);
        
        if (error && (error.name === 'ZodError' || error.constructor?.name === 'ZodError')) {
            return sendError(res, 'Validation failed', 400, error.errors || []);
        }

        return sendError(res, error?.message || 'Failed to create product', 500);
    }
};




// PUT /market/products/:id
export const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return sendError(res, 'Product not found', 404);

    const isCreator = product.creatorId === req.user.id;
    const isPrivileged = req.user.type === 'teacher' || req.user.type === 'admin';

    if (!isPrivileged && !isCreator) {
      return sendError(res, 'Unauthorized to update this product', 403);
    }

    // Regular users can only update if it's pending
    if (!isPrivileged && product.approval !== 'pending') {
      return sendError(res, 'Cannot edit approved product directly. Request an edit review instead.', 403);
    }

    const validated = productSchema.partial().parse(req.body);
    
    // Convert imageUrl to image if present in validated data
    const updateData = { ...validated };
    if (updateData.imageUrl) {
      updateData.image = updateData.imageUrl;
      delete updateData.imageUrl;
    }

    const updated = await updateProductSvc(id, updateData);
    await createAuditLog(req.user.id, 'MARKET', 'UPDATE', 'Product', id, { after: validated });
    return sendSuccess(res, updated, 'Product updated');
  } catch (error) {
    console.error('[updateProduct] Error:', error);
    if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors);
    if (error.code === 'P2025') return sendError(res, 'Product not found', 404);
    return sendError(res, 'Failed to update product', 500);
  }
};

// POST /market/products/:id/request-edit
export const requestProductEdit = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return sendError(res, 'Product not found', 404);

    if (product.creatorId !== req.user.id) {
      return sendError(res, 'Only the creator can request an edit review', 403);
    }

    const validated = productSchema.partial().parse(req.body);
    
    // Store pending changes in metadata
    const metadata = product.metadata || {};
    metadata.pendingEdit = {
      ...validated,
      requestedAt: new Date().toISOString()
    };
    metadata.editStatus = 'pending';

    const updated = await prisma.product.update({
      where: { id },
      data: { metadata }
    });

    await createAuditLog(req.user.id, 'MARKET', 'REQUEST_EDIT', 'Product', id, { changes: validated });
    return sendSuccess(res, updated, 'Edit review requested');
  } catch (error) {
    console.error('[requestProductEdit] Error:', error);
    if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors);
    return sendError(res, 'Failed to request edit review', 500);
  }
};

// DELETE /market/products/:id
export const deleteProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return sendError(res, 'Product not found', 404);

        const isCreator = product.creatorId === req.user.id;
        const isAdmin = req.user.type === 'admin';

        if (!isCreator && !isAdmin) {
            return sendError(res, 'Unauthorized to delete this product', 403);
        }

        await deleteProductSvc(id);
        await createAuditLog(req.user.id, 'MARKET', 'DELETE', 'Product', id);
        return sendSuccess(res, null, 'Product deleted');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Product not found', 404);
        return sendError(res, 'Failed to delete product', 500);
    }
};

// GET /market/products/search?query=...
export const searchProductsHandler = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return sendError(res, 'Search query required', 400);
    const products = await findProductByName(query);
    return sendSuccess(res, products);
  } catch (error) {
    console.error('[searchProductsHandler] Error:', error);
    return sendError(res, error.message || 'Search failed', 500);
  }
};

// GET /market/my-products
// Returns all products created by the current user (any approval status)
export const getMyProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { creatorId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                reviews: { select: { rating: true } },
                orderItems: {
                    select: { quantity: true },
                    where: {
                        order: {
                            OR: [
                                { status: 'completed' },
                                { status: 'delivered' }
                            ]
                        }
                    }
                }
            }
        });

        const productsWithStats = products.map(p => {
            const reviewCount = p.reviews.length;
            const avgRating = reviewCount > 0
                ? parseFloat((p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
                : 0;
            const unitsSold = p.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);

            return {
                ...p,
                rating: avgRating,
                reviewCount,
                unitsSold,
                reviews: undefined,
                orderItems: undefined
            };
        });

        return sendSuccess(res, productsWithStats);
    } catch (error) {
        return sendError(res, 'Failed to fetch your products', 500);
    }
};

// GET /market/sales
export const getSales = async (req, res) => {
    try {
        const sales = await getCreatorSales(req.user.id);
        return sendSuccess(res, sales);
    } catch (error) {
        return sendError(res, 'Failed to fetch sales data', 500);
    }
};

// GET /market/pending
// Returns all products with approval = 'pending' (admin/teacher only)
export const getPendingProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { approval: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { id: true, username: true } } }
    });
    return sendSuccess(res, products);
  } catch (error) {
    console.error('[getPendingProducts] Error:', error);
    return sendError(res, error.message || 'Failed to fetch pending products', 500);
  }
};

// PATCH /market/products/:id/approval
// Approve or reject a product (admin/teacher only)
export const approveProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);

    const validated = approvalSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return sendError(res, 'Product not found', 404);

    const updated = await prisma.product.update({
      where: { id },
      data: { approval: validated.status }
    });

    await createAuditLog(
      req.user.id, 'MARKET',
      validated.status === 'approved' ? 'APPROVE_PRODUCT' : 'REJECT_PRODUCT',
      'Product', id
    );

    return sendSuccess(res, updated, `Product ${validated.status}`);
  } catch (error) {
    if (error.name === 'ZodError') return sendError(res, 'Invalid status. Must be "approved" or "rejected".', 400);
    return sendError(res, 'Failed to update product approval', 500);
  }
};

// POST /market/cart
export const addToCartHandler = async (req, res) => {
  try {
    const validated = cartItemSchema.parse(req.body);
    const cartItem = await addToCart(req.user.id, validated.productId, validated.quantity);
    return sendCreated(res, cartItem, 'Added to cart');
  } catch (error) {
    if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    return sendError(res, 'Failed to add to cart', 500);
  }
};

// GET /market/cart
export const getCartHandler = async (req, res) => {
  try {
    const items = await getCart(req.user.id);
    // Filter out items where product might have been deleted but cart still has ID
    const validItems = items.filter(item => item.product);
    return sendSuccess(res, validItems);
  } catch (error) {
    console.error('[getCartHandler] Error:', error);
    return sendError(res, error.message || 'Failed to fetch cart', 500);
  }
};

// DELETE /market/cart/:productId
export const removeFromCartHandler = async (req, res) => {
  try {
    let cartItemId = parseInt(req.params.cartItemId);

    if (isNaN(cartItemId)) {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) return sendError(res, 'Invalid cart item ID', 400);
      const cartItem = await prisma.cart.findFirst({
        where: {
          userId: req.user.id,
          productId
        },
        select: { id: true }
      });
      if (!cartItem) return sendError(res, 'Cart item not found', 404);
      cartItemId = cartItem.id;
    }

    await removeFromCart(req.user.id, cartItemId);
    return sendSuccess(res, null, 'Removed from cart');
  } catch (error) {
    return sendError(res, error.message || 'Failed to remove from cart', 400);
  }
};

// POST /market/checkout
export const checkoutHandler = async (req, res) => {
  try {
    const { pin } = req.body;
    console.log('[checkoutHandler] Request body:', req.body);
    console.log('[checkoutHandler] Pin received:', pin);
    if (!pin) return sendError(res, 'PIN required for checkout', 400);

    const result = await checkout(req.user.id, pin);
    await createAuditLog(req.user.id, 'MARKET', 'CHECKOUT', 'Order', 'batch');
    return sendSuccess(res, result, 'Checkout successful');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

// POST /market/buy-now
export const buyNowHandler = async (req, res) => {
  try {
    const validated = buyNowSchema.parse(req.body);
    const result = await buyNow(req.user.id, validated.productId, validated.quantity, validated.pin);
    await createAuditLog(req.user.id, 'MARKET', 'BUY_NOW', 'Order', result.id, {
      productId: validated.productId,
      quantity: validated.quantity
    });
    return sendSuccess(res, result, 'Purchase successful');
  } catch (error) {
    if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    return sendError(res, error.message || 'Failed to purchase', 400);
  }
};

// GET /market/themes - Get all approved themes
export const getAllThemes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [themes, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          approval: 'approved',
          metadata: {
            contains: { category: 'theme' }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { username: true, email: true }
          }
        }
      }),
      prisma.product.count({
        where: {
          approval: 'approved',
          metadata: {
            contains: { category: 'theme' }
          }
        }
      })
    ]);

    return sendPaginated(res, themes, { page, limit, total });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return sendError(res, 'Failed to fetch themes', 500);
  }
};

// GET /market/themes/:id - Get a specific theme
export const getTheme = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid theme ID', 400);

    const theme = await prisma.product.findFirst({
      where: {
        id,
        approval: 'approved',
        metadata: {
          contains: { category: 'theme' }
        }
      },
      include: {
        creator: {
          select: { username: true, email: true }
        }
      }
    });

    if (!theme) return sendError(res, 'Theme not found', 404);
    return sendSuccess(res, theme);
  } catch (error) {
    return sendError(res, 'Failed to fetch theme', 500);
  }
};

// GET /market/library - Get user's purchased items (themes, notes, etc.)
export const getLibrary = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const category = req.query.category;
    const skip = (page - 1) * limit;

    // Use the Library model directly
    const libraryItems = await prisma.library.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            creator: { select: { username: true } }
          }
        }
      },
      orderBy: { purchasedAt: 'desc' },
    });

    let allItems = libraryItems.map(item => {
      const p = item.product;
      const metadata = p.metadata || {};
      return {
        id: item.id,
        productId: item.productId,
        name: p.name,
        description: p.description,
        image: p.image,
        category: metadata.category || 'product',
        fileUrl: metadata.fileUrl,
        fileType: metadata.fileType,
        themeConfig: metadata.themeConfig,
        version: metadata.version,
        purchasedAt: item.purchasedAt,
        creator: p.creator?.username || 'Unknown'
      };
    });

    // Filter by category if requested
    if (category && category !== 'all' && category !== 'undefined') {
      allItems = allItems.filter(item => item.category === category);
    }

    const total = allItems.length;
    const paginatedItems = allItems.slice(skip, skip + limit);

    return res.json({
      success: true,
      data: paginatedItems,
      pagination: { page, limit, total }
    });
  } catch (error) {
    console.error('Error in getLibrary:', error);
    return sendError(res, 'Failed to fetch library', 500);
  }
};

// GET /market/library/:productId/download - Get download URL for purchased item
export const getDownloadUrl = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) return sendError(res, 'Invalid product ID', 400);

    // Check if user has purchased this item
    const purchase = await prisma.library.findFirst({
      where: {
        productId,
        userId: req.user.id
      }
    });

    if (!purchase) return sendError(res, 'Item not purchased', 403);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { metadata: true }
    });

    const fileUrl = product?.metadata?.fileUrl;
    if (!fileUrl) return sendError(res, 'Download not available', 404);

    return sendSuccess(res, { url: fileUrl });
  } catch (error) {
    return sendError(res, 'Failed to get download URL', 500);
  }
};

// POST /market/library/:productId/apply - Apply a purchased theme
export const applyTheme = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) return sendError(res, 'Invalid product ID', 400);

    // Check if user has purchased this theme
    const purchase = await prisma.library.findFirst({
      where: {
        productId,
        userId: req.user.id
      },
      include: {
        product: {
          select: { metadata: true }
        }
      }
    });

    if (!purchase) return sendError(res, 'Theme not purchased', 403);

    const category = purchase.product.metadata?.category;
    if (category !== 'theme') return sendError(res, 'Not a theme product', 400);

    // Update or create user preference
    await prisma.userPreference.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        theme: String(productId)
      },
      update: {
        theme: String(productId)
      }
    });

    return sendSuccess(res, { themeId: productId }, 'Theme applied');
  } catch (error) {
    console.error('Error applying theme:', error);
    return sendError(res, 'Failed to apply theme', 500);
  }
};

// GET /market/library/active-theme - Get user's current active theme
export const getActiveTheme = async (req, res) => {
  try {
    const preference = await prisma.userPreference.findUnique({
      where: { userId: req.user.id },
      select: { theme: true }
    });

    if (!preference?.theme) {
      return sendSuccess(res, null);
    }

    const themeId = parseInt(preference.theme);
    if (isNaN(themeId)) {
      return sendSuccess(res, null);
    }

    const theme = await prisma.product.findUnique({
      where: { id: themeId },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        metadata: true
      }
    });

    return sendSuccess(res, theme);
  } catch (error) {
    return sendError(res, 'Failed to get active theme', 500);
  }
};

// GET /market/products/:id/reviews - Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return sendError(res, 'Invalid product ID', 400);

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            username: true,
            userDetails: {
              select: { firstName: true, lastName: true, avatar: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    const totalReviews = reviews.length;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumRating = 0;
    reviews.forEach(r => {
      if (ratingCounts[r.rating] !== undefined) {
        ratingCounts[r.rating]++;
        sumRating += r.rating;
      }
    });
    const averageRating = totalReviews > 0 ? parseFloat((sumRating / totalReviews).toFixed(1)) : 0;

    return sendSuccess(res, {
      reviews,
      stats: {
        averageRating,
        totalReviews,
        ratingCounts
      }
    });
  } catch (error) {
    console.error('[getProductReviews] Error:', error);
    return sendError(res, 'Failed to fetch reviews', 500);
  }
};

// GET /market/products/:id/can-review - Check if user can review (has purchased)
export const checkCanReview = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return sendError(res, 'Invalid product ID', 400);

    // Check if user has purchased this product
    const purchase = await prisma.library.findFirst({
      where: {
        productId,
        userId: req.user.id
      }
    });

    // Also check if user has any order containing this product
    const orderWithProduct = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: req.user.id }
      }
    });

    const hasPurchased = !!purchase || !!orderWithProduct;
    return sendSuccess(res, { hasPurchased });
  } catch (error) {
    console.error('[checkCanReview] Error:', error);
    return sendError(res, 'Failed to check purchase status', 500);
  }
};

// POST /market/products/:id/reviews - Create a review
export const createReview = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return sendError(res, 'Invalid product ID', 400);

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 'Rating must be between 1 and 5', 400);
    }

    // Check if user has purchased the product
    const purchase = await prisma.library.findFirst({
      where: { productId, userId: req.user.id }
    });
    const orderWithProduct = await prisma.orderItem.findFirst({
      where: { productId, order: { userId: req.user.id } }
    });
    const hasPurchased = !!purchase || !!orderWithProduct;

    if (!hasPurchased) {
      return sendError(res, 'You must purchase this product to leave a review', 403);
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId: req.user.id }
    });
    if (existingReview) {
      return sendError(res, 'You have already reviewed this product', 400);
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.id,
        rating,
        comment: comment || ''
      },
      include: {
        user: {
          select: {
            username: true,
            userDetails: { select: { firstName: true, lastName: true, avatar: true } }
          }
        }
      }
    });

    await createAuditLog(req.user.id, 'MARKET', 'CREATE_REVIEW', 'Review', review.id, { productId, rating });
    return sendCreated(res, review, 'Review submitted');
  } catch (error) {
    console.error('[createReview] Error:', error);
    return sendError(res, 'Failed to create review', 500);
  }
};
