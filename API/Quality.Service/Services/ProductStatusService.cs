using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class ProductStatusService(IGenericRepository<ProductStatus> repository, IUnitOfWork unitOfWork, IMapper mapper, IProductStatusRepository productStatusRepository, ICustomUpdateService<ProductStatus> customUpdateService) : Service<ProductStatus>(repository, unitOfWork), IProductStatusService
    {
        private readonly IProductStatusRepository _productStatusRepository = productStatusRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<ProductStatus> _customUpdateService = customUpdateService;

        public override async Task<ProductStatus> AddAsync(ProductStatus productStatus)
        {
            productStatus.CreatedDate = DateTime.UtcNow;
            productStatus.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(productStatus);
        }

        public override async Task ChangeStatusAsync(ProductStatus productStatus)
        {
            var current = await _productStatusRepository.GetByIdAsync(productStatus.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = productStatus.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(ProductStatus productStatus)
        {
            var current = await _productStatusRepository.GetByIdAsync(productStatus.Id);

            ProductStatus last = _customUpdateService.Check(current, productStatus);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = productStatus.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
