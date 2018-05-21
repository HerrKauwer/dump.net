using System.Collections.Generic;

namespace Dump.Models
{
    public class HomeModel
    {
        public string Clipboard { get; set; }

        public List<FileMeta> Files { get; set; }
    }
}