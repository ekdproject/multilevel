"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = void 0;
const mssql_1 = __importDefault(require("mssql"));
const { SERVER, DATABASE, USER, PASSWORD } = process.env;
const timeout = 120000000;
const connection = new mssql_1.default.ConnectionPool({
    server: SERVER,
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
});
let connect = null;
const executeQuery = async (query) => {
    if (!(connect instanceof mssql_1.default.ConnectionPool)) {
        connect = await connection.connect();
    }
    const { recordset } = await connect.query(query);
    return recordset;
};
exports.executeQuery = executeQuery;
exports.default = connection;
