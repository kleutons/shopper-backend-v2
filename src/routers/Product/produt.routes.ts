import { FastifyInstance } from "fastify";
import { ProductQuery } from "../../../utils/product";
import { ProductsControlles } from "../../modules/Product/Controllers/ProductsController";


const productsControlles = new ProductsControlles();

export default function productRoute(server: FastifyInstance, baseUrlRouter: string ){

     server.get<{ Querystring: ProductQuery }>(baseUrlRouter, (request, reply) => {
        productsControlles.listProduct(request, reply);
    });

    server.post(baseUrlRouter+'/update-csv', (request, reply) => {
        productsControlles.checkCSV(request, reply);
    });   

    server.put(baseUrlRouter+'/update-csv', (request, reply) => {
        productsControlles.updateProductsCSV(request, reply);
    });
}
