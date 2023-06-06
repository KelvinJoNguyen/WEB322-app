const fs = require("fs")
let posts = []
let categories = []

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

module.exports.getAllPosts = () => {

    return new Promise((resolve, reject) => {
        if(posts.length == 0){
            reject("No data")
        }

        resolve(posts)     
    })
}

module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        if(posts.length == 0){
            reject("No data")
        }
        filteredPosts = posts.filter(post => post.published === true)
        resolve(filteredPosts)
    })
}

module.exports.getCategories = () => {

    return new Promise((resolve, reject) => {
        if(categories.length == 0){
            reject("No data")
        }

        resolve(categories)     
    })
}



