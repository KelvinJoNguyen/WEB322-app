const fs = require("fs")
let posts = []
let categories = []

//Reads posts and categories json file and adds to array 
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/posts.json", 'utf8', (err, data) => {
            if (err) {
                reject("Unable to read file")
              }

            posts = JSON.parse(data)
        

            fs.readFile("./data/categories.json", 'utf8', (err, data) => {
                if (err) {
                    reject("Unable to read file")
                }
                categories = JSON.parse(data)
                resolve("success")
            })
        })
    })
}

// Returns array of all posts 
module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        if(posts.length == 0){
            reject("No data")
        }

        resolve(posts)     
    })
}

// Returns array of all posts that have a published status 
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        if(posts.length == 0){
            reject("No data")
        }
        filteredPosts = posts.filter(post => post.published === true)
        resolve(filteredPosts)
    })
}

//Returns array of all categories 
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if(categories.length == 0){
            reject("No data")
        }

        resolve(categories)     
    })
}
//Sets next postId and pushes postData to posts array 
module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        if (postData.published === undefined) {
            postData.published = false;
        } else {
            postData.published = true;
        }
    
        postData.id = posts.length + 1;
    
        posts.push(postData);
        resolve(postData);
    })   
}

//Gives array of posts matching category parameter
module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const filteredPosts = posts.filter(post => post.category == category);
        //If length of array is 0 show error 
        if (filteredPosts.length >= 0) {
            resolve(filteredPosts);
        } else {
            reject("no results returned");
        }
    })
}

//Gives array of posts matching date 
module.exports.getPostsByMinDate = (minDate) => {
    return new Promise((resolve, reject) => {
        const filteredPosts = posts.filter(post => new Date(post.postDate) >= new Date(minDate));
         //If length of array is 0 show error 
        if (filteredPosts.length >= 0) {
            resolve(filteredPosts);
        } else {
            reject("no results returned");
        }
    })
}
//Gives array of posts matching ID 
module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        const filteredPosts = posts.filter(post => post.id == id);
        const uniquePost = filteredPosts[0];

        if (uniquePost) {
            resolve(uniquePost);
        }
        else {
            reject("no result returned");
        }
    })
}

