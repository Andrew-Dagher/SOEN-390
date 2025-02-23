/**
 * @file routesSetup.js
 * @description Configures the Express application with middlewares for JSON parsing, 
 * cookie handling, and CORS. Also registers the test router for the "/test" endpoint.
 */

const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParkser = require("cookie-parser"); // Middleware to parse cookies

// Import the test router to handle routes under "/test"
const testRouter = require("../routes/testRouter");

// Import logger to log startup events
const logger = require('./logger');

// Log that the route setup is starting
logger.info("Route Startup");

/**
 * Configures the provided Express application with necessary middlewares and routes.
 *
 * @param {object} app - The Express application instance.
 */
module.exports = (app) => {
  // Middleware to parse JSON request bodies
  app.use(express.json());
  
  // Middleware to parse cookies in incoming requests
  app.use(cookieParkser());
  
  // Enable Cross-Origin Resource Sharing (CORS) with credentials support for any origin
  app.use(
    cors({
      credentials: true,
      origin: '*',
    })
  );

  // Register the test router to handle GET requests on the "/test" route
  app.get("/test", testRouter);
};
