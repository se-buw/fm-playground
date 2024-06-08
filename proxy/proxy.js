const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/', createProxyMiddleware({ 
  target: 'http://localhost:8080', // this is your target server
  changeOrigin: true,
}));

app.listen(5000); // this is the port your client will connect to