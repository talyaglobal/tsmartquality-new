using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class SKUFollowTypeService(IGenericRepository<SKUFollowType> repository, IUnitOfWork unitOfWork, IMapper mapper, ISKUFollowTypeRepository skuFollowTypeRepository, ICustomUpdateService<SKUFollowType> customUpdateService) : Service<SKUFollowType>(repository, unitOfWork), ISKUFollowTypeService
    {
        private readonly ISKUFollowTypeRepository _skuFollowTypeRepository = skuFollowTypeRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<SKUFollowType> _customUpdateService = customUpdateService;

        public override async Task<SKUFollowType> AddAsync(SKUFollowType skuFollowType)
        {
            skuFollowType.CreatedDate = DateTime.UtcNow;
            skuFollowType.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(skuFollowType);
        }

        public override async Task ChangeStatusAsync(SKUFollowType skuFollowType)
        {
            var current = await _skuFollowTypeRepository.GetByIdAsync(skuFollowType.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = skuFollowType.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(SKUFollowType skuFollowType)
        {
            var current = await _skuFollowTypeRepository.GetByIdAsync(skuFollowType.Id);

            SKUFollowType last = _customUpdateService.Check(current, skuFollowType);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = skuFollowType.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
