using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class CuttingTypeService(IGenericRepository<CuttingType> repository, IUnitOfWork unitOfWork, IMapper mapper, ICuttingTypeRepository cuttingTypeRepository, ICustomUpdateService<CuttingType> customUpdateService) : Service<CuttingType>(repository, unitOfWork), ICuttingTypeService
    {
        private readonly ICuttingTypeRepository _cuttingTypeRepository = cuttingTypeRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<CuttingType> _customUpdateService = customUpdateService;

        public override async Task<CuttingType> AddAsync(CuttingType cuttingType)
        {
            cuttingType.CreatedDate = DateTime.UtcNow;
            cuttingType.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(cuttingType);
        }

        public override async Task ChangeStatusAsync(CuttingType cuttingType)
        {
            var current = await _cuttingTypeRepository.GetByIdAsync(cuttingType.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = cuttingType.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(CuttingType cuttingType)
        {
            var current = await _cuttingTypeRepository.GetByIdAsync(cuttingType.Id);

            CuttingType last = _customUpdateService.Check(current, cuttingType);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = cuttingType.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
