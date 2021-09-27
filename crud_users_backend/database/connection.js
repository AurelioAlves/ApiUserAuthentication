import Knex from 'knex';

const knex = Knex({
       client: 'mysql2',
       connection: {
           host : '127.0.0.1',
           user : 'root',
           password : '123456',
           database : 'crud_user'
          }
        })

export default knex

