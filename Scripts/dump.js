function refreshClipboard() {
    $.ajax({
        url: "/Home/Clipboard",
        cache: false
    }).done(function (data) {
        $("#clipboard-panel textarea").val(data);
    });
}

function refreshFiles() {
    $.ajax({
        url: "/Home/FileList",
        cache: false
    }).done(function (data) {
        var tbody = $("#files-panel tbody");
        tbody.empty();
        $.each(data, function (i, fileMeta) {
            var tr = $("<tr>");
            var td = $("<td>");
            td.append($("<a>").text(fileMeta.FileName).attr("href", "/Home/Download?filename=" + fileMeta.FileName))
            tr.append($(td));
            tr.append($("<td>").text(fileMeta.LastModified));
            tr.append($("<td>").text(readableSize(fileMeta.Size)));

            td = $("<td>");
            td.append($("<a>").addClass("glyphicon glyphicon-trash").attr("href", "/Home/Delete?filename=" + fileMeta.FileName));
            tr.append($(td));

            tbody.append(tr);
        });
    });
}

function readableSize(size) {
    suf = ["B", "KB", "MB", "GB", "TB", "PB", "EB"]; //Longs run out around EB
    if (size === 0)
        return "0" + suf[0];
    var bytes = Math.abs(size);
    var place = Math.floor(Math.log(bytes) / Math.log(1024));
    var num = Math.round(bytes / Math.pow(1024, place), 1);
    return (Math.sign(size) * num).toString() + " " + suf[place];
}

function addFileToTable(file) {
    var tbody = $("#progress tbody");
    var uploads = $("tr", tbody);

    var tr = $("<tr>").data("filename", file.fileName);
    tr.append($("<td>").text(file.fileName));
    tr.append($("<td>").text(readableSize(file.size)));
    var td = $("<td>");
    var progress = $("<div>").addClass("progress");
    td.append(progress);
    var progressBar = $("<div>").addClass("progress-bar").addClass("progress-bar-striped").addClass("active").css("width", "0%");
    progress.append(progressBar);
    tr.append(td);

    tbody.append(tr);
}

$().ready(function () {
    refreshClipboard();
    refreshFiles();

    $("#save-clipboard").click(function () {
        $.post("/Home/Clipboard", {
            contents: $("#clipboard-panel textarea").val()
        });
    });

    $("#clipboard-heading span").click(function (event) {
        event.stopPropagation();

        refreshClipboard();
    });

    $("#files-heading span").click(function (event) {
        event.stopPropagation();

        refreshFiles();
    });

    var r = new Resumable({
        target: '/api/File/Upload'
    });

    if (!r.support) {
        $("#legacy").show();
        $("#new").hide();
    }

    r.assignBrowse(document.getElementById('browse-button'));
    r.assignDrop(document.getElementsByTagName('body'));

    r.on('fileSuccess', function (file) {
        refreshFiles();
    });
    r.on('fileProgress', function (file) {
        var tbody = $("#progress tbody");
        var uploads = $("tr", tbody);

        var percentage = Math.floor(file.progress() * 100).toString();

        $.each(uploads, function (i, tr) {
            if ($(tr).data("filename") === file.fileName) {
                $(".progress-bar", tr).css("width", percentage + "%");
                $(".progress-bar", tr).text(percentage + "%");

                if (percentage === "100") {
                    $(".progress-bar", tr).removeClass("progress-bar-striped").removeClass("progress-bar-animated");
                }
            }
        });
    });
    r.on('fileAdded', function (file, event) {
        r.upload();
        $("#upload-panel").collapse("show");
        addFileToTable(file);
    });
});