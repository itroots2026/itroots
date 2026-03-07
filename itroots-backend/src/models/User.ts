import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model { }
interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: 'SUPER_ADMIN' | 'CMS_MANAGER' | 'TEACHER' | 'STUDENT';
    isActive: boolean;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('SUPER_ADMIN', 'CMS_MANAGER', 'TEACHER', 'STUDENT'),
            defaultValue: 'STUDENT',
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
    }
);

export default User;
