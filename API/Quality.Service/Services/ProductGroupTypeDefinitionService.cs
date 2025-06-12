using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class ProductGroupTypeDefinitionService(IGenericRepository<ProductGroupTypeDefinition> repository, IUnitOfWork unitOfWork, IMapper mapper, IProductGroupTypeDefinitionRepository productGroupTypeDefinitionRepository, ICustomUpdateService<ProductGroupTypeDefinition> customUpdateService) : Service<ProductGroupTypeDefinition>(repository, unitOfWork), IProductGroupTypeDefinitionService
    {
        private readonly IProductGroupTypeDefinitionRepository _productGroupTypeDefinitionRepository = productGroupTypeDefinitionRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<ProductGroupTypeDefinition> _customUpdateService = customUpdateService;

        public override async Task<ProductGroupTypeDefinition> AddAsync(ProductGroupTypeDefinition productGroupTypeDefinition)
        {
            productGroupTypeDefinition.CreatedDate = DateTime.UtcNow;
            productGroupTypeDefinition.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(productGroupTypeDefinition);
        }

        public override async Task ChangeStatusAsync(ProductGroupTypeDefinition productGroupTypeDefinition)
        {
            var current = await _productGroupTypeDefinitionRepository.GetByIdAsync(productGroupTypeDefinition.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = productGroupTypeDefinition.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(ProductGroupTypeDefinition productGroupTypeDefinition)
        {
            var current = await _productGroupTypeDefinitionRepository.GetByIdAsync(productGroupTypeDefinition.Id);

            ProductGroupTypeDefinition last = _customUpdateService.Check(current, productGroupTypeDefinition);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = productGroupTypeDefinition.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
