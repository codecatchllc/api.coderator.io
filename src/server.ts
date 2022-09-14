import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import routes from './routes';
import config from './utils/config';

const app: express.Application = express();

app.enable('json spaces');
app.enable('strict routing');
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: `${config.PROTOCOL}://${config.CLIENT_URL}`,
    credentials: true,
  })
);
app.use(express.json());
app.set('trust proxy', config.NODE_ENV === 'production' ? 1 : 0);
app.use(routes);

app.listen(config.PORT, () => {
  console.log(`Listening on port ${config.PORT}`);
});

export default app;
