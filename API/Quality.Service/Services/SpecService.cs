using AutoMapper;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs.CustomDto;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;
using Microsoft.EntityFrameworkCore;

namespace Quality.Service.Services
{
    public class SpecService(IGenericRepository<Spec> repository, IUnitOfWork unitOfWork, IMapper mapper, ISpecRepository specRepository, ICustomUpdateService<Spec> customUpdateService) : Service<Spec>(repository, unitOfWork), ISpecService
    {
        private readonly ISpecRepository _specRepository = specRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Spec> _customUpdateService = customUpdateService;

        public override async Task<Spec> AddAsync(Spec spec)
        {
            spec.CreatedDate = DateTime.UtcNow;
            spec.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(spec);
        }

        public override async Task ChangeStatusAsync(Spec spec)
        {
            var current = await _specRepository.GetByIdAsync(spec.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = spec.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Spec spec)
        {
            var current = await _specRepository.GetByIdAsync(spec.Id);
            Spec last = _customUpdateService.Check(current, spec);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = spec.UpdatedBy;

            await base.UpdateAsync(last);
        }
        public async Task<List<SpecAllDto>> GetAllWithDetailsAsync()
        {
            var specs = await _specRepository.GetAll().Include(x => x.Product)
                .Select(x => new SpecAllDto() { Id = x.Id, Name = x.Name, ProductCode = x.Product.Code, ProductName = x.Product.Name })
                .ToListAsync();

            return specs;
        }
        public async Task<SpecDetailsDto> GetWithDetails(int specId)
        {
            var spec = await _specRepository.Where(x => x.Id == specId)
                .Include(x => x.Product)
                .Include(x => x.SpecDetails)
                .Select(x => new SpecDetailsDto()
                {
                    Id = x.Id,
                    Name = x.Name,
                    ProductCode = x.Product.Code,
                    ProductName = x.Product.Name,
                    ProductId = x.Product.Id,
                    SpecDetails = _mapper.Map<List<SpecDetailDto>>(x.SpecDetails)
                }).FirstOrDefaultAsync();
            return spec;
        }
    }
}
