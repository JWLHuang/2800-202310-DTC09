function handleDrop(event) {
    event.preventDefault();

    var files = event.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        reader.onload = handleFileRead;
        reader.readAsDataURL(file);
    }
}

function handleButton(event) {
    event.preventDefault();

    var files = event.target.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        reader.onload = handleFileRead;
        reader.readAsDataURL(file);
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


var dropArea = document.getElementById('drop-area');
dropArea.addEventListener('drop', handleDrop, false);
dropArea.addEventListener('dragover', handleDragOver, false);