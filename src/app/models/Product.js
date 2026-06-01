import Sequelize, { Model } from "sequelize";

class Product extends Model {
    static init(sequelize) {
        super.init({
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            brand: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            color: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            old_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            discount_percentage: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            path: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            image_paths: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            stock_quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            installments_enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            installments_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 10,
            },
            weight: {
                type: Sequelize.DECIMAL(10, 3),
                allowNull: false,
                defaultValue: 0.4,
            },
            width: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 16,
            },
            height: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 6,
            },
            length: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 18,
            },
            available_colors: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            frame_material: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            size_label: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            lens_width_mm: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            bridge_mm: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            temple_length_mm: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            gender: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        }, {
            sequelize,
            tableName: 'products',
            underscored: true,
        });
    }

    static associate(models) {
        this.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
        this.hasMany(models.OrderItem, { foreignKey: 'product_id', as: 'order_items' });
    }
}

export default Product;
