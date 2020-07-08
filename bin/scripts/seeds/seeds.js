// requiring environment variables
require('dotenv').config();

const   
		/**
		 * mongoose module
		 * @const
		 */
		mongoose 		= require("mongoose"),
		/**
		 * seed-all module
		 * @const
		 */
        seedAll         = require("./seed-all");

/**
* @requires mongoose
* @requires seed-all
* @author Jose Nicolas Mora
*/

// function seedAll() {
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
.then(() => console.log("connected to database"))
.then(() => seedAll())
.catch(err => console.log(err));