import { db } from "../../../knex/database";

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
}