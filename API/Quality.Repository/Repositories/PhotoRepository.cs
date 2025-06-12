using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class PhotoRepository(AppDbContext context) : GenericRepository<Photo>(context), IPhotoRepository
    {
        public async Task AddPhotos(List<Photo> photos)
        {

            await _context.Photos.AddRangeAsync(photos);
            _context.SaveChanges();
        }
    }
}
