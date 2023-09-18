import { db } from "../../../knex/database";

export class PackRepository {
    table = "packs";

    async listItensPack(pack_id: number){
        const selectTable = db(this.table);

        return selectTable
        .select('product_id', 'qty')
        .where('pack_id', '=', pack_id)
        .then((dataItem) => {
            return dataItem;
        })
        .catch((err) => {
            console.log(err);
                return "Erro ao consultar Banco de dados!";
        })
    }

    async listComposerPack(productId: number){
        const selectTable = db(this.table);

       return selectTable
        .select('pack_id')
        .where('product_id', '=', productId)
        .then((dataItem) => {
            return dataItem;
        })
        .catch((err) => {
            console.log(err);
                return "Erro ao consultar Banco de dados!";
        })
    }
}