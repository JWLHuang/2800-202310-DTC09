function handleDrop(event) {
    event.preventDefault();

    var files = event.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        numberofImages += 1
        reader.onload = handleFileRead;
        reader.readAsDataURL(file);
        fileArray.push(files[i]);
    }
}

function handleButton(event) {
    event.preventDefault();

    var files = event.target.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        numberofImages += 1
        reader.onload = handleFileRead;
        reader.readAsDataURL(file);
        fileArray.push(files[i]);
    }
}

function handleFileRead(event) {
    var text = document.getElementById('photoUplaodText');
    text.classList.remove('d-none');
    var img = document.createElement('img');

    img.src = event.target.result;

    img.style.width = 'max(320px,100%)';
    img.style["margin-top"] = '10px';
    img.style["margin-right"] = '10px';

    var container = document.querySelector('#pendingUploadImages')
    container.appendChild(img);
    console.log(numberofImages)
}

function handleDragOver(event) {
    event.preventDefault();
}

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

    // Assuming fileArray contains the file objects
    fileArray.forEach((file) => {
        formData.append('files', file);
    });

    fetch('/processReview', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

var numberofImages = 0;
var pendingUploadMap = {};
var fileArray = [];
var dropArea = document.getElementById('drop-area');
dropArea.addEventListener('drop', handleDrop, false);
dropArea.addEventListener('dragover', handleDragOver, false);