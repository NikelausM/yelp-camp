"use strict";
const	express = require("express"),
		router = express.Router();

/**
@module ErrorRoutes.
*/

/**
* Presents a user-friendly error if the user requests a route that doesn't exist.
* @param {string} The rout requested.
* @param {Function} The callback function containing the logic of this route.
*/
router.get("/*", (req, res) => {
	const err = "Sorry, can't find that!"
	console.log("invalid url requested: " + req.url);
	req.flash("error", err)
	res.redirect("/");
});

module.exports = router;