import 'dotenv/config';
import app from "./app.js";
import './database/index.js';

const port = Number(process.env.PORT || 3000);

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
