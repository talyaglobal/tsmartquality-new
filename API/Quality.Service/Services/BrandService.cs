using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class BrandService(IGenericRepository<Brand> repository, IUnitOfWork unitOfWork, IMapper mapper, IBrandRepository brandRepository, ICustomUpdateService<Brand> customUpdateService) : Service<Brand>(repository, unitOfWork), IBrandService
    {
        private readonly IBrandRepository _brandRepository = brandRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Brand> _customUpdateService = customUpdateService;

        public override async Task<Brand> AddAsync(Brand brand)
        {
            brand.CreatedDate = DateTime.UtcNow;
            brand.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(brand);
        }

        public override async Task ChangeStatusAsync(Brand brand)
        {
            var current = await _brandRepository.GetByIdAsync(brand.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = brand.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Brand brand)
        {
            var current = await _brandRepository.GetByIdAsync(brand.Id);

            Brand last = _customUpdateService.Check(current, brand);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = brand.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
