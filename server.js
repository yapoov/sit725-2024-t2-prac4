
require('dotenv').config()
const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser')
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSKEY}@cluster0.qlv8oyw.mongodb.net/sample_mflix`
app.use(express.json())
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(bodyParser.urlencoded({extended:true}))

let client;
const createConnection = async () => {
    client = await MongoClient.connect(uri)
}


app.get("/api/movies", async (req, res) => {
    let movieCollection = client.db().collection('movies')
    const result = await movieCollection.aggregate([
        { $sort: { num_mflix_comments: -1 } },
        { $limit: 24 }
    ]).toArray();

    res.json(result)
    
})
app.get("/api/movies/:id", async (req, res) => {
    try{
        const movieCollection = client.db().collection('movies');
        const movie = await movieCollection.findOne({"_id": new ObjectId(req.params.id)})
        const commentCollection =  client.db().collection('comments')

        let comments = await commentCollection.find({"movie_id":new ObjectId(req.params.id)},{sort:{date:-1}}).limit(20).toArray()
        const html = `<!DOCTYPE html>
            <html>
            <head>
            <title>${movie.title}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
            
            <style>
                .movie-poster {
                height: 400px; 
                object-fit: cover; 
                }
    
                .comment-section {
                margin-top: 20px;
                }
            </style>
            </head>
            <body>
            <nav>
                <div class="nav-wrapper">
                    <a href="/" class="brand-logo"> <span style="padding-left: 1rem;">FLICKR</span></a>
                </div>
            </nav>
            <div class="container" style="padding-top:2rem">
                <div class="row">
                <div class="col s12 m4">
                    <img class="movie-poster responsive-img" src="${movie.poster}" alt="${movie.title}">
                </div>
    
                <div class="col s12 m8">
                    <h1>${movie.title}</h1>
                    <p>Release Year: ${movie.year}</p>
                    <p>Genre: ${movie.genres.join(', ')}</p>
                    <p>Rating: ${movie.imdb.rating}</p>
                    <p>Synopsis: ${movie.fullplot}</p>
                    
                    <div class="rating-stars"></div> 
                </div>
                </div>
    
                <div class="comment-section">
                <h2>Comments</h2>
    
                <div class="row">
                    <form class="col s12" id="comment-form" action="/api/movies/${req.params.id}/addcomment" method="post">
                    <label for="comment-text">Add Your Comment</label>
                    <div class="row">
                    <div class="input-field col s6">
                        <input id="username" name="username" type="text" class="validate" required>
                        <label for="username">Username</label>
                    </div>
                    </div>
                    <textarea id="comment-text" name="text" class="materialize-textarea"></textarea>
                    
                    <button class="btn waves-effect waves-light" type="submit">
                        Submit Comment
                    </button>
                    </form>
                </div>
                <div id="comment-list">
                    ${comments.map(comment=>
                        `
                        <div class="card comment-card">
                            <div class="card-content">
                                <span class="card-title grey-text text-darken-4">${comment.name}</span>
                                <p>${comment.text}</p>
                            </div>
                            <div class="card-action">
                                <span class="comment-date">${new Date(comment.date).toUTCString()}</span> 
                            </div>
                        </div>
                        `
                    ).join(' ')}
                </div>
    
                </div>
            </div>
            <script>
                    
            </script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
            </body>
            </html>`
            res.send(html)

    }catch(e){
        console.log(e)
        res.json(e)
    }

})

app.post('/api/movies/:id/addcomment',async (req,res)=>{
    const {text,username} = req.body;
    const newComment={
        movie_id: new ObjectId(req.params.id),
        name:username??"Anonymous",
        text,
        date: new Date()
    }
    try{
        const commentCollection =  client.db().collection('comments')
        const result = await commentCollection.insertOne(newComment);
        console.log(result)
        res.redirect(`/api/movies/${req.params.id}`)
    }catch(e){
        res.status(500).json(e)
    }
})

app.post('/api/movies/', (req, res) => {
    let movie = req.body;
    projectCollection.insert(movie, (err, result) => {
        if (err) {
            res.json({ statuscode: 400, message: err })
        } else {
            res.json({ statuscode: 400, message: "Movie succesfully added", data: result })
        }
    })
})

const port = process.env.port || 3124;
app.listen(port, async () => {
    console.log("App running at http://localhost:" + port)
    await createConnection()
})