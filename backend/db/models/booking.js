'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Booking.belongsTo(models.User)

      Booking.belongsTo(models.Spot)

    }
  }
  Booking.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,             // only allow date strings
        dateValidator(value) {
          if (new Date(value) < new Date()) {
            throw new Error("invalid date");
          }
        },
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,             // only allow date strings
        dateValidator(value) {
          if (new Date(value) < this.startDate) {
            throw new Error("invalid date");
          }
        },
      }
    }
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};
