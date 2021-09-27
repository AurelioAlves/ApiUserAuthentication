import User from "../models/User.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const secret = "23A09B2021C"

class UserController{

    async index(req, res){
        const users = await User.findAll();

        res.json(users)
    }

    async findUser(req, res) {
        const id = req.params.id;
        const user = await User.findById(id);

        if( user == undefined){
            res.status(404);
            res.json({});
        } else {
            res.status(200);
            res.json(user)
        }
    }

    async create(req, res){
        console.log(req.body);
        const {nome, email, password, idade, endereco} = req.body

        if( nome == undefined || email == undefined || password == undefined ||
            endereco.rua == undefined || endereco.numero == undefined || endereco.cep == undefined) {
                if(nome == '' || email == '' || password == '' ||
                    endereco.rua == '' || endereco.numero == '' || endereco.cep == '') {
                        res.status(400);
                        res.json({ err: "bad request"});
                        return;
                    }           
        }

        const findEmail = await User.findByEmail(email); 
        if( findEmail ) {
            res.status(400);
            res.json({ err: "Email já cadastrado" });
            return;
        }

        await User.new(nome, email, password, idade, endereco.rua, endereco.numero, endereco.cep);

        res.status(200);
        res.send("Pegando corpo da req");
        return;
    }

    async edit( req, res) {
        const { id, nome, email, idade, endereco } = req.body
        const result = await User.update(id, nome, email, idade, endereco)

        if(result.status) {
            res.status(200)
            res.send("Ok")
        } else {
            res.status(500)
            res.send(result.err)
        }

    }

    async remove(req, res) {
        const id = req.params.id

        const result = await User.delete( id )

        if( result.status ) {
            res.status(200)
            res.send("Tudo OK")
        } else {
            res.status(406)
            res.send(result.err)
        }
    }

    async login (req, res) {
        const {email, password} = req.body
    
        let user = undefined

        if(email) {
            user = await User.findByEmail( email )
        }       

        if(user != undefined) {
            const result = await bcrypt.compare(password, user.password);
            console.log(result)
            if(result) {
                const token = jwt.sign({ email: user.email, role: user.role }, secret )
                console.log(token)
                res.status(200)
                res.json({token: token, status: true, user: { id: user.id}});
                return;
            } else {
                res.status(403);
                res.json({status: result});
                return;
            }
            
        } else {
            res.status(401)
            res.json({status: false})
            return
        }
    }
}

export default new UserController();