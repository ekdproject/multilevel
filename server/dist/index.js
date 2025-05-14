"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const Local_connection_1 = __importDefault(require("./config/Local.connection"));
const bom_route_1 = __importDefault(require("./routes/bom.route"));
const app = (0, express_1.default)();
//local database
Local_connection_1.default.connect().then((connection) => {
    console.log('db connecxted');
    Local_connection_1.default.synchronize().then(() => {
        console.log('db syncronized');
    }).catch(error => {
        console.log(error);
    });
}).catch(error => {
    console.log(error);
});
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.json({
        data: 'data'
    });
});
app.use('/bom', bom_route_1.default);
app.listen(5006, () => {
    console.log(`http://localhost:5000`);
});
