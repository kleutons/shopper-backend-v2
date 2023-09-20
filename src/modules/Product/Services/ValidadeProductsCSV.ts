import { TypeProductValidade, TypeEnumProduct, TypeProduct, TypeComposePack, TypeComposePackTotal } from "../../../types/products";
import { PackRepository } from "../Repositories/PackRepository";
import { ProductRepository } from "../Repositories/ProductsRepository";

const productRepository = new ProductRepository();
const packRepository = new PackRepository();

export class ValidadeProductsCSV {

    // Config
    limitColumns = 2; // tamanho maximo de colunas no arquivo CSV


    public async execute(headerFile: string[], contentFile: string[][]){

        const productsValidade: TypeProductValidade[] = [];

        const errorHeader: string[] | null = this.checkHeaderLine(headerFile);

        if(errorHeader){
            return { errorHeader };
        }

        function pushError(name: string, code: number, newPrice: number, msgError: string[]):TypeProductValidade{
            return {
                code: code,
                name: name,
                cost_price: 0,
                sales_price: 0,
                new_price: newPrice,
                typeProduct: TypeEnumProduct.UNIQUE,
                composePack: null,
                validadeError: msgError
            }
        }

      
        for await (let line of contentFile) {
            const lineCodeProduct = Number(line[0]);
            const lineNewpriceProduct = Number(line[1]);

            //valida se dados da linha estão preenchidos corretamente, 
            const errorValidLine = this.checkValuesLine(line);
            if(errorValidLine){                
                productsValidade.push(
                    pushError('---', lineCodeProduct, lineNewpriceProduct, errorValidLine)
                  )
            }else{
                await productRepository.selectProduct([lineCodeProduct])?.then(async (itemProduct: TypeProduct[] | string ) => {

                    
                    if(Array.isArray(itemProduct) && itemProduct.length > 0 ){
                       const selectProduct = itemProduct[0];
                       let typeProductSelect: TypeEnumProduct = TypeEnumProduct.UNIQUE;
                       let composePackSelect: TypeComposePack[] | null = null;
                       const listErrors: string[] = [];

                         // Valida Novo Preço
                       const checkNewPrice = this.checkNewPrice(lineNewpriceProduct, selectProduct.sales_price, selectProduct.cost_price);
                       if(checkNewPrice){
                        listErrors.push(...checkNewPrice);
                       }

                       

                       //Valida Packs
                       const selectComposerPack = await this.checkComposeInPack(contentFile, selectProduct.code);
                       const selectItensPack = await this.checkListPack(contentFile, lineCodeProduct, lineNewpriceProduct );
                       
             

                       if(selectComposerPack) {
                            typeProductSelect = selectComposerPack.typeProduct;
                            const iPSelect = selectComposerPack.composePack;
                            composePackSelect = iPSelect && iPSelect.length > 0 ? iPSelect : null;
                            listErrors.push(...selectComposerPack.validadeError);
                        }

                       if(selectItensPack && !selectComposerPack.composePack){
                            typeProductSelect = selectItensPack.typeProduct;
                            const cPSelect = selectItensPack.composePack;
                            composePackSelect = cPSelect && cPSelect.length > 0 ? cPSelect : null;
                            listErrors.push(...selectItensPack.validadeError)
                       }
     

                        // Send Validade 
                        productsValidade.push({
                            code: selectProduct.code,
                            name: selectProduct.name,
                            cost_price: Number(selectProduct.cost_price),
                            sales_price: Number(selectProduct.sales_price),
                            new_price: lineNewpriceProduct,
                            typeProduct: typeProductSelect,
                            composePack: composePackSelect,
                            validadeError: listErrors
                        })
                        
                    }else
                    if(Array.isArray(itemProduct) && itemProduct.length == 0){

                        productsValidade.push(
                            pushError('---', lineCodeProduct, lineNewpriceProduct, ['Produto Não Encontrado'])
                          )
                    }else{
      
                        productsValidade.push(
                            pushError('---', lineCodeProduct, lineNewpriceProduct, ['Falha ao consultar base de dados'])
                          )
                    }
                });
            }

        }

        return { errorHeader, productsValidade };
    }

    //Chegar numero de colunas
    private checkNumberColumns(line: Array<number | string>): boolean {
        return line.length !== this.limitColumns;
    }

    // Checar o conteudo da primeira linha do CVS
    private checkHeaderLine(line: string[]): null | string[]{

        const validationMessages: string[] = [];

        if(this.checkNumberColumns(line)){
            validationMessages.push(`Cabeçalho inválido, necessário ${this.limitColumns} colunas, essa linha contém (${line.length})`);
        }
        if (line[0].trim() !== 'product_code') {
            validationMessages.push('Cabeçalho product_code não encontrado');
        }

        if (line[1].trim() !== 'new_price') {
            validationMessages.push('Cabeçalho new_price não encontrado');
        }

        // Se não houver mensagens de validação, retorne null
        return validationMessages.length > 0 ? validationMessages : null;
    }

    private checkValuesLine(line: string[]){
        const validationMessages: string[] = [];
        const code = Number(line[0]);
        const newPrice = Number(line[1]);
        
        if(this.checkNumberColumns(line)){
            validationMessages.push(`Linha inválida, necessário ${this.limitColumns} colunas, essa linha contém (${line.length})`);
        }
        
        if (isNaN(code) || code <= 0) {
            validationMessages.push('Código do produto inválido');
        }
        if (isNaN(newPrice)) {
            validationMessages.push('Novo Preço inválido');
        }
        
        if (newPrice <= 0) {
            validationMessages.push('Novo Preço não pode negativo');
        }
    
        return validationMessages.length > 0 ? validationMessages : null;
    }

