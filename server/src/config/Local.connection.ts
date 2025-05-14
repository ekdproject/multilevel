import BomExploded from 'src/models/BomExploded'
import { DataSource } from 'typeorm'

console.log(process.env.PG_HOST)
const LocalDataSource = new DataSource({
    type: 'postgres',
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    entities: [BomExploded],
    synchronize: true
})

export default LocalDataSource