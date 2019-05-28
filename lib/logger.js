module.exports = (req, res, next) => {
    console.log("== New Request At: "+ new Date().toString());
    console.log("   -- Method: ", req.method);
    console.log("   -- URL: ", req.originalUrl);
    console.log("   -- User Agent: ", req.get('User-Agent'));
    next();
};