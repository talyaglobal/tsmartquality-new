using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class PackagingService(IGenericRepository<Packaging> repository, IUnitOfWork unitOfWork, IMapper mapper, IPackagingRepository packagingRepository, ICustomUpdateService<Packaging> customUpdateService) : Service<Packaging>(repository, unitOfWork), IPackagingService
    {
        private readonly IPackagingRepository _packagingRepository = packagingRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Packaging> _customUpdateService = customUpdateService;
        public override async Task<Packaging> AddAsync(Packaging packaging)
        {
            packaging.CreatedDate = DateTime.UtcNow;
            packaging.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(packaging);
        }

        public override async Task ChangeStatusAsync(Packaging packaging)
        {
            var current = await _packagingRepository.GetByIdAsync(packaging.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = packaging.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Packaging packaging)
        {
            var current = await _packagingRepository.GetByIdAsync(packaging.Id);

            Packaging last = _customUpdateService.Check(current, packaging);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = packaging.UpdatedBy;

            await base.UpdateAsync(last);
        }

    }
}
