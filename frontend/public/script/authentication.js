$("body").on("click", "#tab-login", function () {
    $("#tab-login").addClass("active");
    $("#tab-register").removeClass("active");
    $("#tab-register").addClass("text-primary");
    $("#tab-register").removeClass("text-white");
    $("#tab-login").removeClass("text-primary");
    $("#tab-login").addClass("text-white");
    $("#loginBox").addClass("active");
    $("#registerBox").removeClass("active");
})

$("body").on("click", "#tab-register", function () {
    $("#tab-register").addClass("active");
    $("#tab-login").removeClass("active");
    $("#tab-login").addClass("text-primary");
    $("#tab-login").removeClass("text-white");
    $("#tab-register").removeClass("text-primary");
    $("#tab-register").addClass("text-white");
    $("#loginBox").removeClass("active");
    $("#registerBox").addClass("active");
})