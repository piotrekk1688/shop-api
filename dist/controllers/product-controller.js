"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_1 = require("../models/product");
class ProductController {
    getAllProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield product_1.ProductModel.find();
                res.json(products);
            }
            catch (error) {
                console.error('Failed to get products', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const product = yield product_1.ProductModel.findById(id);
                if (!product) {
                    res.status(404).json({ error: 'Product not found' });
                }
                else {
                    res.status(201).json(product);
                }
            }
            catch (error) {
                console.error(`Failed to get product with id ${id}`, error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    createProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, price } = req.body;
            if (!name || !price) {
                res.status(400).json({ error: 'Invalid request' });
                return;
            }
            const product = new product_1.ProductModel({ name, price });
            try {
                const savedProduct = yield product.save();
                res.status(201).json(savedProduct);
            }
            catch (error) {
                console.error('Failed to save product', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    removeProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const deletedProduct = yield product_1.ProductModel.findByIdAndDelete(id);
                if (!deletedProduct) {
                    res.status(404).json({ error: 'Product not found' });
                }
                else {
                    res.json({ message: 'Product deleted successfully' });
                }
            }
            catch (error) {
                console.error(`Failed to delete product with id ${id}`, error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}
exports.ProductController = ProductController;
