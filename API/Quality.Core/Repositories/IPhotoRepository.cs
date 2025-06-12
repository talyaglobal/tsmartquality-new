using Quality.Core.Models.BaseModels.DefinitionModels;

namespace Quality.Core.Repositories
{
    public interface IPhotoRepository : IGenericRepository<Photo>
    {
        Task AddPhotos(List<Photo> photos);
    }
}
