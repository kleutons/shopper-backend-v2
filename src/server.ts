import { fastify } from "fastify";
import routes from "./routers/routes";
import dotenv from 'dotenv';

dotenv.config();

const server = fastify();
const port =  Number(process.env.SERVER_PORT) || 3001;

server.get('/', () => {
    return 'Server is Run!'
})


routes(server);


server.listen({
    port: port
}, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server is Run port ${port} Acesse: ${address}`);
})  