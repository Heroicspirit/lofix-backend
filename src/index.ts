import express, { Application, Request, Response } from 'express';
import bodyparser from 'body-parser';
import authRouter from './routes/auth.route';
import dotenv from 'dotenv';
import { PORT } from './config'
import { connectDatabase } from './database/mongodb';


dotenv.config();

console.log(process.env.PORT);

const app: Application = express();




app.use(bodyparser.json());

app.use('/api/auth',authRouter);


async function start() {
    await connectDatabase();
    app.listen(PORT, () => {
        console.log(`Server:http://localhost:${PORT}`)
    });
}
start();

