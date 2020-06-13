const 	mongoose	= require("mongoose"),
	  	User		= require("./models/user"),
		Campground	= require("./models/campground"),
		Comment		= require("./models/comment");



var campgroundSeeds = [
	{
		name: "Clearwater Tipi Park",
		price: 45.60,
		image: "https://lh5.googleusercontent.com/p/AF1QipMtc-XQcOupE94QpEADu8rgNglQrb_5VQMlHbY6=w426-h240-k-no",
		description: "A campground with a great view.",
		location: "241050 Clearwater Dr, Calgary, AB T3Z 2V4",
		author: User.find({"username": "Nicolas"}),
	},
	{
		name: "Calgary West Campground",
		price: 22.20,
		image: "https://lh5.googleusercontent.com/p/AF1QipOegOZBN_T6FXtTQ69WstIdszdqewJ37GZITf41=w480-h520-p-k-no",
		description: "A fun place to camp with friends. Highly recommended!",
		location: "221 101 St SW, Calgary, AB T3B 5T2",
		author: User.find({"username": "Nicolas"}),
	},
	{
		name: "Gooseberry Campground",
		price: 20.56,
		image: "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.albertawow.com%2Fcampgrounds%2FGooseberry_campground%2FGooseberry%2520Campground%2520Alberta%25207107.JPG&f=1&nofb=1",
		description: "A great place to enjoy nature. Just beautiful!",
		location: "AB-66, Bragg Creek, AB T0L 0K0",
		author: User.find({"username": "Nicolas"}),
	},
];

var commentSeeds = [
	{
		text: "That place is really beautiful!",
		author: User.find({"username": "Nicolas"}),
	},
	{
		text: "Wow, I really want to go there!",
		author: User.find({"username": "Nicolas"}),
	},
	{
		text: "That looks amazing! I should check it out!",
		author: User.find({"username": "Nicolas"}),
	},
	{
		text: "How are the hiking routes there?",
		author: User.find({"username": "Nicolas"}),
	},
	{
		text: "My family and I would love to go there. It looks great.",
		author: User.find({"username": "Nicolas"}),
	},
];


async function clearDB() {
	console.log("Clearing DB");
	await Comment.deleteMany({});
	console.log("Comments removed!");
	await Campground.deleteMany({});
	console.log("Campgrounds removed!");
}

async function seedDB() {
	console.log("Seeding DB");
	let commentIdx = 0;
	for(const campgroundSeed of campgroundSeeds) {
		let campground = await Campground.create(campgroundSeed);
		console.log("Campground created!");
		let comment = await Comment.create(commentSeeds[commentIdx])
		console.log("Comment created!");
		commentIdx++;
		campground.comments.push(comment);
		campground.save();
	}
}

function refreshSeedDB() {
	clearDB()
	.then(seedDB())
	.catch(err => console.log("There was an error refresh seeding DB: " + err));
};

module.exports = refreshSeedDB;