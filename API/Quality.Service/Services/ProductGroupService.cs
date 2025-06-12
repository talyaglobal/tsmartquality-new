using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class ProductGroupService(IGenericRepository<ProductGroup> repository, IUnitOfWork unitOfWork, IMapper mapper, IProductGroupRepository productGroupRepository, ICustomUpdateService<ProductGroup> customUpdateService) : Service<ProductGroup>(repository, unitOfWork), IProductGroupService
    {
        private readonly IProductGroupRepository _productGroupRepository = productGroupRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<ProductGroup> _customUpdateService = customUpdateService;

        public override async Task<ProductGroup> AddAsync(ProductGroup productGroup)
        {
            productGroup.CreatedDate = DateTime.UtcNow;
            productGroup.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(productGroup);
        }

        public override async Task ChangeStatusAsync(ProductGroup productGroup)
        {
            var current = await _productGroupRepository.GetByIdAsync(productGroup.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = productGroup.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(ProductGroup productGroup)
        {
            var current = await _productGroupRepository.GetByIdAsync(productGroup.Id);

            ProductGroup last = _customUpdateService.Check(current, productGroup);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = productGroup.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
