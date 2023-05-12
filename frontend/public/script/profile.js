function toggleTab(id) {
    $('.nav-link').removeClass('active')
    $('.tab-pane').removeClass('active')
    $(`.${id}`).addClass('active')
    $('.tab-pane').addClass('show')
}


const setup = () => {
    const path = window.location.pathname;
    const profileError = path.split('/profile/')[1];
    console.log(profileError)
    if (profileError === "errorDietaryPreferences") {
        $(`.navPreferences`).addClass('active')
    } else if (profileError === "errorDiningCriteria") {
        $(`.navFactors`).addClass('active')
    } else {
        $(`.navProfile`).addClass('active')
    }

    $('body').on('click', '.tab', function () {
        toggleTab(this.id);
    })
    
    $('body').on('click', '.editnavProfile', async function () {
        $('#editnavProfile').removeClass('d-none');
        $('#backdrop').removeClass('d-none');
        $('body').addClass('stop-scrolling')
        // $('#shinyForm').prop('checked', false);
    });
    $('body').on('click', '.editnavPreferences', async function () {
        $('#editnavPreferences').removeClass('d-none');
        $('#backdrop').removeClass('d-none');
        $('body').addClass('stop-scrolling')
        // $('#shinyForm').prop('checked', false);
    });
    $('body').on('click', '.editnavFactors', async function () {
        $('#editnavFactors').removeClass('d-none');
        $('#backdrop').removeClass('d-none');
        $('body').addClass('stop-scrolling')
        // $('#shinyForm').prop('checked', false);
    });
    $('body').on('click', '.close-modal', async function () {
        $('#editnavProfile').addClass('d-none');
        $('#editnavPreferences').addClass('d-none');
        $('#editnavFactors').addClass('d-none');
        $('#backdrop').addClass('d-none');
        $('body').removeClass('stop-scrolling')
        // $('#shinyForm').prop('checked', false);
    });
}

$(document).ready(setup)