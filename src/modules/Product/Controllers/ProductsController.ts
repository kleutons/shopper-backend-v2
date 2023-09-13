import { FastifyReply, FastifyRequest } from "fastify";
import { ProductQuery } from "../../../../utils/product";
import { ProductRepository } from "../Repositories/ProductsRepository";


const productRepository = new ProductRepository();

export class ProductsControlles{
    async listProduct(request: FastifyRequest<{ Querystring: ProductQuery }>, reply: FastifyReply) {
        const queryParams = request.query;

        if ('code' in queryParams) {
            const productId = Number(queryParams.code);
            const result: any = await productRepository.selectProduct([productId]);

            if (result[0] && result[0].error) {
                const error = result[0];
                reply.code(404).send(error)
            } else {
                reply.send(result)
            }

        } else if ('unique' in queryParams) {
            const unique = queryParams.unique;
            const productsUnique: boolean = unique === 'false' ? false : true;
        
            const result: any = await productRepository.selectProduct(undefined, productsUnique);

            if (result[0] && result[0].error) {
                const error = result[0];
                reply.code(404).send(error)
            } else {
                reply.send(result)
            }

        } else {
            
            const result: any = await productRepository.selectProduct();

            if (result[0] && result[0].error) {
                const error = result[0];
                reply.code(404).send(error)
            } else {
                reply.send(result)
            }
        }
        
    }

    checkCSV(request: FastifyRequest, reply: FastifyReply ){
        reply.send('Valida CSV');
    }

    updateProductsCSV(request: FastifyRequest, reply: FastifyReply ){
        reply.send('Updade bulk CSV');
    }
}