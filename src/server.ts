import { fastify } from "fastify";
import fastifyCors from "@fastify/cors";
import routes from "./routers/routes";
import dotenv from 'dotenv';

dotenv.config();

const server = fastify();
const port =  process.env.PORT ? Number(process.env.PORT) : 4000;

server.get('/', () => {
    return 'Server is Run!'
})

// Registrar o plugin @fastify/cors
server.register(fastifyCors, {
    origin: (origin, cb) => {
        if (origin === undefined) {
          // não permitimos o acesso.
          cb(new Error('Not allowed'), false);
        } else {
          const hostname = new URL(origin).hostname;
          if (hostname === 'localhost' || hostname.match(/^([a-z0-9-]+\.)*vercel\.app$/)) {
            // Permite o acesso se a origem corresponder a localhost ou a um domínio Vercel.app
            cb(null, true);
          } else {
            // Recusa o acesso para outras origens
            cb(new Error('Not allowed'), false);
          }
        }
      },
    methods: "GET,POST,PUT,DELETE", // Métodos HTTP permitidos
});

routes(server);


server.listen({
    host: '0.0.0.0',
    port: port
}, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server is Run port ${port} Acesse: ${address}`);
})  