
const rateLimit = require("express-rate-limit");
 const aiLimiter = rateLimit({
windowMs: 60 * 1000,
max: 30,
message: 'Too many AI requests'
});

module.exports = aiLimiter;