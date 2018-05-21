using Dump.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.Web.Hosting;
using System.Web.Mvc;

namespace Dump.Controllers
{
    public class HomeController : Controller
    {
        private static string UploadsDir = HostingEnvironment.MapPath(WebConfigurationManager.AppSettings["uploadsDir"]);
        private static string ClipboardPath = Path.Combine(UploadsDir, "clipboard.txt");

        public HomeController()
        {
            Directory.CreateDirectory(UploadsDir);
        }

        private List<FileMeta> GetFiles()
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

            return fileMetas;
        }

        private string GetClipboard()
        {
            string contents = null;

            if (System.IO.File.Exists(ClipboardPath))
                contents = System.IO.File.ReadAllText(ClipboardPath);

            return contents;
        }

        public ActionResult Index()
        {
            return View(new HomeModel()
            {
                Clipboard = GetClipboard(),
                Files = GetFiles()
            });
        }

        public ActionResult Delete(string filename)
        {
            System.IO.File.Delete(Path.Combine(UploadsDir, filename));
            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public ActionResult Clipboard()
        {
            return Content(GetClipboard());
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult Clipboard(string contents)
        {
            System.IO.File.WriteAllText(ClipboardPath, contents);

            return RedirectToAction(nameof(Index));
        }

        public ActionResult FileList()
        {
            return Json(GetFiles(), JsonRequestBehavior.AllowGet);
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