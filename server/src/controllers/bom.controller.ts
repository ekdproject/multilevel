import { Request, Response } from 'express'
import LocalDataSource from '@config/Local.connection'
import BomExploded from '@models/BomExploded'
import fs from 'fs'
import { convertCSVToJson, GetCodiceCliente, jsonToCsv } from '@services/utils'
import Bom from '@services/Bom'
import { GetLineeProdotto } from '@services/LineeProdotto'
import path from 'path'

const bomExplodedRepository = LocalDataSource.getRepository(BomExploded)

export const bomWithUploadFile = async (req: Request, res: Response) => {


    const alternativa = Number(req.query.alt) || 1
    const linee_prodotto = req.query.lp || false
    const type = req.query.type
    await bomExplodedRepository.query(`delete from bom_exploded`)
    const separator = ';'
    const readFile = fs.readFileSync(req.file?.path as string).toString()

    const fileContentJson = convertCSVToJson(readFile, separator)
   
    const promiseAll = fileContentJson.map(async ({ ITMREF_0, QTY }) => {
        const bom = new Bom({
            complessivo: ITMREF_0,
            padre: ITMREF_0,
            qty: QTY,
            lev: 1,
            alt: alternativa
        })

        await bom.explode()
    })

    await Promise.all(promiseAll)

    let response = await bomExplodedRepository.query(`select * from bom_exploded order by lev,padre,elemento`)

    const withCliCode = response.map(async (element: any) => {
        const getCodiceClienteElemento: any = await GetCodiceCliente(element.elemento)
        const getCodiceClientePadre: any = await GetCodiceCliente(element.padre)
        const getCodiceClienteComplessivo: any = await GetCodiceCliente(element.complessivo)

        return {
            ...element,
            qty_db:Number(element.qty_db).toLocaleString('it-IT'),
            qty:Number(element.qty).toLocaleString('it-IT'),
            cod_cli_complessivo: getCodiceClienteComplessivo.CodiceCliente,
            cod_cli_padre: getCodiceClientePadre.CodiceCliente,
            cod_cli_elemento: getCodiceClienteElemento.CodiceCliente
        }

    })
    response = await Promise.all(withCliCode)
    if (linee_prodotto) {
        const withLineaProdottoPromise = response.map(async (element: any) => {
            const lp: any = await GetLineeProdotto(element.elemento)

            return {
                ...element,
                ...lp
            }
        })
        const withLineaProdotto = await Promise.all(withLineaProdottoPromise)
        response = withLineaProdotto
    }


    switch (type) {
        case 'csv':
            const mapping = response.map((row:any)=>{
                const {id,...el} = row
                return {
                    ...el
                }
            })
            const csv = jsonToCsv(mapping)
            fs.writeFileSync(path.resolve(__dirname, '..', 'download', 'distinta.csv'), csv)
            return res.download(path.resolve(__dirname, '..', 'download', 'distinta.csv'))
        default:
            return res.json({
                boms: response
            })
    }
}

export const getBomByElement = async (req: Request, res: Response) => {

    const elemento = req.query.elemento
    const qty = req.query.qty
    const linee_prodotto = req.query.lp || false
    console.log(elemento,qty)
    if (!elemento || !qty) {
        return res.json({
            message: 'qty e elemento sono obbligatori'
        })
    }
    const alternativa = Number(req.query.alt) || 1
    await bomExplodedRepository.query(`delete from bom_exploded`)
    const bom = new Bom({
        complessivo: elemento as string,
        padre: elemento as string,
        qty: Number(qty),
        lev: 1,
        alt: alternativa
    })
    await bom.explode()
    let response = await bomExplodedRepository.query(`select * from bom_exploded order by lev,padre,elemento`)

    const withCliCode = response.map(async (element: any) => {
        const getCodiceCliente = await GetCodiceCliente(element.elemento)
       

        return {
            ...element,
            qty_db:Number(element.qty_db).toLocaleString('it-IT'),
            qty:Number(element.qty).toLocaleString('it-IT'),
            cod_cli: getCodiceCliente,
            ITMDES1_0: element.ITMDES1_0,
            ITMDES2_0: element.ITMDES2_0,
            ITMDES3_0: element.ITMDES3_0
        }

    })
  
    response = await Promise.all(withCliCode)
    if (linee_prodotto) {
        const withLineaProdottoPromise = response.map(async (element: any) => {
            const lp: any = await GetLineeProdotto(element.elemento)

            return {
                ...element,
                ...lp
            }
        })
        const withLineaProdotto = await Promise.all(withLineaProdottoPromise)
        return res.json({
            boms: withLineaProdotto
        })
    }
   
    console.log(response.length)
    res.json({
        bom: response
    })
}