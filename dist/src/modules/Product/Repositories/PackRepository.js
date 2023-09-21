"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackRepository = void 0;
const database_1 = require("../../../knex/database");
class PackRepository {
    constructor() {
        this.table = "packs";
    }
    listItensPack(pack_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectTable = (0, database_1.db)(this.table);
            return selectTable
                .select('product_id', 'qty')
                .where('pack_id', '=', pack_id)
                .then((dataItem) => {
                return dataItem;
            })
                .catch((err) => {
                console.log(err);
                return "Erro ao consultar Banco de dados!";
            });
        });
    }
    listComposerPack(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectTable = (0, database_1.db)(this.table);
            return selectTable
                .select('pack_id')
                .where('product_id', '=', productId)
                .then((dataItem) => {
                return dataItem;
            })
                .catch((err) => {
                console.log(err);
                return "Erro ao consultar Banco de dados!";
            });
        });
    }
}
exports.PackRepository = PackRepository;
