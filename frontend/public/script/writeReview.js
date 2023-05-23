// Handle the file upload event
function handleDrop(event) {
    event.preventDefault();

    var files = event.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        reader.onload = handleFileRead;
        reader.readAsDataURL(file);
        fileArray.push(files[i]);
    }
}

// Pushing the files to an array
function handleButton(event) {
    event.preventDefault();

    var files = event.target.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        reader.onload = handleFileRead;
        reader.readAsDataURL(file);
        fileArray.push(files[i]);
    }
}

// Display the images on the page
function handleFileRead(event) {
    var text = document.getElementById('photoUplaodText');
    text.classList.remove('d-none');
    $('#removeAllImages').removeClass('d-none');
    var img = document.createElement('img');

    img.src = event.target.result;
    img.classList.add("PendingImage");
    numberofImages += 1

    img.style.width = 'max(320px,100%)';
    img.style["margin-top"] = '10px';
    img.style["margin-right"] = '10px';

    var container = document.querySelector('#pendingUploadImages')
    container.appendChild(img);
}

// Prevent default drag behaviors
function handleDragOver(event) {
    event.preventDefault();
}

// Hand the upload button click
var uploadButton = document.getElementById('uploadButton');
uploadButton.addEventListener('click', function () {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/jpg';
    fileInput.addEventListener('change', function (event) {
        handleButton(event)
    });
    fileInput.click();
});

// Upload reviews to the server
function uploadReviews() {
    const pendingUploadMap = {
        userID: document.getElementById('userID').value,
        restaurantID: document.getElementById('restaurantID').value,
        reviewTitle: document.getElementById('reviewTitle').value,
        reviewBody: document.getElementById('reviewBody').value
    };

    const formData = new FormData();
    formData.append('userID', pendingUploadMap.userID);
    formData.append('restaurantID', pendingUploadMap.restaurantID);
    formData.append('reviewTitle', pendingUploadMap.reviewTitle);
    formData.append('reviewBody', pendingUploadMap.reviewBody);

    fileArray.forEach((file) => {
        formData.append('files', file);
    });

    fetch('/processReview', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            var backdrop = document.getElementById('backdrop');
            if (data.status == "error") {
                var errorMessage = document.getElementById('errorMessage');
                errorMessage.innerHTML = data.message;
                errorMessage.classList.remove('d-none');
                $("#submitButton").removeClass('processing');
                $("#submitButton").removeClass('mt-5');
                $("#submitButton").addClass('mt-3');

            }
            if (data.status == "success") {
                alert(data.message);
                backdrop.classList.remove('d-none');
                setTimeout(function () {
                    window.location.href = "/restaurant/" + pendingUploadMap.restaurantID;
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Handle the submission animation
document.querySelectorAll('#submitButton').forEach(button => {
    button.addEventListener('click', e => {
        button.classList.add('processing');
        e.preventDefault();
    });
});

var numberofImages = 0;
var pendingUploadMap = {};
var fileArray = [];
var dropArea = document.getElementById('drop-area');
dropArea.addEventListener('drop', handleDrop, false);
dropArea.addEventListener('dragover', handleDragOver, false);

$('body').on('click', '#removeAllImages', function () {
    $(`.PendingImage`).remove();
    fileArray = [];
});