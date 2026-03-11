import express from 'express';
import {
    getAllProducts, getProduct, createProduct, updateProduct, deleteProduct,
    searchProductsHandler, addToCartHandler, getCartHandler,
    removeFromCartHandler, checkoutHandler, buyNowHandler,
    getMyProducts, getPendingProducts, approveProduct,
    getAllThemes, getTheme, getLibrary, getDownloadUrl, applyTheme, getActiveTheme
} from './market.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Products
router.get('/products', verifyToken, getAllProducts);
router.get('/products/search', verifyToken, searchProductsHandler);
router.get('/products/:id', verifyToken, getProduct);
// Any authenticated user can create products; approval is handled in controller
router.post('/products', verifyToken, createProduct);
router.put('/products/:id', verifyToken, authorize('teacher', 'admin'), updateProduct);
router.delete('/products/:id', verifyToken, authorize('admin'), deleteProduct);

// My Products (any user can see their own)
router.get('/my-products', verifyToken, getMyProducts);

// Pending products & approval (admin/teacher only)
router.get('/pending', verifyToken, authorize('teacher', 'admin'), getPendingProducts);
router.patch('/products/:id/approval', verifyToken, authorize('teacher', 'admin'), approveProduct);

// Themes
router.get('/themes', verifyToken, getAllThemes);
router.get('/themes/:id', verifyToken, getTheme);

// Library (purchased items)
router.get('/library', verifyToken, getLibrary);
router.get('/library/active-theme', verifyToken, getActiveTheme);
router.get('/library/:productId/download', verifyToken, getDownloadUrl);
router.post('/library/:productId/apply', verifyToken, applyTheme);

// Cart
router.get('/cart', verifyToken, getCartHandler);
router.post('/cart', verifyToken, addToCartHandler);
router.delete('/cart/:cartItemId', verifyToken, removeFromCartHandler);
router.delete('/cart/remove/:productId', verifyToken, removeFromCartHandler);

// Checkout
router.post('/checkout', verifyToken, checkoutHandler);
router.post('/buy-now', verifyToken, buyNowHandler);

export default router;
