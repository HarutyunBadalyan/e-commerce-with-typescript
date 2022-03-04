"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const registerValidations = [
    (0, express_validator_1.body)("email").isEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage("Password must contain 8 character"),
    (0, express_validator_1.body)("firstName").not().isEmpty().withMessage("firstname is required"),
    (0, express_validator_1.body)("lastName").not().isEmpty().withMessage("lastname is required"),
    (0, express_validator_1.body)('passwordConfirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        // Indicates the success of this synchronous custom validator
        return true;
    }),
];
exports.default = registerValidations;
