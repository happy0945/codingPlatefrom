const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator');
const cors = require('cors');

const { initSubmissionWorker } = require('./workers/submissionWorker');
const { initRunWorker } = require('./workers/runWorker');

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://coding-platefrom.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);

const PORT = process.env.PORT || 5000;

const InitializeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log('DB & Redis Connected');

    // Initialize BullMQ Workers
    initSubmissionWorker();
    initRunWorker();
    console.log('BullMQ Workers Initialized');

    app.listen(PORT, () => {
      console.log('Server listening at port number: ' + PORT);
    });
  } catch (err) {
    console.log('Error: ' + err);
  }
};

InitializeConnection();
