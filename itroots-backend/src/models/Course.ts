import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Course extends Model { }
interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    slug: string;
    price: number;
    category: string;
    isPublished: boolean;
    instructorId: string;
}

Course.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        thumbnail: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        instructorId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Course',
        tableName: 'courses',
        timestamps: true,
    }
);

// Define associations
Course.belongsTo(User, { as: 'instructor', foreignKey: 'instructorId' });
User.hasMany(Course, { as: 'courses', foreignKey: 'instructorId' });

export default Course;
