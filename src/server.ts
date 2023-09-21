import { fastify } from "fastify";
import fastifyCors from "@fastify/cors";
import routes from "./routers/routes";
import dotenv from 'dotenv';

dotenv.config();

const server = fastify();
const port =  Number(process.env.SERVER_PORT) ?? 3333;

server.get('/', () => {
    return 'Server is Run!'
})

// Registrar o plugin @fastify/cors
server.register(fastifyCors, {
    origin: "*", // Permite acesso de qualquer origem (não seguro para produção)
    methods: "GET,POST,PUT,DELETE", // Métodos HTTP permitidos
});

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