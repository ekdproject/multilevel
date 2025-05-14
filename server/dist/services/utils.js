"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCodiceCliente = exports.jsonToCsv = exports.convertCSVToJson = void 0;
const lodash_1 = __importDefault(require("lodash"));
const Sage_connection_1 = __importDefault(require("../config/Sage.connection"));
const convertCSVToJson = (readFile, separator) => {
    const fileRows = readFile.split('\r\n');
    const fileContentJson = fileRows.map((row) => {
        const [ITMREF_0, QTY] = row.split(separator);
        return {
            ITMREF_0,
            QTY: Number(QTY)
        };
    });
    return fileContentJson;
};
exports.convertCSVToJson = convertCSVToJson;
function jsonToCsv(items) {
    const header = Object.keys(lodash_1.default.maxBy(items, (i) => Object.keys(i).length));
    const headerString = header.join(';');
    // handle null or undefined values here
    const replacer = (key, value) => value ?? '';
    const rowItems = items.map((row) => header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(';'));
    // join header and body, and break into separate lines
    const csv = [headerString, ...rowItems].join('\r\n');
    return csv;
}
exports.jsonToCsv = jsonToCsv;
async function GetCodiceCliente(CodiceEkd) {
    return new Promise(async (resolve, reject) => {
        const db = await Sage_connection_1.default.connect();
        const { recordset } = await db
            .request()
            .input("codice", CodiceEkd)
            .query(`IF (select  COUNT(SEAKEY_0) from PRODEKD.ITMMASTER where ITMREF_0=@codice)>0 
                select  SEAKEY_0 from PRODEKD.ITMMASTER where ITMREF_0=@codice
                   ELSE 
                select ITMREFBPC_0 as 'SEAKEY_0' from PRODEKD.ITMBPC where ITMREF_0 =@codice`);
        if (recordset.length > 0) {
            resolve({
                CodiceEkd,
                CodiceCliente: recordset[0].SEAKEY_0,
            });
        }
        else {
            resolve({
                CodiceEkd,
                CodiceCliente: undefined,
            });
        }
    });
}
exports.GetCodiceCliente = GetCodiceCliente;
