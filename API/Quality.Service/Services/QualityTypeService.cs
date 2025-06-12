using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class QualityTypeService(IGenericRepository<QualityType> repository, IUnitOfWork unitOfWork, IMapper mapper, IQualityTypeRepository qualityTypeRepository, ICustomUpdateService<QualityType> customUpdateService) : Service<QualityType>(repository, unitOfWork), IQualityTypeService
    {
        private readonly IQualityTypeRepository _qualityTypeRepository = qualityTypeRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<QualityType> _customUpdateService = customUpdateService;

        public override async Task<QualityType> AddAsync(QualityType qualityType)
        {
            qualityType.CreatedDate = DateTime.UtcNow;
            qualityType.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(qualityType);
        }

        public override async Task ChangeStatusAsync(QualityType qualityType)
        {
            var current = await _qualityTypeRepository.GetByIdAsync(qualityType.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = qualityType.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(QualityType qualityType)
        {
            var current = await _qualityTypeRepository.GetByIdAsync(qualityType.Id);

            QualityType last = _customUpdateService.Check(current, qualityType);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = qualityType.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
