"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
function isAdmin(req, res, netx) {
    const isAdminUser = true;
    if (isAdminUser) {
        netx();
    }
    else {
        res.status(403).json({ error: 'Access denied' });
    }
}
exports.isAdmin = isAdmin;
