import { db } from "../../../knex/database";
import { TypeUpdateDB } from "../../../types/products";

export class ProductRepository {

    table = "products";

    selectProduct(code?:[ number ], unique?: boolean){

        const selectTable = db(this.table);

        if(!code && unique === undefined){

            return selectTable.then((dataItem) => {
                return dataItem;
            }).catch((err) => {
                
                return "Erro ao consultar Banco de dados!";
            })
            
        }else
        if(!code && unique !== undefined){

            if(unique){
                const  select = selectTable.whereNotIn('code', db('packs').select('pack_id'));
            
                return  select.then((dataItem) => {
                    return dataItem;
                }).catch((err) => {
                    // console.log(err);
                    return  "Erro ao consultar Banco de dadoos!";
                })
                
            }else{
                const select = selectTable.whereIn('code', db('packs').select('pack_id'));

                return  select.then((dataItem) => {
                    return dataItem;
                }).catch((err) => {
                    // console.log(err);
                    return  "Erro ao consultar Banco de dados!";
                })
    
            }

        }else
        // product/code
        if(code && Array.isArray(code)){


            const select = selectTable.whereIn('code', code);
                return  select.then((dataItem) => {
                    return dataItem;
                }).catch((err) => {
                    // console.log(err);
                    return  "Erro ao consultar Banco de dados!";
                })
    
        }

    }

   async updateProducts(dataUpdate:TypeUpdateDB[] ){
        const selectTable = db(this.table);
        
        const result: {updateAll:boolean, error?:string[]} = {updateAll: true};
        

        for (const item of dataUpdate) {
            try {
                await selectTable
                .where('code', item.code)
                .update({ sales_price: item.sales_price });
                console.log(`Produto ${item.code} atualizado com sucesso.`);
            } catch (err) {
                console.error(`Erro ao atualizar produto: ${item.code}`, err);
                result.updateAll = false;
                result.error?.push(`Erro ao atualizar produto: ${item.code}`);
            }
        }

        return result;
    }
}