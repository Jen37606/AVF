// GET MOVIES FUNCTION
$('#browsemovies').live("pageshow", function(){
	$.couch.db("asdproject").view("movieapp/movies", {
		success: function(data) {
			$.each(data.rows, function(index, value){
				var item = (value.value || value.doc);
				var title = item.title;
				$('<li class="movietitle">'+
					'<a href="movie.html?movie=' + title + '"><h2>'+ title +'</h2></a>'+
				  '</li>'
				).appendTo('#browsemovielist');
				
			});
			console.log(data);
		}
	});
	return false;
});

// GET MOVIE KEY
var urlVars = function(){
	var urlData = $($.mobile.activePage).data("url");
	var urlParts = urlData.split('?');
	var urlPairs = urlParts[1].split('&');
	var urlValues = {};
	for(var pair in urlPairs){
		var keyValue = urlPairs[pair].split('=');
		var key = decodeURIComponent(keyValue[0]);
		var value = decodeURIComponent(keyValue[1]);
		urlValues[key] = value;
	}
	return urlValues;
};

// DISPLAY THAT MOVIE
$('#thismovie').live("pageshow", function(){
	var movie = urlVars()["movie"];
	var key = "movie:" + movie;
	$.couch.db("asdproject").openDoc(key, {
    	success: function(data) {
        	title = data.title;
        	actors = data.actors;
        	description = data.description;
        	$('<h2>'+ title +'</h2>' +
        	  '<h3>'+ actors +'</h3>' +
        	  '<p>'+ description +'</p>' +
        	  '<p><a href="#" id="edit-movie-link">Edit Movie</a>' + 
        	  ' | <a href="#" id="delete-movie-link" onclick="deleteItem()">Delete Movie</a></p>'
        	).appendTo('#movieInfo');
        },
    	error: function(status) {
        	console.log(status);
    	}
	});
});

//GO TO EDIT THAT MOVIE
$('#edit-movie-link').bind('click', function(){
	var movie = urlVars()["movie"];
	var key = "movie:" + movie;
	console.log("key" + key);
	window.location = 'additems.html';
	location.reload();
	$.couch.db("asdproject").openDoc(key, {
    	success: function(data) {
        	title = data.title;
        	actors = data.actors;
        	description = data.description;
        	$('#title').val(title);
			$('#actor').val(actors);
			$('#description').val(description);
        
			// show edit item button, hide submit button
			var editButton = $('#edit-item-button').css('display', 'block');
			var subresButtons = $('#submit-reset-buttons').css('display', 'none');
			var itemList = $('#list').css('display', 'none');
			
			//SAVE EDIT CHANGES
			$('#edit-item').bind('click', function(){
				console.log("edit-item button was pressed");
				data.title = $('#title').val();
				data.actors = $('#actor').val();
				data.description = $('#description').val();
				
				$.couch.db("asdproject").saveDoc(key, {
					success: function(data) {
						console.log(data);
					},
					error: function(status) {
        				console.log(status);
    				}
				});
			});
		}
	});
	
});

//DELETE ITEM FUNCTION
function deleteItem(id){
	var movie = urlVars()["movie"];
	var key = "movie:" + movie;
	
	$.couch.db("asdproject").openDoc(key, {
    	success: function(data) {
    	console.log(key);
			var ask = confirm("Are you sure?");
			if(ask){
				$.couch.db("asdproject").removeDoc(key, {
					success: function(data) {
						console.log(data);
					},
					error: function(status) {
						console.log(status);
					}
				});
			}else{
				alert("Item not removed.");
			}
		}
	});
}
	
//SAVE ITEMS FUNCTION
$('#submit').bind('click', function(){
			var title = $('#title').val();
			var actor = $('#actor').val();
			var description = $('#description').val();
			var doc = {
				"_id": "movie:" + title,
				"title": title,
				"actors": actor,
				"description": description
			};
			console.log(doc);
			$.couch.db("asdproject").saveDoc(doc, {
				success: function(data) {
					console.log(data);
					alert("Your movie was added!");
				},
				error: function(status) {
					console.log(status);
					alert("The movie was not added.");
				}
			});
	return false;
});

//SIMPLE FILED CLEAR FUNCTIONS
function clickclear(thisfield, defaulttext) {
	if (thisfield.value == defaulttext) {
		thisfield.value = "";
	}
}

