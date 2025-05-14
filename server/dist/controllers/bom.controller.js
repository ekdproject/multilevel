"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBomByElement = exports.bomWithUploadFile = void 0;
const Local_connection_1 = __importDefault(require("../config/Local.connection"));
const BomExploded_1 = __importDefault(require("../models/BomExploded"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../services/utils");
const Bom_1 = __importDefault(require("../services/Bom"));
const LineeProdotto_1 = require("../services/LineeProdotto");
const path_1 = __importDefault(require("path"));
const bomExplodedRepository = Local_connection_1.default.getRepository(BomExploded_1.default);
const bomWithUploadFile = async (req, res) => {
    const alternativa = Number(req.query.alt) || 1;
    const linee_prodotto = req.query.lp || false;
    const type = req.query.type;
    await bomExplodedRepository.query(`delete from bom_exploded`);
    const separator = ';';
    const readFile = fs_1.default.readFileSync(req.file?.path).toString();
    const fileContentJson = (0, utils_1.convertCSVToJson)(readFile, separator);
    const promiseAll = fileContentJson.map(async ({ ITMREF_0, QTY }) => {
        const bom = new Bom_1.default({
            complessivo: ITMREF_0,
            padre: ITMREF_0,
            qty: QTY,
            lev: 1,
            alt: alternativa
        });
        await bom.explode();
    });
    await Promise.all(promiseAll);
    let response = await bomExplodedRepository.query(`select * from bom_exploded order by lev,padre,elemento`);
    const withCliCode = response.map(async (element) => {
        const getCodiceClienteElemento = await (0, utils_1.GetCodiceCliente)(element.elemento);
        const getCodiceClientePadre = await (0, utils_1.GetCodiceCliente)(element.padre);
        const getCodiceClienteComplessivo = await (0, utils_1.GetCodiceCliente)(element.complessivo);
        return {
            ...element,
            qty_db: Number(element.qty_db).toLocaleString('it-IT'),
            qty: Number(element.qty).toLocaleString('it-IT'),
            cod_cli_complessivo: getCodiceClienteComplessivo.CodiceCliente,
            cod_cli_padre: getCodiceClientePadre.CodiceCliente,
            cod_cli_elemento: getCodiceClienteElemento.CodiceCliente
        };
    });
    response = await Promise.all(withCliCode);
    if (linee_prodotto) {
        const withLineaProdottoPromise = response.map(async (element) => {
            const lp = await (0, LineeProdotto_1.GetLineeProdotto)(element.elemento);
            return {
                ...element,
                ...lp
            };
        });
        const withLineaProdotto = await Promise.all(withLineaProdottoPromise);
        response = withLineaProdotto;
    }
    switch (type) {
        case 'csv':
            const mapping = response.map((row) => {
                const { id, ...el } = row;
                return {
                    ...el
                };
            });
            const csv = (0, utils_1.jsonToCsv)(mapping);
            fs_1.default.writeFileSync(path_1.default.resolve(__dirname, '..', 'download', 'distinta.csv'), csv);
            return res.download(path_1.default.resolve(__dirname, '..', 'download', 'distinta.csv'));
        default:
            return res.json({
                boms: response
            });
    }
};
exports.bomWithUploadFile = bomWithUploadFile;
const getBomByElement = async (req, res) => {
    const elemento = req.query.elemento;
    const qty = req.query.qty;
    const linee_prodotto = req.query.lp || false;
    console.log(elemento, qty);
    if (!elemento || !qty) {
        return res.json({
            message: 'qty e elemento sono obbligatori'
        });
    }
    const alternativa = Number(req.query.alt) || 1;
    await bomExplodedRepository.query(`delete from bom_exploded`);
    const bom = new Bom_1.default({
        complessivo: elemento,
        padre: elemento,
        qty: Number(qty),
        lev: 1,
        alt: alternativa
    });
    await bom.explode();
    let response = await bomExplodedRepository.query(`select * from bom_exploded order by lev,padre,elemento`);
    const withCliCode = response.map(async (element) => {
        const getCodiceCliente = await (0, utils_1.GetCodiceCliente)(element.elemento);
        return {
            ...element,
            qty_db: Number(element.qty_db).toLocaleString('it-IT'),
            qty: Number(element.qty).toLocaleString('it-IT'),
            cod_cli: getCodiceCliente,
            ITMDES1_0: element.ITMDES1_0,
            ITMDES2_0: element.ITMDES2_0,
            ITMDES3_0: element.ITMDES3_0
        };
    });
    response = await Promise.all(withCliCode);
    if (linee_prodotto) {
        const withLineaProdottoPromise = response.map(async (element) => {
            const lp = await (0, LineeProdotto_1.GetLineeProdotto)(element.elemento);
            return {
                ...element,
                ...lp
            };
        });
        const withLineaProdotto = await Promise.all(withLineaProdottoPromise);
        return res.json({
            boms: withLineaProdotto
        });
    }
    console.log(response.length);
    res.json({
        bom: response
    });
};
exports.getBomByElement = getBomByElement;
