using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class SKUFollowUnitService(IGenericRepository<SKUFollowUnit> repository, IUnitOfWork unitOfWork, IMapper mapper, ISKUFollowUnitRepository skuFollowUnitRepository, ICustomUpdateService<SKUFollowUnit> customUpdateService) : Service<SKUFollowUnit>(repository, unitOfWork), ISKUFollowUnitService
    {
        private readonly ISKUFollowUnitRepository _skuFollowUnitRepository = skuFollowUnitRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<SKUFollowUnit> _customUpdateService = customUpdateService;

        public override async Task<SKUFollowUnit> AddAsync(SKUFollowUnit skuFollowUnit)
        {
            skuFollowUnit.CreatedDate = DateTime.UtcNow;
            skuFollowUnit.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(skuFollowUnit);
        }

        public override async Task ChangeStatusAsync(SKUFollowUnit skuFollowUnit)
        {
            var current = await _skuFollowUnitRepository.GetByIdAsync(skuFollowUnit.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = skuFollowUnit.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(SKUFollowUnit skuFollowUnit)
        {
            var current = await _skuFollowUnitRepository.GetByIdAsync(skuFollowUnit.Id);

            SKUFollowUnit last = _customUpdateService.Check(current, skuFollowUnit);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = skuFollowUnit.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
