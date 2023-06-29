"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const products_route_1 = __importDefault(require("./routes/products-route"));
const users_route_1 = __importDefault(require("./routes/users-route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const dbHost = process.env.DB_HOST || '';
mongoose_1.default.connect(dbHost)
    .then(() => {
    console.log('connected to MongoDB');
})
    .catch((error) => {
    console.log('failed to connect to MongoDB', error);
});
app.use(express_1.default.json());
app.use('/products', products_route_1.default);
app.use('/users', users_route_1.default);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
