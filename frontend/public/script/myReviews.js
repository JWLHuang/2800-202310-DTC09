$("body").on("click", ".unfold", function () {
    reviewID = $(this).attr("tag")
    $(`#${reviewID}`).removeClass("folded");
    $(`#show${reviewID}`).addClass("d-none");
    $(`#hide${reviewID}`).removeClass("d-none");
})

$("body").on("click", ".fold", function () {
    reviewID = $(this).attr("tag")
    $(`#${reviewID}`).addClass("folded");
    $(`#show${reviewID}`).removeClass("d-none");
    $(`#hide${reviewID}`).addClass("d-none");
})

$("body").on("click", ".showImage", function () {
    $(`.${this.id}`).toggleClass("partialImage")
    $(this).html() === "<b>Hide Image</b>"? $(this).html("<b>Show Image</b>") : $(this).html("<b>Hide Image</b>")
})