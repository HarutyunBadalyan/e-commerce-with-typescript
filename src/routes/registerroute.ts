
import url from "url";
import express, { Request,Response,NextFunction,} from "express";
import { validationResult   } from "express-validator";

import registerValidations  from "../middlewares/registervalidationmiddlewares";
import {HashAndComparePassword} from "../helpers/hashandcomparepassword";
import { Customer } from "../database/models";
import { SendMail } from "../helpers/sendmail";
import { TokenEncodeDecode } from "../helpers/encodedecodetoken";
const registerRoute = express.Router();

registerRoute.get('/register', registerValidations, async (req:Request, res:Response) => {
   if(req.session.userId) {
       return res.redirect("/profile")
   }
   return res.send({msg:"success"})

})

registerRoute.post('/register', registerValidations, async (req:Request, res:Response) => {
    try {
       
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            throw errors;
        }
        const token =  TokenEncodeDecode.encodeToken(req.body.email);
        const hashedPassword = await HashAndComparePassword.hashPassword(req.body.password);
        const customer = await Customer.create({
            email:req.body.email,
            password:hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        })
        console.log(customer);
        const sentemail = await SendMail.sendEmail(req.body.email,"authentication message","dsfsdf",`<a href="${url.resolve(process.env.BASEURL || "http://localhost:3000/",`/token/${token}`)}">click for authentication<a>`);
        //console.log("asdasd",sentemail)
        res.send({msg: "success"});
    } catch(err:any) {
        
        console.log("errors register",err);
       if(!err.name) {
        return res.send({msg: err.errors.map((item:any) => item.msg)}) //sending error array or string
       }
       return res.send({msg: "Please use another email"});
    }
    

})


export default registerRoute;