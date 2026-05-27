import { Sequelize } from "sequelize";
import databaseConfig from "../config/database.cjs";
import User from "../app/models/User.js";
import Product from "../app/models/Product.js";
import Category from "../app/models/Category.js";
import Order from "../app/models/Order.js";
import OrderItem from "../app/models/OrderItem.js";
import Address from "../app/models/Address.js";
import StoreSetting from "../app/models/StoreSetting.js";
import Coupon from "../app/models/Coupon.js";

const models = [User, Product, Category, Order, OrderItem, Address, StoreSetting, Coupon];

class Database {
    constructor() {
        this.init();
    }

    init() {
        this.connection = new Sequelize(databaseConfig);

        models.forEach((model) => model.init(this.connection));
        models.forEach((model) => {
            if (model.associate) {
                model.associate(this.connection.models);
            }
        });
    }
}

export default new Database();
