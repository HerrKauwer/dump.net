using Dump.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;

namespace Dump.Controllers
{
    public class HomeController : Controller
    {
        private static string UploadsDir = WebConfigurationManager.AppSettings["uploadsDir"];
        private static string ClipboardPath = Path.Combine(UploadsDir, "clipboard.txt");

        public ActionResult Index()
        {
            var filesNames = Directory.EnumerateFiles(UploadsDir);

            var fileInfos = filesNames.Select(f => new FileInfo(Path.Combine(UploadsDir, f)));

            fileInfos = fileInfos.OrderByDescending(f => f.LastWriteTime);

            var fileMetas = fileInfos.Select(fileInfo => new FileMeta()
            {
                FileName = fileInfo.Name,
                Size = fileInfo.Length
            }).ToList();

            return View(fileMetas);
        }

        [HttpGet]
        public ActionResult Clipboard()
        {
            string contents = null;

            if (System.IO.File.Exists(ClipboardPath))
                contents = System.IO.File.ReadAllText(ClipboardPath);

            return Content(contents);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult Clipboard(string contents)
        {
            System.IO.File.WriteAllText(ClipboardPath, contents);

            return new EmptyResult();
        }

        public ActionResult FileList()
        {
            var filesNames = Directory.EnumerateFiles(UploadsDir);

            var fileInfos = filesNames.Select(f => new FileInfo(Path.Combine(UploadsDir, f)));

            fileInfos = fileInfos.OrderByDescending(f => f.LastWriteTime);

            var fileMetas = fileInfos.Select(fileInfo => new FileMeta()
            {
                FileName = fileInfo.Name,
                Size = fileInfo.Length,
                LastModified = fileInfo.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
            }).ToList();

            return Json(fileMetas, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Download(string filename)
        {
            return File(Path.Combine(UploadsDir, filename), "application/octet-stream", filename);
        }

        public ActionResult Upload(HttpPostedFileBase file)
        {
            if (file != null && file.ContentLength > 0)
            {
                var fileName = Path.GetFileName(file.FileName);

                var path = Path.Combine(UploadsDir, fileName);
                file.SaveAs(path);
            }

            return RedirectToAction(nameof(Index));
        }
    }
}