import sql from 'mssql'
const {
    SERVER,
    DATABASE,
    USER,
    PASSWORD
} = process.env

const timeout = 120_000_000;

const connection = new sql.ConnectionPool({
    server: SERVER as string,
    database: DATABASE,
    user: USER,
    password: PASSWORD,
    options: {
        encrypt: false,
        enableArithAbort: true
    },
    requestTimeout: timeout,
    pool: {
        idleTimeoutMillis: timeout,
        acquireTimeoutMillis: timeout,
        createTimeoutMillis: timeout,
        destroyTimeoutMillis: timeout,
        reapIntervalMillis: timeout,
        createRetryIntervalMillis: timeout
    }
})
let connect : any=null;
export const executeQuery = async (query: string) => {

    if(!(connect instanceof sql.ConnectionPool)){
        connect = await connection.connect()
    }
    const { recordset } = await connect.query(query)

    return recordset

}
export default connection