using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dump.Models
{
    public class FileMeta
    {
        public string FileName { get; set; }

        public long Size { get; set; }

        public string LastModified { get; set; }
    }
}