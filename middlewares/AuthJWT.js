const jwt = require("jsonwebtoken");
var jwkToPem = require('jwk-to-pem');
const validate_token = (req,res,next)=>{
    const idtoken = req.header("id_token");
    if(!idtoken){
        return res.json({err: "Usuario não logado"})
    } 
     try {
         var key = {
             e:"",
             n: "",
             kty: "",
             kid: "",
             use: ""
         }
         var pem = jwkToPem(key);
         const validToken = jwt.verify(idtoken,pem,{algorithm:['RS256']})
         req.user = validToken;
         
         if(validToken){
             return next();
         }
     } catch (error) {
         return res.json({err: error})
         
     } 
    next()
}

module.exports = {validate_token}
