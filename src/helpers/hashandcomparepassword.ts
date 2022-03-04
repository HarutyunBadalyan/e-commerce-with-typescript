import bcrypt from "bcrypt";
const saltRounds = 10;

class HashAndComparePassword {
    static async hashPassword( password:string ):Promise<string> {
    try{
      const hashedPassword:Promise<string> | string =  await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch(err) {
        throw err;
    }

    }
    static async comparePassword(password:string, hashPassword:string): Promise<boolean> {
        const match = await bcrypt.compare(password, hashPassword);
        return match;
    }
}
export {HashAndComparePassword};