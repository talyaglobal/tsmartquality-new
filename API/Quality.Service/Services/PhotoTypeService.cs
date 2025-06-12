using AutoMapper;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class PhotoTypeService(IGenericRepository<PhotoType> repository, IUnitOfWork unitOfWork, IMapper mapper, IPhotoTypeRepository photoTypeRepository, ICustomUpdateService<PhotoType> customUpdateService) : Service<PhotoType>(repository, unitOfWork), IPhotoTypeService
    {
        private readonly IPhotoTypeRepository _photoTypeRepository = photoTypeRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<PhotoType> _customUpdateService = customUpdateService;

        public override async Task<PhotoType> AddAsync(PhotoType photoType)
        {
            photoType.CreatedDate = DateTime.UtcNow;
            photoType.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(photoType);
        }

        public override async Task ChangeStatusAsync(PhotoType photoType)
        {
            var current = await _photoTypeRepository.GetByIdAsync(photoType.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = photoType.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(PhotoType photoType)
        {
            var current = await _photoTypeRepository.GetByIdAsync(photoType.Id);

            PhotoType last = _customUpdateService.Check(current, photoType);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = photoType.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