function clickrecall(thisfield, defaulttext) {
	if (thisfield.value == "") {
		thisfield.value = defaulttext;
	}
}

// GET DATE FUNCTION
$(document).ready( function() {
    var now = new Date();
    var today = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    $('#release').val(today);
});


// GET DATA FUNCTIONS!------------

// JSON Data
$('#jsonbutton').bind('click', function(){
	$('#mydata').empty();
	$.ajax({
		url: 'xhr/data.json',
		type: 'GET',
		dataType: 'json',
		success: function(response){
        	for (var i=0, j=response.comedies.length; i<j; i++){
				var jdata = response.comedies[i];
				$(''+
					'<li class="movietitle">'+
						'<h3>'+ jdata.title +'</h3>'+
						'<h4>'+ jdata.actors +'</h4>'+
						'<p>'+ jdata.description +'</p>'+
					'</li><hr />'
				).appendTo('#mydata');
				console.log(response);
			}
		}
	});
	return false;
});

// XML Data
$('#xmlbutton').bind('click', function(){
	$('#mydata').empty();
	$.ajax({
		url: 'xhr/data.xml',
		type: 'GET',
		dataType: 'xml',
		success: function(xml){
			$(xml).find("movie").each(function(){
   				var title = $(this).find('title').text();
   				var actors = $(this).find('actors').text();
   				var description = $(this).find('description').text();
    			$(''+
					'<li class="movietitle">'+
						'<h3>'+ title +'</h3>'+
						'<h4>'+ actors +'</h4>'+
						'<p>'+ description +'</p>'+
					'</li><hr />'
				).appendTo('#mydata');
				console.log(xml);
			});
		}
	});
	return false;
});


//CSV Data
$('#csvbutton').bind('click', function(){
	$('#mydata').empty();
	 $.ajax({
        type: "GET",
        url: "xhr/data.csv",
        dataType: "text",
        success: function(data) {
        	var allTextLines = data.split(/\r\n|\n/);
    		var headers = allTextLines[0].split(',');
    		var lines = []; // main array that hold each movie array

			for (var i=1; i<allTextLines.length; i++) {
				var data = allTextLines[i].split(',');
				if (data.length == headers.length) {
					var movies = []; // blank array for each movie
					
					for (var j=0; j<headers.length; j++) {
						movies.push(data[j]); //puts each movie into the array
					}
					lines.push(movies); // puts the movie array into the main array
				}
				
			}
			
			for (var m=0; m<lines.length; m++){
				var amovie = lines[m];
			$(''+
					'<li class="movietitle">'+
						'<h3>'+ amovie[0] +'</h3>'+
						'<h4>'+ amovie[1] +'</h4>'+
						'<p>'+ amovie[2] +'</p>'+
					'</li><hr />'
				).appendTo('#mydata');
			console.log(lines);	
			}
        }
	});
	return false;
});

// Couch Data
$('#couchbutton').bind('click', function(){
	$('#mydata').empty();
	$.ajax({
		url: '_view/movies',
		dataType: 'json',
		success: function(data){
			$.each(data.rows, function(index, movie){
   				var title = movie.value.title;
   				var actors = movie.value.actors;
   				var description = movie.value.description;
    			$(''+
					'<li class="movietitle">'+
						'<h3>'+ title +'</h3>'+
						'<h4>'+ actors +'</h4>'+
						'<p>'+ description +'</p>'+
					'</li><hr />'
				).appendTo('#mydata');
				console.log(data);
			});
		}
	});
	return false;
});



//////////////////////////////////////////////////////////////////////
// ================================================================ //
// OLD FUNCTIONS BELOW



