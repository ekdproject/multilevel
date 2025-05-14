import { bomWithUploadFile, getBomByElement } from '@controllers/bom.controller'
import { uploader } from '@services/UploadStorage'
import {Router} from 'express'

const bomRouter = Router()

bomRouter.post('/',getBomByElement)
bomRouter.post('/upload',uploader.single('elementi'),bomWithUploadFile)

export default bomRouter