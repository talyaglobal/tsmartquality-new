using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class ProductTypeService(IGenericRepository<ProductType> repository, IUnitOfWork unitOfWork, IMapper mapper, IProductTypeRepository productTypeRepository, ICustomUpdateService<ProductType> customUpdateService) : Service<ProductType>(repository, unitOfWork), IProductTypeService
    {
        private readonly IProductTypeRepository _productTypeRepository = productTypeRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<ProductType> _customUpdateService = customUpdateService;

        public override async Task<ProductType> AddAsync(ProductType productType)
        {
            productType.CreatedDate = DateTime.UtcNow;
            productType.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(productType);
        }

        public override async Task ChangeStatusAsync(ProductType productType)
        {
            var current = await _productTypeRepository.GetByIdAsync(productType.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = productType.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(ProductType productType)
        {
            var current = await _productTypeRepository.GetByIdAsync(productType.Id);

            ProductType last = _customUpdateService.Check(current, productType);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = productType.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
