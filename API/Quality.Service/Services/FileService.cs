using Quality.Core.Services;
using Microsoft.AspNetCore.Http;

namespace Quality.Service.Services
{
    public class FileService : IFileService
    {
        public void FileDeleteToServer(string path)
        {
            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }

        public List<string> FileSaveToServer(List<IFormFile> files, string filePath)
        {
            List<string> fileNames = [];

            foreach (IFormFile file in files)
            {
                var fileFormat = file.FileName.Substring(file.FileName.LastIndexOf('.'));
                fileFormat = fileFormat.ToLower();
                string fileName = Guid.NewGuid().ToString() + fileFormat;
                string path = Path.Combine(filePath, fileName);
                using (var stream = File.Create(path))
                {
                    file.CopyTo(stream);
                }
                fileNames.Add(fileName);
            }
            return fileNames;

        }
        public string SingleFileUpload(IFormFile file, string filePath)
        {
            var fileFormat = file.FileName[file.FileName.LastIndexOf('.')..];
            fileFormat = fileFormat.ToLower();
            string fileName = Guid.NewGuid().ToString() + fileFormat;
            string path = Path.Combine(filePath, fileName);
            using (var stream = File.Create(path))
            {
                file.CopyTo(stream);
            }
            return fileName;
        }
    }
}
