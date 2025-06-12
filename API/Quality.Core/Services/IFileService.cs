using Microsoft.AspNetCore.Http;

namespace Quality.Core.Services
{
    public interface IFileService
    {
        List<String> FileSaveToServer(List<IFormFile> files, string filePath);
        void FileDeleteToServer(string path);
        string SingleFileUpload(IFormFile file, string filePath);
    }
}
