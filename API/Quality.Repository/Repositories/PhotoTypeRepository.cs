using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class PhotoTypeRepository(AppDbContext context) : GenericRepository<PhotoType>(context), IPhotoTypeRepository
    {
    }
}
