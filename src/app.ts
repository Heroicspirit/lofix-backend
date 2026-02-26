import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import authRouter from './routes/auth.route';
import adminRouter from './routes/admin/admin.route';
import songRouter from './routes/song.route';
import albumRouter from './routes/album.route';
import playlistRouter from './routes/playlist.route';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

dotenv.config();

console.log(process.env.PORT);

const app: Application = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:3005', 'http://192.168.1.67:5000'],
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/admin/users', adminRouter);
app.use('/api/songs', songRouter);
app.use('/api/albums', albumRouter);
app.use('/api', playlistRouter);
app.use('/upload', express.static(path.join(process.cwd(), 'upload'), {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.mp3') || path.endsWith('.wav') || path.endsWith('.ogg')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));
app.use('/images', express.static(path.join(process.cwd(), 'upload'), {
  maxAge: '1h',
  etag: true,
  lastModified: true
}));

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: "true", message: "Welcome to the API" });
});

export default app;