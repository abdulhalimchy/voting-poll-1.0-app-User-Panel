//-------------------Share link-----------------------------
function copyToClipboard() {
    let copyText = document.getElementById("pollLink");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
}

$('.btnCopyLink').tooltip({
    animated: 'fade',
    placement: 'top',
    trigger: 'click'
});

function setupSharePollModal(element) {
    let ara = element.value.split("++");
    document.getElementById('pollTitle').innerHTML = ara[0];
    document.getElementById('pollLink').value = ara[1];
}

//////////////////////End share Link


//--------------------------Confirm Poll Deletion------------------------
function setupDeletePollModal(element) {
    let ara = element.value.split("++");
    document.getElementById('pollTitle2').innerHTML = ara[0];
    document.getElementById('pollDeletionLink').action = ara[1];
}

$('#deletePoll').click(function () {
    $('#confirmDelete').modal('hide');
});

///////////////////Confirm Poll Deletion



//--------------------------Confirm End Poll------------------------
function setupEndPollModal(element) {
    let ara = element.value.split("++");
    document.getElementById('pollTitle3').innerHTML = ara[0];
    document.getElementById('pollEndLink').action = ara[1];
}

$('#endPoll').click(function () {
    $('#confirmEndPoll').modal('hide');
});

///////////////////Confirm End Poll

//---------------------------Start Loader------------------
function startLoading() {
    let div = document.createElement('div');
    div.className = "loaderdiv d-flex align-items-center justify-content-center";
    document.body.appendChild(div);
}
//---------------------------/END Start Loader------------------

//--------------------- Focus ----------------------------------------
$('.focus-this-element').focus();
//--------------------- /END Focus -----------------------------------
