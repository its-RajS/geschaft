import swaggerAutogen from 'swagger-autogen';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docs = {
  info: {
    title: 'Auth Service API',
    description: 'Automatically generated swagger docs',
    version: '1.0.0',
  },
  host: 'localhost:6001',
  schemes: ['http'],
};

const outputFile = path.join(__dirname, 'swagger-output.json');
const endPoint = [path.join(__dirname, 'routes', 'user.routes.ts')];

swaggerAutogen()(outputFile, endPoint, docs);
