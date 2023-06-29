import { Request, Response, NextFunction } from "express";

export function isAdmin(req: Request, res: Response, netx: NextFunction): void {
    const isAdminUser = true;

    if (isAdminUser) {
        netx();
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
}