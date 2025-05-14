"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStatistico2 = exports.GetStatistico1 = exports.GetLineeProdotto = void 0;
const lodash_1 = __importDefault(require("lodash"));
const Sage_connection_1 = __importDefault(require("../config/Sage.connection"));
function customizer(objValue, srcValue) {
    return lodash_1.default.isUndefined(objValue) ? srcValue : objValue;
}
var defaults = lodash_1.default.partialRight(lodash_1.default.assignWith, customizer);
async function GetLineeProdotto(elemento) {
    return new Promise(async (resolve, reject) => {
        const sage = await Sage_connection_1.default.connect();
        /**------------------------------------------------------------------------------- */
        var temp = {};
        const cfg = (await sage.query(`select CFGLIN_0  from PRODEKD.ITMMASTER where ITMREF_0='${elemento}'`));
        temp['CFGLIN_0'] = cfg.recordset.length > 0 ? cfg.recordset[0].CFGLIN_0 : '';
        temp["STATISTICO 1"] = await GetStatistico1(elemento);
        temp["STATISTICO 2"] = await GetStatistico2(elemento);
        const lp = await sage.query(`select CFGNUM1_0,CFGNUM2_0,CFGNUM3_0,CFGNUM4_0,CFGNUM5_0,CFGNUM6_0,CFGALP1_0,CFGALP2_0,CFGALP3_0,CFGALP4_0,CFGALP5_0,CFGALP6_0 from  PRODEKD.TABLINCFG WHERE CFGLIN_0=(
            select CFGLIN_0  from PRODEKD.ITMMASTER where ITMREF_0='${elemento}'
            )`);
        const values = await sage.query(`select CFGFLDNUM1_0,CFGFLDNUM2_0,CFGFLDNUM3_0,CFGFLDNUM4_0,CFGFLDNUM5_0,CFGFLDNUM6_0,CFGFLDALP1_0,CFGFLDALP2_0,CFGFLDALP3_0,CFGFLDALP4_0,CFGFLDALP5_0,CFGFLDALP6_0 from PRODEKD.ITMMASTER where ITMREF_0='${elemento}'`);
        const lab = await sage.query(`select LANMES_0 from PRODEKD.APLSTD where LANCHP_0=760 and LAN_0='ITA'`);
        var model = {};
        lab.recordset.forEach((la) => {
            model[la.LANMES_0] = 0;
        });
        if (lp.recordset.length > 0) {
            const label_key = Object.keys(lp.recordset[0]);
            const lb_ = await sage.query(`select * from PRODEKD.APLSTD where LANCHP_0=760 and LAN_0='ITA'`);
            const lb = lb_.recordset;
            label_key.forEach(async (key, index) => {
                temp[lb.filter((lbk) => {
                    return lbk.LANNUM_0 == lp.recordset[0][key];
                })[0].LANMES_0] = values.recordset[0][Object.keys(values.recordset[0])[index]];
            });
            const te = defaults(temp, model);
            return resolve(te);
        }
        else {
            resolve(defaults(temp, model));
        }
    });
}
exports.GetLineeProdotto = GetLineeProdotto;
async function GetStatistico1(elemento) {
    const sage = await Sage_connection_1.default.connect();
    const statistico = await sage.query(`    
        select TEXTE_0 from PRODEKD.ATEXTRA
        where LANGUE_0='ITA' and IDENT1_0='20' and ZONE_0='LNGDES' and IDENT2_0 = (
        select TSICOD_0 from PRODEKD.ITMMASTER where ITMREF_0='${elemento}') and IDENT2_0<>''
        `);
    if (statistico.recordset.length > 0) {
        return statistico.recordset[0].TEXTE_0;
    }
    else {
        return "";
    }
    //    return statistico.recordset;
}
exports.GetStatistico1 = GetStatistico1;
async function GetStatistico2(elemento) {
    const sage = await Sage_connection_1.default.connect();
    const statistico = await sage.query(`    
        select TEXTE_0 from PRODEKD.ATEXTRA
        where LANGUE_0='ITA' and IDENT1_0='21' and ZONE_0='LNGDES' and IDENT2_0 = (
         select TSICOD_1 from PRODEKD.ITMMASTER where ITMREF_0='${elemento}') and IDENT2_0<>''
        `);
    if (statistico.recordset.length > 0) {
        return statistico.recordset[0].TEXTE_0;
    }
    else {
        return "";
    }
    //    return statistico.recordset;
}
exports.GetStatistico2 = GetStatistico2;
