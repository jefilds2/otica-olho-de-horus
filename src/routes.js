import { Router } from "express";
import UserController from "./app/Controllers/UserController.js";
import SessionController from "./app/Controllers/SessionController.js";
import ProductController from "./app/Controllers/ProductController.js";
import CategoryController from "./app/Controllers/CategoryController.js";
import CheckoutController from "./app/Controllers/CheckoutController.js";
import OrderController from "./app/Controllers/OrderController.js";
import AddressController from "./app/Controllers/AddressController.js";
import ShippingController from "./app/Controllers/ShippingController.js";
import StoreSettingController from "./app/Controllers/StoreSettingController.js";
import CouponController from "./app/Controllers/CouponController.js";
import PasswordResetController from "./app/Controllers/PasswordResetController.js";
import multer from "multer";
import multerConfig from "./config/multer.cjs";
import authMiddleware from "./app/middlewares/auth.js";
import adminMiddleware from "./app/middlewares/admin.js";
import { authRateLimit, writeRateLimit } from "./app/middlewares/rateLimit.js";

const routes = new Router();
const meRoutes = new Router();
const shippingRoutes = new Router();
const checkoutRoutes = new Router();
const adminRoutes = new Router();
const uploud = multer(multerConfig);

routes.post("/users", authRateLimit, UserController.store);
routes.post("/session", authRateLimit, SessionController.store);
routes.get("/recuperar-senha", PasswordResetController.showResetForm);
routes.post("/password/forgot", authRateLimit, PasswordResetController.forgot);
routes.post("/password/reset", authRateLimit, PasswordResetController.reset);
routes.post("/password/reset/submit", authRateLimit, PasswordResetController.resetFromForm);

routes.get("/products", ProductController.index);
routes.get("/categories", CategoryController.index);
routes.get("/store/public-settings", StoreSettingController.showPublic);
routes.get("/melhor-envio/callback", StoreSettingController.handleMelhorEnvioCallback);
routes.get("/checkout/return", CheckoutController.handleCheckoutReturn);
routes.post("/mercado-pago/webhook", OrderController.handleMercadoPagoWebhook);
routes.post("/coupons/validate", writeRateLimit, CouponController.validate);

meRoutes.use(authMiddleware);
meRoutes.get("/", UserController.show);
meRoutes.put("/", writeRateLimit, UserController.update);
meRoutes.put("/password", writeRateLimit, UserController.changePassword);
meRoutes.get("/orders", OrderController.indexMine);
meRoutes.get("/addresses", AddressController.index);
meRoutes.post("/addresses", writeRateLimit, AddressController.store);
meRoutes.put("/addresses/:id", writeRateLimit, AddressController.update);
meRoutes.delete("/addresses/:id", writeRateLimit, AddressController.destroy);
meRoutes.post("/orders/:id/retry-payment", writeRateLimit, CheckoutController.retryPayment);
routes.use("/me", meRoutes);

shippingRoutes.use(authMiddleware);
shippingRoutes.post("/quotes", writeRateLimit, ShippingController.quote);
routes.use("/shipping", shippingRoutes);

checkoutRoutes.use(authMiddleware);
checkoutRoutes.post("/session", writeRateLimit, CheckoutController.createSession);
checkoutRoutes.post("/confirm", writeRateLimit, OrderController.confirmCheckout);
routes.use("/checkout", checkoutRoutes);

adminRoutes.use(authMiddleware, adminMiddleware);
adminRoutes.get("/users", UserController.indexAdmin);
adminRoutes.put("/users/:id", writeRateLimit, UserController.updateAdmin);
adminRoutes.delete("/users/:id", writeRateLimit, UserController.destroyAdmin);
adminRoutes.get("/products", ProductController.indexAdmin);
adminRoutes.get("/coupons", CouponController.indexAdmin);
adminRoutes.post("/coupons", writeRateLimit, CouponController.storeAdmin);
adminRoutes.put("/coupons/:id", writeRateLimit, CouponController.updateAdmin);
adminRoutes.delete("/coupons/:id", writeRateLimit, CouponController.destroyAdmin);
adminRoutes.get("/orders", OrderController.indexAdmin);
adminRoutes.put("/orders/:id", writeRateLimit, OrderController.updateAdmin);
adminRoutes.post("/orders/:id/melhor-envio/prepare", writeRateLimit, OrderController.prepareMelhorEnvioAdmin);
adminRoutes.post("/orders/:id/melhor-envio/checkout", writeRateLimit, OrderController.checkoutMelhorEnvioAdmin);
adminRoutes.post("/orders/:id/melhor-envio/generate", writeRateLimit, OrderController.generateMelhorEnvioAdmin);
adminRoutes.post("/orders/:id/melhor-envio/print", writeRateLimit, OrderController.printMelhorEnvioAdmin);
adminRoutes.post("/orders/:id/melhor-envio/sync", writeRateLimit, OrderController.syncMelhorEnvioAdmin);
adminRoutes.post("/orders/:id/melhor-envio/reset", writeRateLimit, OrderController.resetMelhorEnvioAdmin);
adminRoutes.get("/store-settings", StoreSettingController.show);
adminRoutes.get("/store-settings/melhor-envio/test", StoreSettingController.testMelhorEnvio);
adminRoutes.get("/store-settings/melhor-envio/connect-url", StoreSettingController.getMelhorEnvioAuthorizationUrl);
adminRoutes.post("/store-settings/melhor-envio/disconnect", writeRateLimit, StoreSettingController.disconnectMelhorEnvio);
adminRoutes.put("/store-settings", writeRateLimit, StoreSettingController.update);
routes.use("/admin", adminRoutes);

routes.post("/products", authMiddleware, adminMiddleware, writeRateLimit, uploud.array('files', 3), ProductController.store);
routes.put("/products/:id", authMiddleware, adminMiddleware, writeRateLimit, uploud.array('files', 3), ProductController.update);
routes.delete("/products/:id", authMiddleware, adminMiddleware, writeRateLimit, ProductController.destroy);
routes.post("/categories", authMiddleware, adminMiddleware, writeRateLimit, uploud.single('file'), CategoryController.store);
routes.put("/categories/:id", authMiddleware, adminMiddleware, writeRateLimit, uploud.single('file'), CategoryController.update);
routes.delete("/categories/:id", authMiddleware, adminMiddleware, writeRateLimit, CategoryController.destroy);

export default routes;
