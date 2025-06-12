using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class WarehouseService(IGenericRepository<Warehouse> repository, IUnitOfWork unitOfWork, IMapper mapper, IWarehouseRepository warehouseRepository, ICustomUpdateService<Warehouse> customUpdateService) : Service<Warehouse>(repository, unitOfWork), IWarehouseService
    {
        private readonly IWarehouseRepository _warehouseRepository = warehouseRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Warehouse> _customUpdateService = customUpdateService;
        public override async Task<Warehouse> AddAsync(Warehouse warehouse)
        {
            warehouse.CreatedDate = DateTime.UtcNow;
            warehouse.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(warehouse);
        }

        public override async Task ChangeStatusAsync(Warehouse warehouse)
        {
            var current = await _warehouseRepository.GetByIdAsync(warehouse.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = warehouse.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Warehouse warehouse)
        {
            var current = await _warehouseRepository.GetByIdAsync(warehouse.Id);

            Warehouse last = _customUpdateService.Check(current, warehouse);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = warehouse.UpdatedBy;

            await base.UpdateAsync(last);
        }

    }
}