// GET ITEMS FUNCTION ----------------------------
function getItems(){
	var getListdiv = $('#list')[0];
	
	for(var i=0, len = localStorage.length; i < len; i++){
		var key = localStorage.key(i);
		var value = localStorage.getItem(key);
		value = value.split(',');
		var genre = value[0];
		var title = value[1];
		var actor = value[2];
		var director = value[3];
		var rating = value[4];
		var favorites = value[5];
		var family = value[6];
		var release = value[7];
		var description = value[8];
		var newDiv = document.createElement("div"); 
		
		/*for(var ii=0, allLength = value.length; ii < allLength; ii++){
			var newPara = document.createElement("p");
			var itemTxt = document.createTextNode(value[ii]);
			newPara.appendChild(itemTxt);
			newDiv.appendChild(newPara);
			getListdiv.appendChild(newDiv);
		}*/
			
		var newh3 = document.createElement("h3");
		var titleTxt = document.createTextNode(value[1]);
		newh3.appendChild(titleTxt);
		newDiv.appendChild(newh3);
		getListdiv.appendChild(newDiv);
		var setdiv = newDiv.setAttribute("data-role", "fieldcontain");
	
		var newP = document.createElement("p");
		var genreTxt = document.createTextNode("Genre: " + value[0]);
		newP.appendChild(genreTxt);
		newDiv.appendChild(newP);
		getListdiv.appendChild(newDiv);
		
		var newP = document.createElement("p");
		var actorTxt = document.createTextNode("Actors/Actresses: " + value[2]);
		newP.appendChild(actorTxt);
		newDiv.appendChild(newP);
		getListdiv.appendChild(newDiv);
		
		var newP = document.createElement("p");
		var directorTxt = document.createTextNode("Director: " + value[3]);
		newP.appendChild(directorTxt);
		newDiv.appendChild(newP);
		getListdiv.appendChild(newDiv);
		
		var newP = document.createElement("p");
		var ratingTxt = document.createTextNode("Rating: " + value[4]);
		newP.appendChild(ratingTxt);
		newDiv.appendChild(newP);
		getListdiv.appendChild(newDiv);
		
		var newP = document.createElement("p");
		var favTxt = document.createTextNode("Favorites: " + value[5]);
		newP.appendChild(favTxt);
		newDiv.appendChild(newP);
		getListdiv.appendChild(newDiv);
		
		var newP = document.createElement("p");
		var famTxt = document.createTextNode(value[6]);
		newP.appendChild(famTxt);
		newDiv.appendChild(newP);
		getListdiv.appendChild(newDiv);
		
		var newP = document.createElement("p");
		var releaseTxt = document.createTextNode("Release Date: " + value[7]);
		newP.appendChild(releaseTxt);
		newDiv.appendChild(newP);
		getListdiv.appendChild(newDiv);
		
		var newP = document.createElement("p");
		var descTxt = document.createTextNode("Decription: " + value[8]);
		newP.appendChild(descTxt);
		newDiv.appendChild(newP);
		getListdiv.appendChild(newDiv);
		
		var genreImage = "other.jpg"; 
			if(genre == "Comedy"){ genreImage = "comedy.jpg"; }
			if(genre == "Drama"){ genreImage = "drama.jpg"; }
			if(genre == "Action"){ genreImage = "action.jpg"; }
			if(genre == "Horror"){ genreImage = "horror.jpg"; }
			if(genre == "Documentary"){ genreImage = "documentary.jpg"; }
		
		//add image
		var newP = document.createElement("p");
		var newImg = document.createElement("IMG");
		newImg.setAttribute("src", "images/" + genreImage);
		newP.appendChild(newImg);
		newDiv.appendChild(newP);
		
		//delete single item link
		var newP = document.createElement("p");
		var deleteLink = document.createElement("a");
		var setHref = deleteLink.setAttribute("href", "#");
		var setOnclick = deleteLink.setAttribute("onclick", "deleteItem(" + key + ");");
		var deleteText = document.createTextNode("Delete item");
		deleteLink.appendChild(deleteText);
		newP.appendChild(deleteLink);
		newDiv.appendChild(newP);
		getListdiv.appendChild(newDiv);
		
		//edit single item link
		var newP = document.createElement("p");
		var editLink = document.createElement("a");
		var setHref = editLink.setAttribute("href", "#");
		var setOnclick = editLink.setAttribute("onclick", "editItem(" + key + ");");
		var editText = document.createTextNode("Edit item");
		editLink.appendChild(editText);
		newP.appendChild(editLink);
		newDiv.appendChild(newP);
		//getListdiv.appendChild(newP);
		}
		
		if(localStorage.getItem('apptitle')){
			var clearLink = $('#clear').css('display', 'block'); 
		}else{
			var title = "";
			var actor = "";
			var director = "";
			var title = $('#title').val(title);
			var actor = $('#actor').val(actor);
			var director = $('#director').val(director);
		}
}

