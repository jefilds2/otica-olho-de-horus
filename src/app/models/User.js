import Sequelize, { Model } from 'sequelize';

class User extends Model {
    static init(sequelize) {
        super.init({
            name: Sequelize.STRING,
            email: Sequelize.STRING,
            password_hash: Sequelize.STRING,
            cpf: Sequelize.STRING,
            birth_date: Sequelize.DATEONLY,
            phone: Sequelize.STRING,
            whatsapp: Sequelize.STRING,
            cep: Sequelize.STRING,
            street: Sequelize.STRING,
            number: Sequelize.STRING,
            complement: Sequelize.STRING,
            neighborhood: Sequelize.STRING,
            city: Sequelize.STRING,
            state: Sequelize.STRING,
            address_reference: Sequelize.STRING,
            google_id: Sequelize.STRING,
            avatar_path: Sequelize.STRING,
            admin: Sequelize.BOOLEAN,
            is_active: Sequelize.BOOLEAN,
            email_verified_at: Sequelize.DATE,
            last_login_at: Sequelize.DATE,
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        }, {
            sequelize,
            tableName: 'users',
        },
        );
    }

    static associate(models) {
        this.hasMany(models.Order, { foreignKey: 'user_id', as: 'orders' });
        this.hasMany(models.Address, { foreignKey: 'user_id', as: 'addresses' });
    }
}

export default User;
