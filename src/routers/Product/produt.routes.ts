import { FastifyInstance } from "fastify";
import {  ProductRepository } from "../../modules/Product/Repositories/ProductsRepository";

export interface ProductQuery {
    code?: string; 
}


const productRepository = new ProductRepository();

export default function productRoute(server: FastifyInstance, baseUrlRouter: string ){

     server.get<{ Querystring: ProductQuery }>(baseUrlRouter, (request, reply) => {
        productRepository.list(request, reply);
    });

    server.post(baseUrlRouter+'/update-csv', (request, reply) => {
        productRepository.postUpdataCSV(request, reply);
    });   

    server.put(baseUrlRouter+'/update-csv', (request, reply) => {
        productRepository.putUpdataCSV(request, reply);
    });
}
