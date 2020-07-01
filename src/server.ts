import config from 'config';
import express from "express";
import * as bodyParser from "body-parser";
import bluebird from "bluebird";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router } from "./routes";
import { DatabaseService } from "./common/database/database-service";

async function main() {
    const port = config.PORT || 80;
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(cors());
    app.use(`${config.BASE_PATH}/importer`, router)
    app.get('/', function (req, res) {
        res.send("Welcome to crypto");
    });

    let server = app.listen(port);
    console.log('server is running on port: ', server.address()['port']);
    await DatabaseService.Instance.configure();
    console.log('connected to database');
}

main();