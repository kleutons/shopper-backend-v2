import { FastifyInstance } from "fastify";

export default function productRoute(server: FastifyInstance, baseUrlRouter: string ){


    server.get(baseUrlRouter, () => {
        return 'Hello World Product';
    });    

    server.get(baseUrlRouter+'/list', () => {
        return 'Hello World Product List';
    });    

}