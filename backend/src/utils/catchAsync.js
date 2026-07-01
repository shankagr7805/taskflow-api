// wraps an async route handler so any rejected promise gets forwarded
// to the error handling middleware instead of crashing the process
module.exports = function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
