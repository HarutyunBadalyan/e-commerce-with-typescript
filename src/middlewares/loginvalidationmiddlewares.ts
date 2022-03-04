import { body, CustomValidator   } from "express-validator";

const loginValidations = [
    body("email").isEmail(),
    body('password').isLength({ min: 8 }).withMessage("Invalid Password or Email"),
]
export default loginValidations;