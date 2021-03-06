// requiring environment variables
require('dotenv').config();

// requiring packages
const 	express 			= require("express"),
		app 				= express(),
		bodyParser 			= require("body-parser"),
		mongoose 			= require("mongoose"),
		passport 			= require("passport"),
		localStrategy		= require("passport-local"),
		methodOverride 		= require("method-override"),
		flash				= require("connect-flash"),
		uuid				= require("uuid");

// requiring models
const	User				= require("./models/user"),
		Campground			= require("./models/campground"),
		Comment				= require("./models/comment"),
	  	Notification		= require("./models/notification");
		
// requiring routes
const 	indexRoutes			= require("./routes/index"),
		campgroundRoutes 	= require("./routes/campgrounds"),
		commentRoutes 		= require("./routes/comments"),
		errorRoutes			= require("./routes/errors");

/**
* Main app file. This file runs the web application.
* @module lib/app
* @requires express
* @requires body-parser
* @requires mongoose
* @requires passport
* @requires passport-local
* @requires method-override
* @requires connect-flash
* @requires moment
* @requires lib/models/user
* @requires lib/models/campground
* @requires lib/models/comment
* @requires lib/routes/index
* @requires lib/routes/campgrounds
* @requires lib/routes/comments
* @requires lib/routes/errors
* @requires dotenv
* @author Jose Nicolas Mora
*/

/** 
* Sets parsing of the URL-encoded data to be done with the qs library.
* @name use/body-parser
* @function
* @memberof module:lib/app
* @inner
* @param {callback} middleware - body parser middleware
 */
app.use(bodyParser.urlencoded({extended: true}));
// app.set('views', __dirname + '/lib/views');

/** 
* Sets the path in which the views folder is found.
* @name set/views
* @function
* @memberof module:lib/app
* @inner
* @param {string} views - views folder name
* @param {string} path - path of views folder
 */
app.set('views', __dirname + process.env.VIEWS_PATH);

/** 
* Sets the view engine as being ejs (embedded javascript).
* @name set/view-engine
* @function
* @memberof module:lib/app
* @inner
* @param {string} viewEngine - view engine variable
* @param {string} path - The default engine extension to use when omitted.
 */
app.set("view engine", "ejs");

/** 
* Set the path from which static content for the app will be served.
* @name use/static-content
* @function
* @memberof module:lib/app
* @inner
* @param {callback} cb - Callback with path from which static content for the app will be served.
 */
app.use(express.static(__dirname + "/../public"));

/** 
 * Override the express.req.method property with a new value (string).
 * @name use/method-override
 * @function
 * @memberof module:lib/app
 * @inner
 * @param {string} getter - The getter to use to look up the overridden request method for the request.
 */
app.use(methodOverride("_method"));

/** 
* Enable flash middleware for flashing messages to a user's screen.
* @name use/flash
* @function
* @memberof module:lib/app
* @inner
* @param {callback} cb - Flash initializer callback.
*/
app.use(flash());

/** 
* Fix deprecation warnings for parsing MongoDB connection strings.
* @name set/useNewUrlParser
* @function
* @memberof module:lib/app
* @inner
* @param {string} deprecationType - deprecation warning type
* @param {boolean} - set to true if new tool for parsing MongoDB connection strings should be used.
*/
mongoose.set('useNewUrlParser', true);

/** 
* Fix deprecation warnings for using Mongoose native findOneAndUpdate method.
* @name set/useFindAndModify
* @function
* @memberof module:lib/app
* @inner
* @param {string} deprecationType - deprecation warning type
* @param {boolean} - set to true if MongoDB driver's findOneAndUpdate() should be used.
*/
mongoose.set('useFindAndModify', false);

/** 
* Fix deprecation warnings for using MongoDB driver's ensureIndex() method.
* @name set/useCreateIndex
* @function
* @memberof module:lib/app
* @inner
* @param {string} deprecationType - deprecation warning type
* @param {boolean} - set to true if MongoDB driver's createIndex() method should be used instead.
*/
mongoose.set('useCreateIndex', true);

/** 
* Fix deprecation warnings for the use of the new MongoDB driver's topology engine.
* @name set/useUnifiedTopology
* @function
* @memberof module:lib/app
* @inner
* @param {string} deprecationType - deprecation warning type
* @param {boolean} - set to true if MongoDB driver's new topology engine should be used.
*/
mongoose.set('useUnifiedTopology', true);

/** 
* local database port
* @const
* @default
*/
const DB_URL_LOCAL = "mongodb://localhost:27017/yelp_camp";

/** 
* Sets type of promises used by mongoose.
* @name mongoose-promise-setter
*
*/
mongoose.Promise = global.Promise;

/** 
* Connection URI to database cluster.
* @see {@link https://docs.mongodb.com/ecosystem/drivers/node/} for more details.
* @const
* @default
*/
const DB_URL = "mongodb+srv://"  + 
				process.env.DB_USERNAME + ":" + 
				process.env.DB_PASSWORD + "@" + 
				process.env.DB_URL + "/" + 
				process.env.DB_NAME + "?retryWrites=true&w=majority"
				|| DB_URL_LOCAL;

