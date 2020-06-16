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
		flash				= require("connect-flash");

// requiring models
const	User				= require("./models/user"),
		Campground			= require("./models/campground"),
		Comment				= require("./models/comment");
		

// requiring routes
const 	indexRoutes			= require("./routes/index"),
		campgroundRoutes 	= require("./routes/campgrounds"),
		commentRoutes 		= require("./routes/comments"),
		errorRoutes			= require("./routes/errors");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// fix deprecation warnings for mongo db
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// connect to db
// const dbURL = "mongodb://localhost:27017/yelp_camp";
/**
 * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
 * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
 */
mongoose.Promise = global.Promise;
const DB_URL = "mongodb+srv://"  + 
				process.env.DB_USERNAME + ":" + 
				process.env.DB_PASSWORD + "@" + 
				process.env.DB_URL + "/" + 
				process.env.DB_NAME + "?retryWrites=true&w=majority";

mongoose.connect(DB_URL)
.then(() => console.log("Database connected to: " + DB_URL))
.catch(() => console.log("Database failed to connect to: " + DB_URL));

// Moment
app.locals.moment = require("moment");

// PASSPORT CONFIG
app.use(require("express-session")({
	secret: "Once again Rusty wins",
	resave: false,
	saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); // make local strategy User's passport local mongoose strategy
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req, res, next) => {
	res.locals.currentUser = req.user;
	if(req.user) { // if anyone is logged in via passport
		try {
			// only populate notifications that have not been read
			let user = await User.findById(req.user._id).populate("notifications", null, { isRead: false }).exec();
			res.locals.notifications = user.notifications.reverse(); // descending notifications
		}
		catch(err) {
			console.log(err);
			console.trace();
		}
	}
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

// Use other route groups
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use(errorRoutes);

// Tell Express to listen for requests (start server)
app.listen(3000, () => { 
	console.log('YelpCamp server listening on port 3000'); 
});

// alternatively, in terminal: PORT=3000 node app.js