/**
 * @file testRouter.js
 * @description Express route handler for the test endpoint. Logs a message and responds with a JSON message.
 */

const logger = require("../startup/logger");

/**
 * Handles the test route by logging a message and returning a JSON response.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
const testRouter = (req, res) => {
  // Log that the test route was called successfully.
  logger.info("testRouter Called OK");
  
  // Respond with a JSON message indicating the test route is working.
  res.json("Test Router OK");
};

module.exports = testRouter;
