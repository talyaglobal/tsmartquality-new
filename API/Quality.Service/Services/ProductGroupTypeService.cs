using AutoMapper;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;
using Microsoft.EntityFrameworkCore;

namespace Quality.Service.Services
{
    public class ProductGroupTypeService(IGenericRepository<ProductGroupType> repository, IUnitOfWork unitOfWork, IMapper mapper, IProductGroupTypeRepository productGroupTypeRepository, ICustomUpdateService<ProductGroupType> customUpdateService) : Service<ProductGroupType>(repository, unitOfWork), IProductGroupTypeService
    {
        private readonly IProductGroupTypeRepository _productGroupTypeRepository = productGroupTypeRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<ProductGroupType> _customUpdateService = customUpdateService;

        public override async Task<ProductGroupType> AddAsync(ProductGroupType productGroupType)
        {
            productGroupType.CreatedDate = DateTime.UtcNow;
            productGroupType.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(productGroupType);
        }

        public override async Task ChangeStatusAsync(ProductGroupType productGroupType)
        {
            var current = await _productGroupTypeRepository.GetByIdAsync(productGroupType.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = productGroupType.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(ProductGroupType productGroupType)
        {
            var current = await _productGroupTypeRepository.GetByIdAsync(productGroupType.Id);

            ProductGroupType last = _customUpdateService.Check(current, productGroupType);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = productGroupType.UpdatedBy;

            await base.UpdateAsync(last);
        }

        public async Task<List<ProductGroupTypeDto>> GetAllWithDetailsAsync(int companyId)
        {
            var data = await _productGroupTypeRepository.Where(x => x.CompanyId == companyId).OrderByDescending(x => x.CreatedDate)
                .Include(x => x.ProductGroupTypeDefinitions)
                .ToListAsync();

            var dto = _mapper.Map<List<ProductGroupTypeDto>>(data);

            return dto;
        }

        public async Task<ProductGroupTypeDto> GetWithDetailsAsync(int productGroupTypeId, int companyId)
        {
            var productGroupType = await _productGroupTypeRepository
                .Where(x => x.Id == productGroupTypeId && x.CompanyId == companyId)
                .Include(x => x.ProductGroupTypeDefinitions)

                .FirstOrDefaultAsync();

            var dto = _mapper.Map<ProductGroupTypeDto>(productGroupType);

            return dto;
        }
    }
}
