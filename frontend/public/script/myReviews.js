$("body").on("click", ".unfold", function () {
    reviewID = $(this).attr("tag")
    $(`#${reviewID}`).removeClass("folded");
    $(`#show${reviewID}`).addClass("d-none");
    $(`#show${reviewID}`).parent().removeClass("justify-content-between");
    $(`#show${reviewID}`).parent().addClass("justify-content-end");
    $(`#hide${reviewID}`).removeClass("d-none");
})

$("body").on("click", ".fold", function () {
    reviewID = $(this).attr("tag")
    $(`#${reviewID}`).addClass("folded");
    $(`#show${reviewID}`).removeClass("d-none");
    $(`#show${reviewID}`).parent().addClass("justify-content-between");
    $(`#show${reviewID}`).parent().removeClass("justify-content-end");
    $(`#hide${reviewID}`).addClass("d-none");
})

$("body").on("click", ".showImage", function () {
    $(`.${this.id}`).toggleClass("partialImage")
    $(this).html() === "<b>Hide Image</b>"? $(this).html("<b>Show Image</b>") : $(this).html("<b>Hide Image</b>")
})