// SAVE ITEMS FUNCTION ----------------------------
function saveItems(id){
	var d = new Date();
    var key= (d.getTime());
    var genre = $('#genre').val();
    var title = $('#title').val();
    var actor = $('#actor').val();
    var director = $('#director').val();
    var rating = $('#rating').val();
    var favorites = $('#favorites:checked').val();
	if(favorites == "on"){ 
		var favorites = "Yes" // if favorite is checked say yes
	}else{
		var favorites = "No" // if not, say no
		}
	if($('#yes').attr('checked')){
		var family = "This is a family movie"
	}else{
		var family = "This is not a family movie"
	}
	var release = $('#release').val();
	var description = $('#description').val();
	var allItems = [
		genre,
		title,
		actor,
		director,
		rating,
		favorites,
		family,
		release,
		description
	];
	localStorage.setItem(key, allItems);
	location.reload();
}

// EDIT ITEMS FUNCTION ----------------------------
function editItem(id){
	//alert(id);
	var itemId = id;
	var value = localStorage.getItem(itemId);
	value = value.split(',');
	var genre = value[0];
	var title = value[1];
	var actor = value[2];
	var director = value[3];
	var rating = value[4];
	var favorites = value[5];
	var family = value[6];
	var release = value[7];
	var description = value[8];
	
	$('#genre').val(genre);
	$('#title').val(title);
	$('#actor').val(actor);
	$('#director').val(director);
	$('#rating').val(rating);
	if(favorites == "Yes"){
		$('#favorites').attr('checked', 'checked');
		//document.getElementById('favorites').setAttribute("checked", "checked");
	}
	if(family == "This is a family movie"){
		$('#yes').attr('checked', 'checked');
		//document.getElementById('yes').setAttribute("checked", "checked");
	}else{
		$('#no').attr('checked', 'checked');
		//document.getElementById('no').setAttribute("checked", "checked");
	}
	$('#release').val(release);
	$('#description').val(description);
	
	// show edit item button, hide submit button
	var editButton = $('#edit-item-button').css('display', 'block');
	var subresButtons = $('#submit-reset-buttons').css('display', 'none');
	var itemList = $('#list').css('display', 'none');
	
	// when clicking editItem button
	function clickEdit(){
		var genre = $('#genre').val();
		var title = $('#title').val();
		var actor = $('#actor').val();
		var director = $('#director').val();
		var rating = $('#rating').val();
		var favorites = $('#favorites').val();
		if(favorites == "on"){ 
			var favorites = "Yes" // if favorite is checked say yes
		}else{
			var favorites = "No" // if not, say no
			}
		if($('#yes').attr('checked')){
			var family = "This is a family movie"
		}else{
			var family = "This is not a family movie"
		}
		var release = $('#release').val();
		var description = $('#description').val();	
		var allItems = [
			genre,
			title,
			actor,
			director,
			rating,
			favorites,
			family,
			release,
			description
		];
		if(title != "" && title != "Enter Movie Title" && release != ""){
			localStorage.setItem(itemId, allItems);
			//alert("Item Updated!");
			location.reload();
		}else{
			alert("The Title and Release Date fields are required.");
		}
	};
	
	$('#edit-item').bind('click', clickEdit);
}

// DELETE ITEM FUNCTION ----------------------------
function deleteItem(id){
	var ask = confirm("Are you sure?");
	if(ask){
		localStorage.removeItem(id);
		window.location.reload();
	}else{
		alert("Item not removed.");
	}
}

// CLEAR ITEMS FUNCTION ----------------------------
function clearItems(){
	localStorage.clear();
	return false;
}

// VALIDATE FORM FUNCTION ----------------------------
function validateForm(){
	var getGenre = $('#genre').val();
	var getTitle = $('#title').val();
	var getActor = $('#actor').val();
	var getDirector = $('#director').val();
	var getDate = $('#release').val();
	
	// Validate the whole form
	//$(document).ready( function() {
		var movieform = $('#addmovieform');
		movieform.validate();
	//});
	if(getTitle == ""){ // must enter a title
		$('#title').css('border', '1px solid red');
		return false;
	}
	
	if(getDate == ""){
		$('#release').css('border', '1px solid red');
		return false;
	}else{
		$('#title').css('border', '1px solid #ccc');
		$('#genre').css('border', '1px solid #ccc');
		saveItems(); // if all is good than run the saveItems function
	}
}

// END OF OLD FUNCTIONS