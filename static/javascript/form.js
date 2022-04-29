document.addEventListener('DOMContentLoaded', function() {
    // Avatar Elements
    const avatars = document.querySelectorAll('.avatar');
    for (const avatar of avatars){
        avatar.addEventListener('change', (event) => {
            // On change in avatar properties
            var abbreviation = document.querySelector('#abbreviation').value;
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
                document.querySelector("#letter-avatar").setAttribute("src", link)
                document.querySelector("#avatar-link").value = link;
            }
        });
    }
})

function containsSpecialChars(str) {
    const specialChars = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}

function validateForm(){
    // Username Validation
    if ((document.querySelector("#username").value).length < 3){
        alert("Username must be of atleast 3 characters");
        return False
    }
    else if ((document.querySelector("#username").value).length > 10){
        alert("Username cannot be longer than 10 characters");
        return False
    }
    else if (containsSpecialChars(document.querySelector("#username").value) == true){
        alert("Username cannot contain special characters or space");
        return False
    }

    // Abbreviation Validation
    else if ((document.querySelector("#abbreviation").value).length == 0){
        alert("Please enter an Abbreviation");
        return False
    }
    else if ((document.querySelector("#abbreviation").value).length > 3){
        alert("Abbreviation cannot be longer than 3 characters");
        return False
    }

    // Age Validation
    else if (document.querySelector("#age").value < 16){
        alert("You must be atleast 16 years of age to use this platform");
        return False
    }
    else if (document.querySelector("#age").value > 100){
        alert("Invalid Age");
        return False
    }

    // Password Validation
    else if ((document.querySelector("#password").value).length < 6){
        alert("Password must be of atleast 3 characters");
        return False
    }
    else if ((document.querySelector("#password").value).length > 20){
        alert("Password cannot be longer than 10 characters");
        return False
    }
    else if (containsSpecialChars(document.querySelector("#password").value) == true) {
        alert("Password cannot contain special characters or space");
        return False
    }

    // Confirm Password Validation
    else if (document.querySelector("#password").value != document.querySelector("#confirmpassword").value) {
        alert("Passwords do not match");
        return False
    }

    // Validation Successful 
    else{
        document.querySelector("#registration-form").submit();
        return True
    }
}