/** 
* Connect to MongoDB instance with Connection URI.
* @name mongoose-connection
* @function
* @memberof module:lib/app
* @inner
* @param {string} DB_URI - Connection URI for connecting to MongoDB
*/
mongoose.connect(DB_URL)
.then(() => console.log("Database connected to: " + process.env.DB_NAME))
.catch(() => console.log("Database failed to connect to: " + process.env.DB_NAME));

/** 
* Moment middleware module used for determining time at which an event occurs.
* @name momment-middleware
* memberof module:lib/app
* @inner
 */
app.locals.moment = require("moment");

app.locals.rmWhitespace = true;
/** 
* Session middleware.
* @name use/express-session
* @function
* @memberof module:lib/app
* @inner
* @param {callback} cb - callback used for configuring session.
*/
app.use(require("express-session")({
	secret: uuid.v4(),
	resave: false,
	saveUninitialized: false,
}));

/** 
* Middleware for initializing Passport module.
* @name use/passport-initialize
* @function
* @memberof module:lib/app
* @inner
* @param {callback} cb - callback used for initializing session.
*/
app.use(passport.initialize());

/** 
* Middleware for allowing Passport module to work with persistent login sessions.
* @name use/passport-session
* @function
* @memberof module:lib/app
* @inner
* @param {callback} cb - callback used for configuring passport session.
*/
app.use(passport.session());

/** 
* Middleware for defining the Passport local strategy as defined by module:lib/models/user.
* @name use/local-strategy
* @function
* @memberof module:lib/app
* @inner
* @param {callback} cb - callback used for configuring local strategy.
*/
passport.use(new localStrategy(User.authenticate())); // make local strategy User's 

// passport local mongoose strategy
/** 
* Middleware for serializing user instance to and from session.
* @name use/serialize-user
* @function
* @memberof module:lib/app
* @inner
* @param {callback} cb - callback used serialization.
*/
passport.serializeUser(User.serializeUser());

/** 
* Middleware for deserializing user instance to and from session.
* @name use/deserialize-user
* @function
* @memberof module:lib/app
* @inner
* @param {callback} cb - callback used deserialization.
*/
passport.deserializeUser(User.deserializeUser());

/** 
* Middleware for setting currentUser local application variable, populating user notifications, and setting error or success messages if available.
* @name use/initialize-webpage-vars
* @function
* @memberof module:lib/app
* @inner
* @param {callback} cb - callback used for setting web page variables.
*/
app.use(async (req, res, next) => {
	res.locals.currentUser = req.user;
	if(req.user) { // if anyone is logged in via passport
		try {
			// only populate notifications that have not been read
			const query = {_id: req.user._id};
			let user = await User.findOne(query)
				.populate("notifications", null, { isRead: false })
				.exec();
			for(let notification of user.notifications) {
				await notification.populate("followedUser").execPopulate();
			}
			res.locals.notifications = user.notifications.reverse(); // descending notifications
		}
		catch(err) {
			console.log(err);
		}
	}
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


/**
* Middleware for creating unique ids
*/
app.locals.uuid = uuid;

/** 
* Middleware for defining index route groups (generally routes for model:lib/models/user)
* @name use/index-routes
* @function
* @memberof module:lib/app
* @inner
* @param {callback} cb - index routes module.
*/
app.use(indexRoutes);

/** 
* Middleware for defining module:lib/models/campground route groups.
* @name use/campground-routes
* @function
* @memberof module:lib/app
* @inner
* @param {string} path - path for which specified routes are invoked
* @param {callback} cb - campground routes module.
*/
app.use("/campgrounds", campgroundRoutes);

/** 
* Middleware for defining module:lib/models/comment route groups.
* @name use/comment-routes
* @function
* @memberof module:lib/app
* @inner
* @param {string} path - path for which specified routes are invoked
* @param {callback} cb - comment routes module.
*/
app.use("/:parent/:parent_id/comments", commentRoutes);
// app.use("/comments", commentRoutes);

/** 
* Middleware for defining error route groups.
* @name use/error-routes
* @function
* @memberof module:lib/app
* @inner
* @param {string} path - path for which specified routes are invoked
* @param {callback} cb - error routes module.
*/
app.use(errorRoutes);


/** 
* Tell Express to listen for requests (start server)
* @const
* @default
*/
const port = process.env.PORT || 80;

/** 
* Middleware for starting a UNIX socket and listens for connections on a given path.
* @name app/listen
* @function
* @memberof module:lib/app
* @inner
* @param {string} port - Connection path for main application.
* @param {callback} - Callback used for presenting visual text confirmation of connection.
*/
app.listen(port, () => { 
	console.log(`YelpCamp server listening on port ${port}`); 
});