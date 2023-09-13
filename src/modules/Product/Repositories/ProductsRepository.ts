import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductQuery } from '../../../routers/Product/produt.routes';


export class ProductRepository {
    list(request: FastifyRequest<{ Querystring: ProductQuery }>, reply: FastifyReply) {
        const queryParams = request.query;

        if ('code' in queryParams) {
            const productId = queryParams.code;
            reply.send('Exibe produto com codigo =' + productId);
        } else if ('unique' in queryParams) {
            const unique = queryParams.unique;
            const productsUnique: boolean = unique == 'false' ? false : true;
            reply.send('Exibe produtos unicos =' + productsUnique);
        } else {
            reply.send('Lista todos os produtos');
        }
        
    }

    postUpdataCSV(request: FastifyRequest, reply: FastifyReply ){
        reply.send('Valida CSV');
    }

    putUpdataCSV(request: FastifyRequest, reply: FastifyReply ){
        reply.send('Updade bulk CSV');
    }
}