const	express = require("express"),
		router = express.Router();

router.get("/*", (req, res) => {
	err = "Sorry, can't find that!"
	console.log("invalid url requested: " + req.url);
	req.flash("error", err)
	res.redirect("/");
});

module.exports = router;