function toggleTab(id) {
    console.log(id)
    $('.nav-link').removeClass('active')
    $('.tab-pane').removeClass('active')
    $(`.${id}`).addClass('active')
    $('.tab-pane').addClass('show')
}


const setup = () => {
    $('body').on('click', '.tab', function () {
        toggleTab(this.id);
    })
    $('body').on('click', '.edit-button', async function () {
        $('#edit-modal').removeClass('d-none');
        $('#backdrop').removeClass('d-none');
        $('body').addClass('stop-scrolling')
        // $('#shinyForm').prop('checked', false);
    });
    $('body').on('click', '.close-modal', async function () {
        $('#edit-modal').addClass('d-none');
        $('#backdrop').addClass('d-none');
        $('body').removeClass('stop-scrolling')
        // $('#shinyForm').prop('checked', false);
    });
}

$(document).ready(setup)