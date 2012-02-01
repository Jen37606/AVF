function (doc){
    if (doc._id.substring(0,6) === "movie:"){
        emit(doc._id, {
        	"title": doc.title,
        	"actors": doc.actors,
        	"description": doc.description,
        });
    }
}