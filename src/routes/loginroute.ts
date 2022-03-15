import express, { Request,Response,NextFunction,} from "express";
import loginValidations from "../middlewares/loginvalidationmiddlewares";
import { validationResult   } from "express-validator";
import { Customer } from "../database/models";
import { HashAndComparePassword } from "../helpers/hashandcomparepassword";

const loginRoute = express.Router();
loginRoute.get("/login",loginValidations, async (req:Request, res:Response, next: NextFunction) => {
    console.log(req.session)
    if(req.session.userId) {
        return res.redirect("/profile")
    }
    res.send({msg:"success"}) // or next() if using react;
})
loginRoute.post("/login",loginValidations, async (req:Request, res:Response) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            throw errors;
        }
        const customer:any = await Customer.findOne({raw:true, where:{email:req.body.email}});
        console.log(customer);
        if(!customer) {
            throw "Invalid email or password"
        }
        const match = await HashAndComparePassword.comparePassword(req.body.password, customer.password);
        req.session.userId = customer.id;
        console.log("Session",req.session)
        res.send({msg: "success" })

    } catch(err: any) {
        if(Array.isArray(err.errors)) {
         return   res.send({msg: err});

        }
        return res.send({msg: err });
    }

})
export default loginRoute;