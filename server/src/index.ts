import { config } from 'dotenv'
config()
import "reflect-metadata"
import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import LocalDb from '@config/Local.connection'
import { uploader } from '@services/UploadStorage'
import bomRouter from '@routes/bom.route'



const app: Application = express()

//local database
LocalDb.connect().then((connection) => {
    console.log('db connecxted')
    LocalDb.synchronize().then(() => {
        console.log('db syncronized')
    }).catch(error => {
        console.log(error)
    })

}).catch(error => {
    console.log(error)
})



app.use(cors())

app.get('/', (req: Request, res: Response) => {
    res.json({
        data: 'data'
    })
})

app.use('/bom', bomRouter)

app.listen(5006, () => {
    console.log(`http://localhost:5000`);
})
