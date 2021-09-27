import knex from "../database/connection.js";
import bcrypt from "bcrypt";

class User{

    async findAll() {
        try {
            const results = await knex.select(["user.id", "nome", "email", "idade", "address.id as adress_id", "address.rua", "address.numero", "address.cep"])
                .table("user").innerJoin("address", "address.id", "user.address_id");

            return this.formatarUserArray(results)
        } catch (err) {
            console.log(err) 

            return [];   
        }   
    }

    async findById(id){
        try {
            const results = await knex.select(["user.id", "nome", "email", "idade", "role", "address.id as adress_id", "address.rua", "address.numero", "address.cep"])
                .from("user").innerJoin("address", "address.id", "user.address_id").where("user.id", id);

            if(results.length > 0) {
                return this.formatarUserArray(results)[0]
            } else {
                return undefined
            }
        } catch(err) {
            console.log(err)

            return undefined;
        }       
    }
    
    async findByEmail(email){
        try {
            const result = await knex.select(["user.id", "nome", "email", "password" ,"idade", "role", "address.id as adress_id", "address.rua", "address.numero", "address.cep"])
                .from("user").innerJoin("address", "address.id", "user.address_id").where({email: email});

            if( result.length > 0 ) {
                return this.formatarUserArray(result)[0]
            } else {
                return undefined
            }
        } catch(err) {
            console.log(err)

            return undefined;
        }
         
    }

    async new(nome, email, password, idade, rua, numero, cep) {
        try{            
            const hash = await bcrypt.hash(password, 10)

            await knex.transaction(async trans => {
                const address = await knex.insert({rua, numero, cep}).table("address")
                await knex.insert({nome, email, password: hash, idade, address_id: address}).table("user")                  
            })

        } catch(err) {
            console.log(err)
        }
    }

    async update(id, nome, email, idade, endereco) {
        try {
            let user = await this.findById( id );

            if( user != undefined ) {
                let editUser = {};
                let editAddress = {}

                if(email != undefined){
                    if( email != user.email ) {
                        const result = await this.findByEmail(email);
                        if( result ) {
                            editUser.email = email;
                        } else {
                            return { status: false, err: "O email já está cadastrado"}  
                        }
                    }
                }   

                if(nome != undefined) {
                    editUser.nome = nome;
                }

                if(idade != undefined) {
                    editUser.idade = idade;
                }

                if(endereco.rua != undefined) {
                    editAddress.rua = endereco.rua
                }

                if(endereco.numero != undefined) {
                    editAddress.numero = endereco.numero
                }

                if(endereco.cep != undefined) {
                    editAddress.cep = endereco.cep
                }

                await knex.transaction(async trans => {
                    await knex.update(editUser).where({id: id}).table("user")
                    await knex.update(editAddress).where({id: user.endereco.id}).table("address")
                })

                return {status: true}
            } else {
                return { status: false, err: "O usuário não existe"}
            }
        } catch(err) {
            console.log(err)
            return {status: false, err: err}
        }
    }

    async delete( id ) {
        const user = await this.findById( id );

        if(user.role == 1) {
            return {status: false, err: "Usuário não pode ser excluído"}
        }

        if(user != undefined ) {
            try{
                await knex.delete().where({id: id}).table("user")
                return {status: true}
            } catch( err ) {
                return {status: false, err: err}
            }
            
        } else {
            return {status: false, err: "Usuário não existe"}
        }
    }

    formatarUserArray( userArray ) {
        return userArray.map( user => {
            const retorno = {
                id: user.id,
                nome: user.nome,
                email: user.email,
                idade: user.idade.toLocaleDateString(),
                role: user.role,
                endereco: {
                    id: user.adress_id,
                    rua: user.rua,
                    numero: user.numero,
                    cep: user.cep
                }
            }

            if( user.password ) {
                retorno.password = user.password
            }

            return retorno
        })    
    }
}

export default new User()