var selected_contact;
var selected_contact_avatar;


function activeChat(contact){
	selected_contact = contact.dataset.name;
	selected_contact_avatar = contact.dataset.avatar;

	// profile_link = `/profile/${selected_contact}`
	
	if (contact.dataset.name != "No Contacts Available"){
		document.querySelector('.empty-chat-screen').classList.add("d-none");
		document.querySelector('.chat-content-wrapper').classList.remove("d-none");
	}

	// document.querySelector(".contact-profile").setAttribute("onclick", "location.href=profile_link")
	document.querySelector("#selected-contact-avatar").src= selected_contact_avatar;
	document.querySelector("#selected-contact-username").innerHTML = selected_contact;
	// document.querySelector("#selected-contact-name").innerHTML = selected_contact;
	// document.querySelector("#contact-profile-avatar").src = selected_contact_avatar;
	document.querySelector(".chat-box").innerHTML = "";

	fetchMessages();
}

// Filter Users
function userSearch() {
	// Get Search Value
	var filter = document.getElementById("chatSearch").value.toLowerCase().trim();
  
	// Get all the user list elements
	var c = document.querySelectorAll(".users-list li");

	for (var i = 0; i < c.length; i++) {
		var username = c[i].dataset.name

		if (username.toLowerCase().indexOf(filter) > -1) {
			c[i].style.display = "";
	  	} else {
			c[i].style.display = "none";
	  	}
	}
}


// Filter New Available Contacts
function newContactSearch() {
	// Get Search Value
	var filter = document.getElementById("newContactSearch").value.toLowerCase().trim();
  
	// Get all the available contact list elements
	var a = document.querySelectorAll(".contacts-list li");

	for (var i = 0; i < a.length; i++) {
		var username = a[i].dataset.name
		if (username.toLowerCase().indexOf(filter) > -1) {
			a[i].style.display = "";
	  	} else {
			a[i].style.display = "none";
	  	}
	}
}


// Add Contacts 
function addContacts(){
	// Get checked contacts
	var newContacts = []
	var contacts = document.querySelectorAll(".new-contact")
	for (var i=0; i < contacts.length; i++){
		if (contacts[i].checked == true){
			newContacts.push(contacts[i].value);
		}
	}

	// POST details of checked contacts to add them as contacts
	fetch('/addcontact/', {
		method: 'POST',
		body: JSON.stringify({
			newcontacts: newContacts
		})
	})
	.then(response => response.json())
	.then(result => {
		// Print result
		console.log(result);

		if (result.message == "No Contacts Added."){
			alert("No Contacts Selected.");
		}
		else{
			alert(result.message);
			window.location.replace("/");
		}
	})
	.catch(error => {
		console.log(error);
		alert(`Error: ${error}`);
	});
}


document.addEventListener('DOMContentLoaded', function() {
    // Avatar Elements
    const avatars = document.querySelectorAll('.avatar');
    for (const avatar of avatars){
        avatar.addEventListener('change', (event) => {
            // On change in avatar properties
            var abbreviation = document.querySelector('#group-abbreviation').value;
            if (abbreviation.length == 0){
                document.querySelector("#letter-avatar").setAttribute("src", "/static/images/chatlogo.png")
            }
            else{
                abbreviation = abbreviation.toUpperCase();
                var len = abbreviation.length;

                var backgroundcolor = document.querySelector('#backgroundcolor').value;
                backgroundcolor = backgroundcolor.replace("#","");

                var foregroundcolor = document.querySelector('#foregroundcolor').value;
                foregroundcolor = foregroundcolor.replace("#","");

                var link = `https://ui-avatars.com/api/?name=${abbreviation}&background=${backgroundcolor}&color=${foregroundcolor}&length=${len}&rounded=true`;
                document.querySelector("#group-avatar").setAttribute("src", link)
                document.querySelector("#group-avatar-link").value = link;
            }
        });
    }
})