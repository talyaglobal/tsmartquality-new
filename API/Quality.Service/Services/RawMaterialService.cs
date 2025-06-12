using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class RawMaterialService(IGenericRepository<RawMaterial> repository, IUnitOfWork unitOfWork, IMapper mapper, IRawMaterialRepository rawMaterialPortalRepository, ICustomUpdateService<RawMaterial> customUpdateService) : Service<RawMaterial>(repository, unitOfWork), IRawMaterialService
    {
        private readonly IRawMaterialRepository _rawMaterialPortalRepository = rawMaterialPortalRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<RawMaterial> _customUpdateService = customUpdateService;

        public override async Task<RawMaterial> AddAsync(RawMaterial rawMaterialPortal)
        {
            rawMaterialPortal.CreatedDate = DateTime.UtcNow;
            rawMaterialPortal.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(rawMaterialPortal);
        }

        public override async Task ChangeStatusAsync(RawMaterial rawMaterialPortal)
        {
            var current = await _rawMaterialPortalRepository.GetByIdAsync(rawMaterialPortal.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = rawMaterialPortal.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(RawMaterial rawMaterialPortal)
        {
            var current = await _rawMaterialPortalRepository.GetByIdAsync(rawMaterialPortal.Id);

            RawMaterial last = _customUpdateService.Check(current, rawMaterialPortal);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = rawMaterialPortal.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
