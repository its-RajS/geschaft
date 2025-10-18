import swaggerAutogen from 'swagger-autogen';

const docs = {
  info: {
    title: 'Auth Service API',
    description: 'Automatically generated swagger docs',
    version: '1.0.0',
  },
  host: 'localhost:6001',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endPoint = ['./routes/user.routes.ts'];

swaggerAutogen()(outputFile, endPoint, docs);
