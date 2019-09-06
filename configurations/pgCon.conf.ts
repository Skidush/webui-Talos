// const user = 'postgres';
// const password = 'dev';
// const host = '127.0.0.1';
// const port = '5432';
// const database = 'hmws';

const user = 'postgres';
const password = 'dev';
const host = '192.168.88.75';
const port = '5432';
const database = 'hmws';


const pg = require('pg');
const connectionString = 'postgres://' + user + ':' + password + '@' + host + ':' + port + '/' + database;

export class pgConnection {
    async query(query: string) {
        try {
            const client = new pg.Client(connectionString);
            client.connect();
            
            const result = await client.query(`${query}`);
            if (Object.entries(result.rows).length === 0) {
                throw `No database result found for query: ${query}`;
            }
            client.end();          

            return result;
        } catch (err) {
            throw err;
        }
    }

    get queryBuilder() {
        return require('knex')({
            client: 'pg',
            connection: {
                host: host,
                user: user,
                password: password,
                database: database
            }  
        });
    }
}