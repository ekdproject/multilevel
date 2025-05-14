

/* interface Child {
    ITMREF_0: string,
    CPNITMREF_0: string,
    QTY_DB:number
} */

import BomExploded from '@models/BomExploded'
import { executeQuery } from '@config/Sage.connection'
import LocalDataSource from '@config/Local.connection'

export interface BomProps {
    complessivo: string,
    padre: string,
    qty: number,
    lev: number,
    alt: number
}

const bomExplodedRepository = LocalDataSource.getRepository(BomExploded)

class Bom {

    complessivo: string
    padre: string
    qty: number
    lev: number
    alt: number


    constructor({
        complessivo,
        padre,
        qty,
        lev,
        alt
    }: BomProps) {
        this.complessivo = complessivo
        this.padre = padre
        this.qty = qty
        this.lev = lev
        this.alt = alt
    }

    async hasChild(ITMREF_0: string) {
        const query = `select count(ITMREF_0) as count from PRODEKD.BOM where  BOMALT_0=${this.alt} and ITMREF_0='${ITMREF_0}'`

        const result = await executeQuery(query)
        if (result[0].count > 0) {
            return true
        } else {
            return false
        }
    }

    async getChilds(ITMREF_0: string) {
        const query = `SELECT ITMREF_0,CPNITMREF_0,BOMQTY_0,BOMUOM_0,SCA_0,
        (select TCLCOD_0 from PRODEKD.ITMMASTER where ITMMASTER.ITMREF_0=BOMD.CPNITMREF_0) as TCLCOD_0 ,
        (select ITMDES1_0 from PRODEKD.ITMMASTER where ITMMASTER.ITMREF_0=BOMD.CPNITMREF_0) as ITMDES1_0 ,
        (select ITMDES2_0 from PRODEKD.ITMMASTER where ITMMASTER.ITMREF_0=BOMD.CPNITMREF_0) as ITMDES2_0 ,
        (select ITMDES3_0 from PRODEKD.ITMMASTER where ITMMASTER.ITMREF_0=BOMD.CPNITMREF_0) as ITMDES3_0 
        FROM PRODEKD.BOMD WHERE BOMALT_0=${this.alt} and ITMREF_0='${ITMREF_0}'`

        const result = await executeQuery(query)


        return result
    }

    createNewBom(ITMREF_0: string) { }

    async explode() {

        const hasChilds = await this.hasChild(this.padre)

        if (hasChilds) {

            //se ha distinta base
            const childs = await this.getChilds(this.padre)
            
            //inserisci gli elementi
            const childsPromise = childs.map(async (child: any) => {
                if (this.padre == 'M00009271') {
                    console.log(child.CPNITMREF_0)
                }
                const insertChild = bomExplodedRepository.create({
                    complessivo: this.complessivo,
                    padre: child.ITMREF_0,
                    elemento: child.CPNITMREF_0,
                    catagoria: child.TCLCOD_0,
                    desc_1: child.ITMDES1_0,
                    desc_2: child.ITMDES2_0,
                    desc_3: child.ITMDES3_0,
                    qty_db: child.BOMQTY_0,
                    qty: Number(child.BOMQTY_0) * Number(this.qty),
                    lev: this.lev,
                    sfrido: child.SCA_0,
                    um: child.BOMUOM_0
                })

                await bomExplodedRepository.save(insertChild)

                const bm = new Bom({
                    complessivo: this.complessivo,
                    padre: child.CPNITMREF_0,
                    qty: Number(child.BOMQTY_0) * Number(this.qty),
                    lev: this.lev + 1,
                    alt: this.alt
                })
                await bm.explode()
            })

            await Promise.all(childsPromise)
        } else {

        }
    }
}
export default Bom