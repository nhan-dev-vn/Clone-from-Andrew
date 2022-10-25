'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     return queryInterface.bulkInsert('Spots', [
      {
        ownerId: 1,
        address: '4423 Sample Street',
        city: 'Washington',
        state: 'D.C.',
        country: 'United States',
        lat: 38.9,
        lng: -77.0,
        name: 'DC Villa',
        description: 'Lovely house in Washington DC',
        price: 100.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ownerId: 2,
        address: '1511 Maple Street',
        city: 'Boulder',
        state: 'CO',
        country: 'United States',
        lat: 40.00,
        lng: -105.00,
        name: 'Boulder Lodge',
        description: 'Lovely lodge in Boulder CO',
        price: 200.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ownerId: 3,
        address: '8523 Lees Ridge Road',
        city: 'Warrenton',
        state: 'VA',
        country: 'United States',
        lat: 38.9,
        lng: -77.0,
        name: 'VA Estate',
        description: 'Wonderful estate in Warrenton VA',
        price: 150.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }

    ]);

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     const Op = Sequelize.Op;
     return queryInterface.bulkDelete('Spots', {
       name: { [Op.in]: ['DC Villa', 'Boulder Lodge', 'VA Estate'] }
     }, {});
  }
};
