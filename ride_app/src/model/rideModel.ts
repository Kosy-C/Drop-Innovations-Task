import { DataTypes, Model } from "sequelize";
import { db } from "../DB.config";
import { UserInstance } from "./userModel";

export interface RideAttributes {
    id: string;
    riderId: string;
    driverId: string | null;
    status: string;
}


export class RideInstance extends Model<RideAttributes> {}

RideInstance.init ({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true,
        allowNull: false
    },
    riderId: {
        type: DataTypes.UUID,
        allowNull: false,
        // references: {
        //   model: UserInstance,
        //   key: 'id',
        // },
    },
    driverId: {
        type: DataTypes.UUID,
        allowNull: true,
        // references: {
        //   model: UserInstance,
        //   key: 'id',
        // },
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          customValidator: (value: any) => {
            const enums = [
              "pending",
              "accepted",
              "completed",
              "cancelled",
            ];
            if (!enums.includes(value)) {
              throw new Error("Not a valid option");
            }
          },
        },
    },
},
{
    sequelize: db,
    tableName: 'rides'
});

// Define associations
RideInstance.belongsTo(UserInstance, {
    foreignKey: 'riderId',
    as: 'rider'
});
RideInstance.belongsTo(UserInstance, {
    foreignKey: 'driverId',
    as: 'driver'
});

UserInstance.hasMany(RideInstance, {
    foreignKey: 'riderId',
    as: 'ridesRequested' 
});

UserInstance.hasMany(RideInstance, {
    foreignKey: 'driverId',
    as: 'ridesDriven' 
});