using Quality.Core.Models.BaseModels.DefinitionModels;

namespace Quality.Core.Services
{
    public interface IPhotoService : IService<Photo>
    {
        List<String> GetPhotosByProductList(int productId);
        string GetPhotoByUserList(int userId);
        Task UploadMultiPhotosAsync(List<Photo> photos);
        Task UploadSinglePhotoAsync(Photo photo);
    }
}
