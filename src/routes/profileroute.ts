import express, { Request,Response,NextFunction,} from "express";
import { Customer } from "../database/models";

const profileRouter = express.Router();

profileRouter.get("/profile", async (req:Request, res:Response) => {
    if(!req.session.userId) {
       return res.redirect("/login");
    }
    const customer:any = await Customer.findOne({raw:true, where:{id:req.session.userId}});
      const {firstName, lastName, email} = customer;
      res.send({firstName, lastName, email});
})

export default profileRouter;