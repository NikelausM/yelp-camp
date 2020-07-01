const 	mongoose	= require("mongoose"),
passport	= require("passport"),
User		= require("../../../lib/models/user"),
Campground	= require("../../../lib/models/campground"),
Comment		= require("../../../lib/models/comment"),
Notification		= require("../../../lib/models/notification");

const CampgroundController	= require("../../../lib/controllers/campground-controller");

var userSeeds = [
    {
        username: "johnny",
        password: "123",
        avatar: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.7c3Sxl9sIqfK_2ZrHDIDNwHaG1%26pid%3DApi&f=1",
        firstName: "John",
        lastName: "Smith",
        email: "jsmith@gmail.com",
        isAdmin: true,
    },
    {
        username: "jackofhearts",
        password: "456",
        avatar: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fres.cloudinary.com%2Fteepublic%2Fimage%2Fprivate%2Fs--1JwP1QQk--%2Ft_Preview%2Fb_rgb%3Affffff%2Cc_limit%2Cf_jpg%2Ch_630%2Cq_90%2Cw_630%2Fv1494244008%2Fproduction%2Fdesigns%2F1583244_1.jpg&f=1&nofb=1",
        firstName: "Jack",
        lastName: "Hearts",
        email: "jhearts@gmail.com",
        isAdmin: false,
    },
    {
        username: "soccer4life",
        password: "789",
        avatar: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.p6eeQhZwQjNovIO2T3oe4AHaHa%26pid%3DApi&f=1",
        firstName: "Sergio",
        lastName: "Cortez",
        email: "sergcortez@gmail.com",
        isAdmin: false,
    },
]

var campgroundSeeds = [
    {
        name: "Clearwater Tipi Park",
        price: 45.60,
        image: "https://lh5.googleusercontent.com/p/AF1QipMtc-XQcOupE94QpEADu8rgNglQrb_5VQMlHbY6=w426-h240-k-no",
        description: "A campground with a great view.",
        location: "241050 Clearwater Dr, Calgary, AB T3Z 2V4",
    },
    {
        name: "Calgary West Campground",
        price: 22.20,
        image: "https://lh5.googleusercontent.com/p/AF1QipOegOZBN_T6FXtTQ69WstIdszdqewJ37GZITf41=w480-h520-p-k-no",
        description: "A fun place to camp with friends. Highly recommended!",
        location: "221 101 St SW, Calgary, AB T3B 5T2",
    },
    {
        name: "Gooseberry Campground",
        price: 20.56,
        image: "https://lh5.googleusercontent.com/p/AF1QipO4YSHTv4mvdeoLfjhCStasqW_aXRv2eVbjKk4Q=w408-h306-k-no",
        description: "A great place to enjoy nature. Just beautiful!",
        location: "AB-66, Bragg Creek, AB T0L 0K0",
    },
];

var commentSeeds = [
    {
        text: "That place is really beautiful!",
    },
    {
        text: "Wow, I really want to go there!",
    },
    {
        text: "That looks amazing! I should check it out!",
    },
    {
        text: "How are the hiking routes there?",
    },
    {
        text: "My family and I would love to go there. It looks great.",
    },
];

async function seedAll() {
    try {
        console.log("seeding database");
        await User.deleteMany({});
        console.log("deleted users");
        await Campground.deleteMany({});
        console.log("deleted campgrounds");
        await Comment.deleteMany({});
        console.log("deleted comments");
		await Notification.deleteMany({});
		console.log("deleted notifications");
        
        // Add user to database
        const userSeed = userSeeds[0];
        let author = await User.findOne({username: userSeed.username});
        for(const userSeed of userSeeds) {
            const newUser = new User({
                username: userSeed.username, 
                firstName: userSeed.firstName, 
                lastName: userSeed.lastName,
                email: userSeed.email,
                avatar: userSeed.avatar,
                isAdmin: userSeed.isAdmin,
            });
            console.log("new user: " + newUser);
            author = await User.register(newUser, userSeed.password);
        };
        
        console.log("seeded users");
        
		
		
        commentIdx = 0;
        // campgroundSeeds.forEach(async (campgroundSeed) => {
		for(const campgroundSeed of campgroundSeeds) {
			await (async () => {
            // Create campground and comment using seeds
            const campground = await Campground.create(campgroundSeed);
			
			await CampgroundController.setCampgroundLocData(campground);
			
            console.log("seeded campground");
            // if (commentIdx < commentSeeds.length) {
                const comment = await Comment.create(commentSeeds[commentIdx++]);
            //  }
            console.log("seeded comment");
            // Associate author with campground
            campground.author.id = author._id;
            campground.author.username = author.username;
			
			// Associate campground with author
			await author.campgrounds.push(campground);
			await author.save();

            // Associate author with comment
            comment.author.id = author._id;
            comment.author.username = author.username;
            await comment.save();

            // Add comment to campground
            await campground.comments.push(comment);
            await campground.save();
        	})()
			.catch(err => console.log(err));
		}
        console.log("finished seeding");
    }
    catch(err) {
        console.log(err);
        console.trace();
    }
}

module.exports = seedAll;