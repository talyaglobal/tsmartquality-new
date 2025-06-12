using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class RawMaterialGroupService(IGenericRepository<RawMaterialGroup> repository, IUnitOfWork unitOfWork, IMapper mapper, IRawMaterialGroupRepository rawMaterialGroupRepository, ICustomUpdateService<RawMaterialGroup> customUpdateService) : Service<RawMaterialGroup>(repository, unitOfWork), IRawMaterialGroupService
    {
        private readonly IRawMaterialGroupRepository _rawMaterialGroupRepository = rawMaterialGroupRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<RawMaterialGroup> _customUpdateService = customUpdateService;
        public override async Task<RawMaterialGroup> AddAsync(RawMaterialGroup rawMaterialGroup)
        {
            rawMaterialGroup.CreatedDate = DateTime.UtcNow;
            rawMaterialGroup.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(rawMaterialGroup);
        }

        public override async Task ChangeStatusAsync(RawMaterialGroup rawMaterialGroup)
        {
            var current = await _rawMaterialGroupRepository.GetByIdAsync(rawMaterialGroup.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = rawMaterialGroup.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(RawMaterialGroup rawMaterialGroup)
        {
            var current = await _rawMaterialGroupRepository.GetByIdAsync(rawMaterialGroup.Id);

            RawMaterialGroup last = _customUpdateService.Check(current, rawMaterialGroup);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = rawMaterialGroup.UpdatedBy;

            await base.UpdateAsync(last);
        }

    }
}
