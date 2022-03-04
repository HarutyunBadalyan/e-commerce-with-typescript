"use strict";
module.exports = {
    up: function (queryInterface, Sequelize) {
        // logic for transforming into the new state
        return queryInterface.addColumn('Customers', 'isAdmin', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });
    },
    down: function (queryInterface, Sequelize) {
        // logic for reverting the changes
        return queryInterface.removeColumn('Customers', 'isAdmin');
    }
};
