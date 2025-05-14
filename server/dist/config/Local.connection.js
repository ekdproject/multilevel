"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BomExploded_1 = __importDefault(require("src/models/BomExploded"));
const typeorm_1 = require("typeorm");
console.log(process.env.PG_HOST);
const LocalDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    entities: [BomExploded_1.default],
    synchronize: true
});
exports.default = LocalDataSource;
