import Sequelize, { Model } from "sequelize";

class Category extends Model {
    static init(sequelize) {
        super.init(
            {
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                path: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                slug: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    unique: true,
                },
            },
            {
                sequelize,
                tableName: "categories",
                underscored: true,
            }
        );
    }

    static associate(models) {
        this.hasMany(models.Product, { foreignKey: 'category_id', as: 'products' });
    }
}

export default Category;
