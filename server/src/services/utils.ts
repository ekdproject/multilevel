import _ from 'lodash'
import SageDb from '@config/Sage.connection'

export const convertCSVToJson = (readFile: string, separator: string) => {
    const fileRows = readFile.split('\r\n')

    const fileContentJson = fileRows.map((row) => {
        const [ITMREF_0, QTY] = row.split(separator)

        return {
            ITMREF_0,
            QTY: Number(QTY)
        }
    })
    return fileContentJson
}


export function jsonToCsv(items: any) {
    const header = Object.keys(_.maxBy(items, (i) => Object.keys(i).length)!);
    const headerString = header.join(';');
    
    // handle null or undefined values here
    const replacer = (key: any, value: any) => value ?? '';
    const rowItems = items.map((row: any) =>
        header
            .map((fieldName) => JSON.stringify(row[fieldName], replacer))
            .join(';')
    );
    // join header and body, and break into separate lines
    const csv = [headerString, ...rowItems].join('\r\n');
    return csv;
}
export async function GetCodiceCliente(CodiceEkd:string) {
    return new Promise(async (resolve, reject) => {
      const db = await SageDb.connect();
      const { recordset } = await db
        .request()
        .input("codice", CodiceEkd)
        .query(
          `IF (select  COUNT(SEAKEY_0) from PRODEKD.ITMMASTER where ITMREF_0=@codice)>0 
                select  SEAKEY_0 from PRODEKD.ITMMASTER where ITMREF_0=@codice
                   ELSE 
                select ITMREFBPC_0 as 'SEAKEY_0' from PRODEKD.ITMBPC where ITMREF_0 =@codice`
        );
  
      if (recordset.length > 0) {
        resolve({
          CodiceEkd,
          CodiceCliente: recordset[0].SEAKEY_0,
        });
      } else {
        resolve({
          CodiceEkd,
          CodiceCliente: undefined,
        });
      }
    });
  }