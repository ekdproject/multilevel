import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ name: 'bom_exploded' })
class BomExploded {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    complessivo: string
    
    @Column()
    padre: string

    @Column()
    elemento: string

    @Column()
    catagoria: string

    @Column()
    desc_1: string
    
    @Column()
    desc_2: string

    @Column()
    desc_3: string

    @Column({type:'float'})
    qty_db: number

    @Column({type:'float'})
    qty: number

    @Column()
    um: string

    @Column({type:'float'})
    sfrido: number

    @Column()
    lev:number
}
export default BomExploded
