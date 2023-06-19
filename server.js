/**********************************************************************************  
 * WEB322 – Assignment 03*  I declare that this assignment is my own work in accordance 
 * with Seneca  Academic Policy.  No part *  of this assignment has been copied 
 * manually or electronically from any other source *  (including 3rd party web sites) 
 * or distributed to other students.* * 
 *  Name: Kelvin Nguyen
 * Student ID: 104087226 
 * Date: June 19, 2023**  
 * Cyclic Web App URL: https://odd-cyan-lion-hat.cyclic.app/about 
 * GitHub Repository URL: https://github.com/KelvinJoNguyen/web322-app
 * *********************************************************************************/ 
var express = require("express");
var app = express();
const path = require('path');
const blogService = require('./blog-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

const upload = multer();

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

cloudinary.config({
  cloud_name: 'dvq9jklqp',
  api_key: '252612121878789',
  api_secret: 'tgxQm8AYSE_LpHjLGSnHpirG-c0',
  secure: true
});


// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", function(req,res){
    res.redirect('/about');
});

//Route for about
app.get("/about", (req, res) => {
    const about = path.join(__dirname, 'views', 'about.html');    
    res.sendFile(about);
  });

//Route for blog - returns formatted json string of published posts 
// If error occurs, error is console logged and error message is displayed 
  app.get("/blog", function(req,res){
    blogService.getPublishedPosts()
      .then((filteredPosts)=>{
        const formattedFilterPosts = JSON.stringify(filteredPosts, null, 2);
        res.setHeader("Content-Type", "application/json");
        res.send(formattedFilterPosts);
       
    })

      .catch(error => {
        console.error(error);
        res.status(500).send("Error-Page not found");
      });
});

//Route for posts - returns formatted json string of all posts 
app.get("/posts", function(req,res){
  
      if (req.query.category) {
        getPostsByCategory(req.query.category)
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          res.send(err);
        });
      }
    
      // Checking if a minimum date is provided
      else if (req.query.minDate) {
        getPostsByMinDate(req.query.minDate)
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          res.send(err);
        });
      }
      else{
        blogService.getAllPosts()
        .then((posts) => {
          const formattedPosts = JSON.stringify(posts, null, 2);
          res.setHeader("Content-Type", "application/json");
          res.send(formattedPosts);
          
      })
        .catch(error => {
          console.error(error);
          res.status(500).send("Error-Page not found");
        });
      }
    
});

//Route for categories - returns formatted json string of all categories 
// If error occurs, error is console logged and error message is displayed 
app.get("/categories", function(req,res){
    blogService.getCategories()
      .then((categories) => {
        const formattedCategories = JSON.stringify(categories, null, 2);
        res.setHeader("Content-Type", "application/json");
        res.send(formattedCategories);
    })

      .catch(error => {
        console.error(error);
        res.status(500).send("Error-Page not found");
  });
});

app.get("/posts/add", (req, res) => {
  const addPost = path.join(__dirname, 'views', 'addPost.html');    
  res.sendFile(addPost);
});

//Route to add posts - uploads image to hosting website and calls add post function to add new postData
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
let streamUpload = (req) => {
return new Promise((resolve, reject) => {
  let stream = cloudinary.uploader.upload_stream((error, result) => {
    if (result) {
      resolve(result);
    } else {
      reject(error);
    }
  });

  streamifier.createReadStream(req.file.buffer).pipe(stream);
});
};

async function upload(req) {
let result = await streamUpload(req);
console.log(result);
return result;
}

upload(req).then((uploaded) => {
  req.body.featureImage = uploaded.url;
  let postObject = {};

  // Add it Blog Post before redirecting to /posts
  postObject.body = req.body.body;
  postObject.title = req.body.title;
  postObject.postDate = Date.now();
  postObject.category = req.body.category;
  postObject.featureImage = req.body.featureImage;
  postObject.published = req.body.published;

  if (postObject.title) {
    addPost(postObject);
  }
  res.redirect("/posts");
  }).catch((err) => {
    res.send(err);
  });
});

//Get post by value
app.get("/post/value", (req, res) => {
  getPostById(req.params.value)
  .then((data) => {
    res.send(data);
  })
  // Error Handling
  .catch((err) => {
    res.send(err);
  });
})

// setup http server to listen on HTTP_PORT
blogService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})
