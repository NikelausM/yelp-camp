"use strict";
const	express = require("express"),
		router = express.Router();

/**
* RESTful routes for handling invalid url requests.
* @module lib/routes/errors
* @requires express
* @requires router
* @author Jose Nicolas Mora
*/

/**
* Presents a user-friendly error if the user requests a route that doesn't exist.
* @name get/*
* @function
* @memberof module:lib/routes/errors
* @inner
* @param {string} path - The route requested.
* @param {callback} middleware - The callback function containing the logic of this route.
*/
router.get("/*", (req, res) => {
	const err = "Sorry, can't find that!"
	console.log(err);
	console.log("invalid url requested: " + req.url);
	req.flash("error", err)
	res.redirect("/");
});

module.exports = router;