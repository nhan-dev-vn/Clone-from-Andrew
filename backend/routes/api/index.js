// backend/routes/api/index.js
const router = require('express').Router();


// backend/routes/api/index.js
// ...
router.get("/test", (req, res) => {
    res.send('hello')
})

router.post('/test', function(req, res) {
    res.json({ requestBody: req.body });
    // res.send('hello')
  });

  // ...





module.exports = router;
