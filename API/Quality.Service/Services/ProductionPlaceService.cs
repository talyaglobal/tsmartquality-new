using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class ProductionPlaceService(IGenericRepository<ProductionPlace> repository, IUnitOfWork unitOfWork, IMapper mapper, IProductionPlaceRepository productionPlaceRepository, ICustomUpdateService<ProductionPlace> customUpdateService) : Service<ProductionPlace>(repository, unitOfWork), IProductionPlaceService
    {
        private readonly IProductionPlaceRepository _productionPlaceRepository = productionPlaceRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<ProductionPlace> _customUpdateService = customUpdateService;
        public override async Task<ProductionPlace> AddAsync(ProductionPlace productionPlace)
        {
            productionPlace.CreatedDate = DateTime.UtcNow;
            productionPlace.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(productionPlace);
        }

        public override async Task ChangeStatusAsync(ProductionPlace productionPlace)
        {
            var current = await _productionPlaceRepository.GetByIdAsync(productionPlace.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = productionPlace.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(ProductionPlace productionPlace)
        {
            var current = await _productionPlaceRepository.GetByIdAsync(productionPlace.Id);

            ProductionPlace last = _customUpdateService.Check(current, productionPlace);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = productionPlace.UpdatedBy;

            await base.UpdateAsync(last);
        }

    }
}
