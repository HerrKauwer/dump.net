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
            tr.append($("<td>").text(fileMeta.ReadableSize));

            tbody.append(tr);
        });
    });
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
});