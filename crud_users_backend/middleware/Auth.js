import jwt from "jsonwebtoken"

const secret = "23A09B2021C"

export default function Auth(req, res, next){

    const authToken = req.headers['authorization']

    if( authToken != undefined ) {
        const bearer = authToken.split(' ');
        var token = bearer[1];

        const decoded = jwt.verify(token, secret);
 
        if(decoded.role == 1) {
            next();
        } else {
            res.status(403);
            res.send("Not Authorized")
        }
    } else {
        res.status(403)
        res.send("Not Authorized")
        return;
    }
}