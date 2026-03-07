import {
  getAllProducts as getProductsList, createProduct as createProductSvc, updateProduct as updateProductSvc,
  deleteProduct as deleteProductSvc, findProductByName, addToCart, getCart,
  removeFromCart, checkout, buyNow
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
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional(),
  category: z.string().max(50).optional()
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
    return sendError(res, 'Failed to fetch products', 500);
  }
};

// GET /market/products/:id
export const getProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return sendError(res, 'Product not found', 404);
    return sendSuccess(res, product);
  } catch (error) {
    return sendError(res, 'Failed to fetch product', 500);
  }
};

// POST /market/products
// Any authenticated user can create a product:
// - student: created with approval = "pending"
// - teacher/admin: created with approval = "approved"
export const createProduct = async (req, res) => {
  try {
    const validated = productSchema.parse(req.body);
    const isPrivileged = req.user.type === "teacher" || req.user.type === "admin";
    const approval = isPrivileged ? "approved" : "pending";
    const product = await createProductSvc(
      validated.name,
      validated.description,
      validated.price,
      validated.stock,
      validated.imageUrl,
      req.user.id,
      approval
    );
    await createAuditLog(req.user.id, 'MARKET', 'CREATE', 'Product', product.id);
    return sendCreated(res, product, 'Product created');
  } catch (error) {
    if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    return sendError(res, 'Failed to create product', 500);
  }
};

// PUT /market/products/:id
export const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);
    const validated = productSchema.partial().parse(req.body);
    const product = await updateProductSvc(id, validated);
    await createAuditLog(req.user.id, 'MARKET', 'UPDATE', 'Product', id, { after: validated });
    return sendSuccess(res, product, 'Product updated');
  } catch (error) {
    if (error.code === 'P2025') return sendError(res, 'Product not found', 404);
    return sendError(res, 'Failed to update product', 500);
  }
};

// DELETE /market/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);
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
    return sendError(res, 'Search failed', 500);
  }
};

// GET /market/my-products
// Returns all products created by the current user (any approval status)
export const getMyProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { creatorId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, products);
  } catch (error) {
    return sendError(res, 'Failed to fetch your products', 500);
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
    return sendError(res, 'Failed to fetch pending products', 500);
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
    return sendSuccess(res, items);
  } catch (error) {
    return sendError(res, 'Failed to fetch cart', 500);
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
