"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bom_controller_1 = require("../controllers/bom.controller");
const UploadStorage_1 = require("../services/UploadStorage");
const express_1 = require("express");
const bomRouter = (0, express_1.Router)();
bomRouter.post('/', bom_controller_1.getBomByElement);
bomRouter.post('/upload', UploadStorage_1.uploader.single('elementi'), bom_controller_1.bomWithUploadFile);
exports.default = bomRouter;
