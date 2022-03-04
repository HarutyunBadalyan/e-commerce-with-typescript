"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const loginValidations = [
    (0, express_validator_1.body)("email").isEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage("Invalid Password or Email"),
];
exports.default = loginValidations;