    private checkNewPrice(newPrice: number, salesPrice: number, costPrice: number): string[] | null {
        const validationMessages: string[] = [];

        if(this.checkLowerCostPrice(costPrice, newPrice)){
            validationMessages.push('Novo preço abaixo do custo ('+costPrice+')');
        }

        const priceAdjustment = this.checkPriceAdjustment(salesPrice, newPrice);
        if(priceAdjustment){
            if(priceAdjustment == 'low'){
                validationMessages.push('Preço ultrapassa -10% do preço atual');
            }
            if(priceAdjustment == 'high'){
                validationMessages.push('Preço ultrapassa +10% do preço atual');
            }
        }

        return validationMessages.length > 0 ? validationMessages : null;
    }

    private checkLowerCostPrice(costPrice: number, newPrice: number): boolean {
        return newPrice <= costPrice;
    }

    private checkPriceAdjustment(price: number, newPrice: number): 'low' | 'high' | null {
        const maxAdjustment = Number(price) * 0.10; // 10% do preço atual
        const lowerBound  = Number(price) - Number(maxAdjustment);
        const upperBound  = Number(price) + Number(maxAdjustment);

        if(newPrice < lowerBound ){
            return 'low';
        }else
        if(newPrice > upperBound ){
            return  'high';            
        }else{
            return null;
        }
    }

    private async checkComposeInPack(contentFile: string[][], codeProduct: number){
        const selectComposerPack = await packRepository.listComposerPack(codeProduct);
        let typeProductSelect: TypeEnumProduct = TypeEnumProduct.UNIQUE;
        let composePackSelect: TypeComposePack[] | null = null;
        const validationMessages: string[] = [];

        if(Array.isArray(selectComposerPack) && selectComposerPack.length > 0 ){
            typeProductSelect = TypeEnumProduct.ComposePack;
            const listPack: TypeComposePack[] = [];
            selectComposerPack.map(item =>{
                listPack.push({ 
                        code: Number(item.pack_id)
                    });
            })
            composePackSelect = listPack.length > 0 ? listPack : null;
       }

       //buscar poduto na dentro do arquivo csv
       if(composePackSelect !== null && composePackSelect?.length > 0){
            const  result = this.searchProductListFile(contentFile, composePackSelect);
            validationMessages.push(...result.validationMsg);        
       }    

       return { typeProduct: typeProductSelect, composePack: composePackSelect, validadeError: validationMessages }
    }

    private async checkListPack(contentFile: string[][], codeProduct: number, newPrice: number){

        const selectItensPack = await packRepository.listItensPack(codeProduct);
        let typeProductSelect: TypeEnumProduct = TypeEnumProduct.UNIQUE;
        let composePackSelect: TypeComposePack[] | null = null;
        const validationMessages: string[] = []; 

        if(Array.isArray(selectItensPack) && selectItensPack.length > 0 ){
            typeProductSelect = TypeEnumProduct.PACK;
            const listPack: TypeComposePack[] = [];
            selectItensPack.map(item =>{
                listPack.push({ 
                        code: Number(item.product_id),
                        qty: Number(item.qty)
                    });
            })
            composePackSelect = listPack.length > 0 ? listPack : null;
       }

       //buscar poduto na dentro do arquivo csv
       if(composePackSelect !== null && composePackSelect?.length > 0){
            const  result = this.searchProductListFile(contentFile, composePackSelect, true);
            validationMessages.push(...result.validationMsg);
            if(newPrice !== result.somaQty){
                validationMessages.push('Soma total dos componentes desse kit está inválida')
            }
       }    
       
       return { typeProduct: typeProductSelect, composePack: composePackSelect, validadeError: validationMessages}
    }

    private searchProductListFile(contentFile: string[][], objectCodeProduct: TypeComposePack[], isPack: boolean = false) {
        const validationMessages: string[] = [];
        const msgDefault = isPack ? 'É necessário atualizar o(s) produto(s): ' : 'É necessário atualizar a composição do pack: ';
        const listPack: string[] = [];
        


        const existingCodes = contentFile.reduce((acc: TypeComposePackTotal[], item) => {
            const productsFound = objectCodeProduct.find(produto => produto.code === Number(item[0]));
            if(productsFound){
                const qtyItem = productsFound.qty ? Number(productsFound.qty) : 1;
                const newPrice = Number(item[1]);
                acc.push({
                    ...productsFound,
                    priceTotal: newPrice * qtyItem
                });   
            }
            return acc;
        }, []);

        if (existingCodes.length !== objectCodeProduct.length) {

            const listProduct = objectCodeProduct.map(item => {
               return isPack ? `(code:${item.code} qty:${item.qty})` : `(code:${item.code})`;
            })

            validationMessages.push(`${msgDefault} ${listProduct.join(', ')}`);
        }

        // Só somar se nao tiver erros anteriores
        const somaTotal = validationMessages.length == 0  && isPack?
              existingCodes.reduce((acc: number, item) => {
            acc += item.priceTotal;
            return acc;
        }, 0) : 0;

        const retrunSoma = somaTotal ? { somaQty: somaTotal } : undefined;


        return { validationMsg: validationMessages, pack: listPack.join(', '), ...retrunSoma };
    }

}