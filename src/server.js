import 'dotenv/config';
import app from "./app.js";
import './database/index.js';
import { ensureUploadsStructure } from './utils/uploadStorage.js';

const port = Number(process.env.PORT || 3000);

await ensureUploadsStructure();

const server = app.listen(port, () => console.log(`Server is running on port ${port} 🚀`));

server.on('error', (error) => {
    console.error('Failed to start HTTP server', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception', error);
});
