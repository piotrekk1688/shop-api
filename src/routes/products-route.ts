import { Router } from "express";
import { ProductController } from "../controllers/product-controller";
import { isAdmin } from '../middlewares/is-admin';

const productsRouter = Router();
const productController = new ProductController();

productsRouter.get('/', productController.getAllProducts);
productsRouter.get('/:id', productController.getProductById);
productsRouter.post('/', isAdmin, productController.createProduct);
productsRouter.delete('/:id', isAdmin, productController.removeProduct);

export default productsRouter;