

document.addEventListener("DOMContentLoaded",async (e)=>{
    fetch('/api/movies').then(res=>
        res.json()
    ).then(data=>{
        const movieContainer = document.getElementById("movie-container");
        let movies = data;
        console.log(data)
        let currentRow = []
        movies.forEach(movie => {
            const movieElement = document.createElement("a");
            movieElement.classList.add("col","s2")
            movieElement.href = `/api/movies/${movie._id}`
            
            const posterImg = document.createElement("img");
            posterImg.src = movie.poster; 
            posterImg.alt = `${movie.title} Poster`;
            posterImg.classList.add("responsive-img")
            movieElement.appendChild(posterImg);
        
            const titleElement = document.createElement("span");
            titleElement.textContent = movie.title;
            movieElement.appendChild(titleElement);
            
            
            currentRow.push(movieElement)
            if(currentRow.length==6){
                const rowElement = document.createElement("div");
                rowElement.classList.add("row"); 
                currentRow.forEach(elem=>{
                    rowElement.appendChild(elem)
                })
                movieContainer.appendChild(rowElement)
                currentRow=[]
            }
        });
    }).catch(error=>{      
    })
})
