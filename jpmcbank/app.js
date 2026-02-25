var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var client = require('prom-client');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { default: mongoose } = require('mongoose');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

/*PROMETHEUS METRICS SETUP*/
const register = new client.Registry();

// Collect default Node.js metrics into this registry
client.collectDefaultMetrics({ register });

// HTTP Request Counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register], // 🔥 attach to custom registry
});

// HTTP Duration Histogram (for p95, p99)
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 3, 5],
  registers: [register], // 🔥 attach to custom registry
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;

    const route = req.baseUrl || req.path;

    httpRequestCounter.inc({
      method: req.method,
      route: route,
      status: res.statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route: route,
        status: res.statusCode,
      },
      duration
    );
  });

  next();
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jpmcbank';

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to database'))
  .catch((err) => {
    console.log('Error in connecting to database');
    console.log(err);
  });

module.exports = app;