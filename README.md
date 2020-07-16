<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">

<h1>
 <i class="fas fa-campground"></i>
  Yelp Camp
</h1>
  
<h2 id="table-of-contents">Table of contents</h2>

* [Introduction](#introduction)
* [Features](#features)
* [Launch](#launch)
* [Technologies](#technologies)
* [Documentation](#documentation)
* [Certificate](#certificate)

<h2 id="introduction">Introduction</h2>

This is a repository of my (Jose Nicolas Mora) YelpCamp project for the Udemy course, [The Web Developer Bootcamp](https://www.udemy.com/course/the-web-developer-bootcamp/).

Check out my [Github](https://github.com/NikelausM/)

Check out my [LinkedIn](https://linkedin.com/in/nicolas-mora-a54245105/)

<h2 id="features">Features</h2>

YelpCamp is a yelp style, campground themed website. It allows for users to browse and search campgrounds that the community adds. The campgrounds are rated using a "like" system, and the users are able to talk about the campgrounds through a campground comment system.

### Key Features
- RESTful routes
- Campground Search (Fuzzy)/Show/Edit/Delete
- User Show/Edit
- Liking Campgrounds
- Comments on Campgrounds
- Notifications
- Authentication
- Password reset with real emails
- Admin role
- Visible Campground location with Google mini-map and marker
- Image uploading to the cloud

### Added Features
- General
  - Object Oriented Javascript Refactor
    - My YelpCamp project is heavily refactored to take advantage of [ES6 syntax](https://www.ecma-international.org/ecma-262/6.0/index.html), including:
      - Classes (to make application more Object-Oriented)
      - Async/Await (to significantly reduce callbacks and ease asyncronous programming)
      - let and const (for increased control of scope)
      - etc
  - Nested comments
  - Pagination
  - Flash messages for showing helpful information to users
  - Meaningful error messages
  - Dynamic price feature
- Back-end
  - Extensive [documentation](https://nikelausm.github.io/yelp-camp/) using [JSDoc](https://jsdoc.app/)
  - Seperation of routes into [controller classes](https://github.com/NikelausM/yelp-camp/tree/master/lib/controllers) and [routes](https://github.com/NikelausM/yelp-camp/tree/master/lib/routes)
  - Improved mongoose middleware for models to resolve inter [model](https://github.com/NikelausM/yelp-camp/tree/master/lib/models) dependencies
  - [API helper classes](https://github.com/NikelausM/yelp-camp/tree/master/bin/helpers)
  - [Custom stack trace extending error classes](https://github.com/NikelausM/yelp-camp/blob/master/bin/errors/errors.js)
- Front-end
  - Mobile responsive front end design
  - Landing page animations
  - Wrapper class for wrapping models used in [View](https://github.com/NikelausM/yelp-camp/tree/master/lib/views) files to de-couple [Model](https://github.com/NikelausM/yelp-camp/tree/master/lib/models) (database) from [View](https://github.com/NikelausM/yelp-camp/tree/master/lib/views)
    - This allows a developer to use the same wrapper class in the views for any model, regardless of complexity
    - This increases encapsulation of models used in views
  - Modals for seing who likes a Campground
  - Modals for enlarging images
  - [Revamped profile page](https://github.com/NikelausM/yelp-camp/tree/master/lib/views/users/show.ejs)
  - Increased modularity of view layouts and partials, best exemplified by the [comments views](https://github.com/NikelausM/yelp-camp/tree/master/lib/views/comments)
  - Even more meaningful dynamic error messages
<h2 id="launch">Launch</h2>

### Setup
To install:
```
npm install https://github.com/NikelausM/yelp-camp/
```
To run:
```
node ./lib/app.js
```
To run and preserve asynchronous stack traces.
```
node ./lib/app.js --async-stack-trace
```

### Deployment
This application is deployed as a read-only version to the following link: https://yelp-camp-nikelausm.herokuapp.com/

You may use the following account to login:
- username: jackofhearts
- password: PNuYtb!2E!UZG&ryQ8*zse&$76eoFf

(note: it's read only, so you won't be able to edit/delete things)

#### Deployment Diagram
<p align="center"><img src="https://github.com/NikelausM/yelp-camp/blob/master/yelp-camp-deployment-diagram.png?raw=trueg"></p>


<h2 id="technologies">Technologies</h2>

### Database
- <strong> [MongoDB 4.0.18](https://www.mongodb.com/cloud/atlas/lp/try2?utm_source=bing&utm_campaign=bs_americas_canada_search_brand_atlas_desktop&utm_term=mongodb&utm_medium=cpc_paid_search&utm_ad=e&msclkid=48a2049cd3351ec1ff715b9250ce48fd) </strong>
  - For storing data in a NoSQL database.

### Back-end
- <strong> [Node.js: 14.4.0](https://nodejs.org/en/) </strong>
  - JavaScript runtime built on Chrome's V8 JavaScript engine.
- <strong> [npm 6.14.5](https://www.npmjs.com/) </strong>
  - Node Package Manager (like a Javascript dependency manager).
  - It allows you to easily install 3rd party Javascript Node.js libraries.

#### NPM packages
- <strong> [Express ^4.17.1](https://expressjs.com/) </strong>
- <strong> [Mongoose ^5.9.16](https://mongoosejs.com/) </strong>
- [bcrypt ^4.0.1](https://www.npmjs.com/package/bcrypt)
  - For password encryption.
- [bcrypt-nodejs 0.0.3]
- [body-parser ^1.19.0](https://www.npmjs.com/package/body-parser)
  - For parsing request bodies.
- [cloudinary ^1.21.0](https://www.npmjs.com/package/cloudinary)
  - For using the [Cloudinary API](https://cloudinary.com/) to store images on the cloud.
  - I created a [wrapper class for this module](https://github.com/NikelausM/yelp-camp/tree/master/bin/helpers/api/cloudinary-helper.js) to improve error handling.
- [connect-flash ^0.1.1](https://www.npmjs.com/package/connect-flash)
  - For flash messages.
- [dotenv ^8.2.0](https://www.npmjs.com/package/dotenv)
  - For environment variables.
- [express-session ^1.17.1](https://www.npmjs.com/package/express-session)
  - For storing session data.
- [method-override ^3.0.0](https://www.npmjs.com/package/method-override)
  - For overriding HTTP verbs.
- [multer ^1.4.2](https://www.npmjs.com/package/multer)
  - For handling multipart/form-data
- [node-geocoder ^3.27.0](https://www.npmjs.com/package/node-geocoder)
  - For using the [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro) to convert addresses to coordinates.
  - I created a [wrapper class for this module](https://github.com/NikelausM/yelp-camp/tree/master/bin/helpers/api/geocoder-helper.js) to improve error handling.
- [nodemailer ^6.4.8](https://www.npmjs.com/package/nodemailer)
  - For sending emails, such as for resetting a password.
- [passport ^0.4.1](https://www.npmjs.com/package/passport)
  - For authentication.
- [passport-local ^1.0.0](https://www.npmjs.com/package/passport-local)
  - For local username and password authentication strategy for passport.js.
- [passport-local-mongoose ^6.0.1](https://www.npmjs.com/package/passport-local-mongoose)
  - Mongoose plugin for simplifying username/password authentication.
- [async ^3.2.0](https://www.npmjs.com/package/async)
  - For asynchronous functions before being replaced with async/await.
  
### Front-end
- <strong> [EJS ^3.1.3](https://ejs.co/) </strong>
  - Javascript templating engine used for building html pages.
- <strong> [Bootstrap 4.5.0](https://getbootstrap.com/) </strong>
  - Open source CSS framework used for creating responsive mobile-first web pages.
- [Font Awesome](https://fontawesome.com/)
  - For icons.
#### Other NPM packages used for Front-end
- [uuid ^8.2.0](https://www.npmjs.com/package/uuid)
  - For creating Universally Unique ID's.
- [moment ^2.26.0](https://www.npmjs.com/package/moment)
  - For setting and displaying dates.
  
<h2 id="documentation">Documentation</h2>

Check out this project's [documentation website](https://nikelausm.github.io/yelp-camp/).

<h2 id="certificate">Certificate</h2>

<p align="center"><img src="https://github.com/NikelausM/yelp-camp/blob/master/web-developer-bootcamp-certificate.jpg?raw=true"></p>
