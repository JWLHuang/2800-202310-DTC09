function validateEmail(email) {
    // Regular expression pattern for email validation
    var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Test the email against the pattern
    return pattern.test(email);
}

// Display the login tab
function displayLoginTab() {
    $("#tab-login").addClass("active");
    $("#tab-register").removeClass("active");
    $("#tab-register").addClass("text-primary");
    $("#tab-register").removeClass("text-white");
    $("#tab-login").removeClass("text-primary");
    $("#tab-login").addClass("text-white");
    $("#loginBox").addClass("active");
    $("#registerBox").removeClass("active");
    history.pushState({}, "", "/login");
}

// Display the register tab
function displayRegisterTab() {
    $("#tab-register").addClass("active");
    $("#tab-login").removeClass("active");
    $("#tab-login").addClass("text-primary");
    $("#tab-login").removeClass("text-white");
    $("#tab-register").removeClass("text-primary");
    $("#tab-register").addClass("text-white");
    $("#loginBox").removeClass("active");
    $("#registerBox").addClass("active");
    history.pushState({}, "", "/signup");
}

// Setup the event handlers
const setup = () => {
    // Display the login tab by default
    $("body").on("click", "#tab-login", displayLoginTab)

    // Display the register tab
    $("body").on("click", "#tab-register", displayRegisterTab)

    // Handle the email and password LABELS
    $("body").on("focus", "#email", function () {
        $("#emailLabel").removeClass("diplayLabel");
        $('#email').removeAttr('placeholder');
    })

    $("body").on("blur", "#email", function () {
        $("#emailLabel").addClass("diplayLabel");
        $('#email').attr('placeholder', 'Email');
    })

    $("body").on("focus", "#password", function () {
        $("#passwordLabel").removeClass("diplayLabel");
        $('#password').removeAttr('placeholder');
    })

    $("body").on("blur", "#password", function () {
        $("#passwordLabel").addClass("diplayLabel");
        $('#password').attr('placeholder', 'Password');
    })

    // Handle the registration of email and password 
    $("body").on("focus", "#registerName", function () {
        $("#registerUsernameLabel").removeClass("diplayLabel");
        $('#registerName').removeAttr('placeholder');
    })

    $("body").on("blur", "#registerName", function () {
        $("#registerUsernameLabel").addClass("diplayLabel");
        $('#registerName').attr('placeholder', 'Username');
    })

    $("body").on("focus", "#registerEmail", function () {
        $("#registerEmailLabel").removeClass("diplayLabel");
        $('#registerEmail').removeAttr('placeholder');
    })

    $("body").on("blur", "#registerEmail", function () {
        $("#registerEmailLabel").addClass("diplayLabel");
        $('#registerEmail').attr('placeholder', 'Email');
    })

    $("body").on("focus", "#registerPassword", function () {
        $("#registerpasswordLabel").removeClass("diplayLabel");
        $('#registerPassword').removeAttr('placeholder');
    })

    $("body").on("blur", "#registerPassword", function () {
        $("#registerpasswordLabel").addClass("diplayLabel");
        $('#registerPassword').attr('placeholder', 'Password');
    })

    // Handle the submission animation
    document.querySelectorAll('#signInButton').forEach(button => {
        button.addEventListener('click', e => {
            if (validateEmail(document.getElementById("email").value)) {
                button.classList.add('processing');
            }
        });
    });

    // Handle the submission animation
    document.querySelectorAll('#signUpButton').forEach(button => {
        button.addEventListener('click', e => {
            if (validateEmail(document.getElementById("registerEmail").value)) {
                button.classList.add('processing');
            }
        });
    });

}

// Run the setup function when the document is ready
$(document).ready(setup)