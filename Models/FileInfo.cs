using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dump.Models
{
    public class FileMeta
    {
        public string FileName { get; set; }

        internal long Size { get; set; }

        public string LastModified { get; set; }

        public string ReadableSize
        {
            get
            {
                string[] suf = { "B", "KB", "MB", "GB", "TB", "PB", "EB" }; //Longs run out around EB
                if (Size == 0)
                    return "0" + suf[0];
                long bytes = Math.Abs(Size);
                int place = Convert.ToInt32(Math.Floor(Math.Log(bytes, 1024)));
                double num = Math.Round(bytes / Math.Pow(1024, place), 1);
                return (Math.Sign(Size) * num).ToString() + " " + suf[place];
            }
        }
    }
}