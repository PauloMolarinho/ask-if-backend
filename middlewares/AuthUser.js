const {verify} = require("jsonwebtoken")
const validateToken = (req,res,next)=>{
    const accessToken = req.header("accessToken");
    if(!accessToken){
        return res.json({err: "Usuario não logado"})
    } 
     try {
         const validToken = verify(accessToken, "SystemCall");
         req.user = validToken;
         if(validToken){
             return next();
         }
     } catch (error) {
         console.log('entrou no catch error ')
         return res.json({err: error})
         
     } 
    next()
}

module.exports = {validateToken}