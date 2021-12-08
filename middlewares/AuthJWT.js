const jwt = require("jsonwebtoken");
var jwkToPem = require('jwk-to-pem');
const validate_token = (req,res,next)=>{
    console.log("Entrou no AuthJWT")
    const idtoken = req.header("id_token");
    if(!idtoken){
        return res.json({err: "Usuario não logado"})
    } 
     try {
         console.log("entrou no verify")
         var key = {
             e:"AQAB",
             n: "sGGt-wXW5EFcjknvfVDii--_5e3IXQUp10SpxJp0O8LXrLpE3Ppxvkqsysem-GSaGKp6T0-yLM5QKf7YlsLtb_HLT8Lbf82TblTfP0S2HMbAm0djgpK0sK_E2vBGmGELmEsEte3LqAWU0NVAd982T6--0vMXTgiG0Y5--dGXmAKpbaZv17aOewh4L9R-j8JNfv66CxwHSVw5PMITw2hh0PNMmU831k7X3rBlpjXAoVskQTVycIWmzuNk3325TmcsArA0o_qb4Op-8On1VsXTk6HPvkfXn2BuZxpCUdqiZaS9caqHuTSMLTMLYwEpsF0cZXCYCkqQnCvl_wA8cBV3dQ",
             kty: "RSA",
             kid: "j5ltTN6vIhtbtwL4u9ludq2BwEpH3etwAcIUA_dE7Dc",
             use: "sig"
         }
         var pem = jwkToPem(key);
         console.log("passou pelo jwk")
         const validToken = jwt.verify(idtoken,pem,{algorithm:['RS256']})
         req.user = validToken;
         
         if(validToken){
             console.log("deu bom o verify")
             return next();
         }
     } catch (error) {
         console.log('entrou no catch error ')
         return res.json({err: error})
         
     } 
    next()
}

module.exports = {validate_token}