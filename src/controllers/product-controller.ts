import { Request, Response } from 'express';
import { ProductModel } from '../models/product';

export class ProductController {
    public async getAllProducts(req: Request, res:Response): Promise<void> {
        try {
            const products = await ProductModel.find();
            res.json(products);
        } catch (error) {
            console.error('Failed to get products', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async getProductById(req: Request, res: Response): Promise<void> {
        const id = req.params.id;

        try {
            const product = await ProductModel.findById(id);

            if (!product) {
                res.status(404).json({ error: 'Product not found' });
            } else {
                res.status(201).json(product);
            }
        } catch (error) {
            console.error(`Failed to get product with id ${id}`, error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async createProduct(req: Request, res: Response): Promise<void> {
        const { name, price } = req.body;

        if (!name || !price) {
            res.status(400).json({ error: 'Invalid request' });
            return;
        }

        const product = new ProductModel({ name, price });

        try {
            const savedProduct = await product.save();
            res.status(201).json(savedProduct);
        } catch (error) {
            console.error('Failed to save product', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async removeProduct(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        
        try {
          const deletedProduct = await ProductModel.findByIdAndDelete(id);
        
          if (!deletedProduct) {
            res.status(404).json({ error: 'Product not found' });
          } else {
            res.json({ message: 'Product deleted successfully' });
          }
        } catch (error) {
          console.error(`Failed to delete product with id ${id}`, error);
          res.status(500).json({ error: 'Internal server error' });
        }
    }
}