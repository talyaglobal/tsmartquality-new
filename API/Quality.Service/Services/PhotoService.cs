using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class PhotoService(IGenericRepository<Photo> repository, IUnitOfWork unitOfWork, IPhotoRepository photoRepository, ICustomUpdateService<Photo> customUpdateService) : Service<Photo>(repository, unitOfWork), IPhotoService
    {
        private readonly IPhotoRepository _photoRepository = photoRepository;
        private readonly ICustomUpdateService<Photo> _customUpdateService = customUpdateService;

        public override async Task<Photo> AddAsync(Photo photo)
        {
            photo.CreatedDate = DateTime.UtcNow;
            photo.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(photo);
        }

        public override async Task ChangeStatusAsync(Photo photo)
        {
            var current = await _photoRepository.GetByIdAsync(photo.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = photo.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public string GetPhotoByUserList(int userId)
        {
            string photo;
            var dtos = _photoRepository.Where(x => x.UserId == userId).OrderByDescending(x => x.CreatedDate).FirstOrDefault();

            if (dtos != null)
            {
                photo = dtos.PhotoUrl;
            }
            else
            {
                photo = "profile.jpg";
            }

            return photo;
        }

        public List<string> GetPhotosByProductList(int productId)
        {
            List<String> photos = [];
            var dtos = _photoRepository.Where(x => x.ProductId == productId).ToList();

            foreach (var dto in dtos)
            {
                photos.Add(dto.PhotoUrl);
            }

            return photos;
        }

        public override async Task UpdateAsync(Photo photo)
        {
            var current = await _photoRepository.GetByIdAsync(photo.Id);

            Photo last = _customUpdateService.Check(current, photo);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = photo.UpdatedBy;

            await base.UpdateAsync(last);
        }

        public async Task UploadMultiPhotosAsync(List<Photo> photos)
        {
            foreach (var photo in photos)
            {
                photo.CreatedDate = DateTime.UtcNow;
                photo.UpdatedDate = DateTime.UtcNow;
            }
            await _photoRepository.AddPhotos(photos);
        }

        public async Task UploadSinglePhotoAsync(Photo photo)
        {
            photo.CreatedDate = DateTime.UtcNow;
            photo.UpdatedDate = DateTime.UtcNow;

            await base.AddAsync(photo);
        }
    }
}
