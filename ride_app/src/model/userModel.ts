import { DataTypes, Model } from "sequelize";
import { db } from "../DB.config";

export interface UserAttributes {
    id: string;
    email: string;
    password: string;
    role: string;
    salt: string;
    // otp?: number;
    // otp_expiry: Date;
}

export class UserInstance extends Model<UserAttributes> {}

UserInstance.init ({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: {msg: "Email address is required"},
            isEmail: {msg: "Please provide a valid email"}
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Password is required" },
            notEmpty: { msg: "Provide a password" },
        }
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          customValidator: (value: any) => {
            const enums = [
              "rider",
              "driver",
            ];
            if (!enums.includes(value)) {
              throw new Error("Not a valid option");
            }
          },
        },
      },
    salt: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Salt is required" },
          notEmpty: { msg: "Provide a salt" },
        },
    },
    // otp: {
    //     type: DataTypes.INTEGER,
    //     allowNull: true, 
    // },
    // otp_expiry: {
    //     type: DataTypes.DATE,
    //     allowNull: false,
    //     validate: {
    //       notNull: { msg: "OTP has expired" }
    //     }
    // }
},
{
    sequelize: db,
    tableName: 'users'
});

