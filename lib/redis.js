const express = require('express');
const redis = require('redis');

const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST;
const redisClient = redis.createClient(redisPort, redisHost);

const rateLimitMillis = 60000;
const maxRequests = 5;

function getTokenBucket(ip) {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(ip, (err, tokenBucket) => {
      if(err) {
        reject(err);
      } else {
        if (tokenBucket) {
          tokenBucket.token = parseFloat(tokenBucket.tokens);
        } else {
          tokenBucket = {
            toekns: maxRequests,
            last: Date.now()
          };
        }
        resolve(tokenBucket);
      }
    });
  });
}


function saveTokenBucket(ip, tokenBucket) {
  return new Promise((resolve, reject) => {
    redisClient.hmset(ip, tokenBucket, (err, result) => {
      if (err){
        reject(err);
      } else {
        resolve()
      }
    });
  });
}


async function rateLimit(req, res, next) {
  try {
    const tokenBucket = await getTokenBucket(req.ip);
    const timestamp = Date.now();
    const ellapsedMillis = timestamp - tokenBucket.last;
    const refreshRate = maxRequests / rateLimitMillis;
    tokenBucket.tokens += refreshRate * ellapsedMillis;
    tokenBucket.tokens = Math.min(maxRequests, tokenBucket.tokens);
    tokenBucket.last = timestamp;

    if (tokenBucket.tokens >= 1) {
      tokenBucket.tokens -= 1;
      saveTokenBucket(req.ip, tokenBucket);
      next();
    } else {
      saveTokenBucket(req.ip, tokenBucket);
      res.status(429).send({
        error: "Too many requests per minute"
      });
    }
  } catch (err) {
    console.error(err);
    next();
  }
}
exports.rateLimit = rateLimit;
