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
            td.append($("<a>").text(fileMeta.FileName).attr("href", "/Home/Download?filename=" + fileMeta.FileName));
            tr.append($(td));
            tr.append($("<td>").text(fileMeta.LastModified));
            tr.append($("<td>").text(fileMeta.ReadableSize));

            td = $("<td>");
            td.append($("<a>").addClass("glyphicon glyphicon-trash").attr("href", "/Home/Delete?filename=" + fileMeta.FileName));
            tr.append($(td));

            tbody.append(tr);
        });
    });
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round#A_better_solution
function round(number, precision) {
    var shift = function (number, exponent) {
        var numArray = ("" + number).split("e");
        return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + exponent) : exponent));
    };
    return shift(Math.round(shift(number, +precision)), -precision);
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign#Polyfill
if (!Math.sign) {
    Math.sign = function (x) {
        return ((x > 0) - (x < 0)) || +x;
    };
}

function readableSize(size) {
    var suf = ["B", "KB", "MB", "GB", "TB", "PB", "EB"]; //Longs run out around EB
    if (size === 0)
        return "0" + suf[0];
    var bytes = Math.abs(size);
    var place = Math.floor(Math.log(bytes) / Math.log(1024));
    var num = round(bytes / Math.pow(1024, place), 1);
    return (Math.sign(size) * num).toString() + " " + suf[place];
}

function addFileToTable(file) {
    var tbody = $("#progress tbody");

    var tr = $("<tr>").data("filename", file.fileName);
    tr.append($("<td>").text(file.fileName));
    tr.append($("<td>").text(readableSize(file.size)));
    var td = $("<td>");
    var progress = $("<div>").addClass("progress");
    td.append(progress);
    var progressBar = $("<div>").addClass("progress-bar").addClass("progress-bar-striped").addClass("active").css("width", "0");
    progress.append(progressBar);
    tr.append(td);

    tbody.append(tr);
}

$().ready(function () {
    $("#upload-panel").addClass("collapse");

    $("#form-clipboard").submit(function () {
        return false;
    });

    $("#save-clipboard").click(function () {
        event.stopPropagation();

        $.post("/Home/Clipboard", {
            contents: $("#clipboard-panel textarea").val()
        });
    });

    $("#refresh-clipboard").show().click(function (event) {
        event.stopPropagation();

        refreshClipboard();
    });

    $("#refresh-files").show().click(function (event) {
        event.stopPropagation();

        refreshFiles();
    });

    var r = new Resumable({
        target: '/api/File/Upload'
    });

    if (r.support) {
        $("#legacy").hide();
        $("#new").show();

        r.assignBrowse(document.getElementById('browse-button'));
        r.assignDrop(document.getElementsByTagName('body'));

        r.on('fileSuccess', function () {
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
        r.on('fileAdded', function (file) {
            r.upload();
            $("#upload-panel").collapse("show");
            addFileToTable(file);
        });
    }
});