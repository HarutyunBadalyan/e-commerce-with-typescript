import  { Request,Response,NextFunction, Application } from "express";
import { body, CustomValidator   } from "express-validator";

const registerValidations = [
    body("email").isEmail(),
    body('password').isLength({ min: 8 }).withMessage("Password must contain 8 character"),
    body("firstName").not().isEmpty().withMessage("firstname is required"),
    body("lastName").not().isEmpty().withMessage("lastname is required"),
    body('passwordConfirmation').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
  
      // Indicates the success of this synchronous custom validator
      return true;
    }),
  
]
export default registerValidations;