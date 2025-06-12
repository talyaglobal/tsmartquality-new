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
    public class NormService(IGenericRepository<Norm> repository, IUnitOfWork unitOfWork, IMapper mapper, INormRepository normRepository, ICustomUpdateService<Norm> customUpdateService) : Service<Norm>(repository, unitOfWork), INormService
    {
        private readonly INormRepository _normRepository = normRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Norm> _customUpdateService = customUpdateService;

        public override async Task<Norm> AddAsync(Norm norm)
        {
            norm.CreatedDate = DateTime.UtcNow;
            norm.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(norm);
        }

        public override async Task ChangeStatusAsync(Norm norm)
        {
            var current = await _normRepository.GetByIdAsync(norm.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = norm.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Norm norm)
        {
            var current = await _normRepository.GetByIdAsync(norm.Id);

            Norm last = _customUpdateService.Check(current, norm);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = norm.UpdatedBy;

            await base.UpdateAsync(last);
        }
        public async Task<List<NormAllDto>> GetAllWithDetailsAsync()
        {
            var specs = await _normRepository.GetAll().Include(x => x.Product)
                .Select(x => new NormAllDto() { Id = x.Id, Name = x.Name, ProductCode = x.Product.Code, ProductName = x.Product.Name })
                .ToListAsync();

            return specs;
        }
        public async Task<NormDetailsDto> GetWithDetails(int normId)
        {
            var norm = await _normRepository.Where(x => x.Id == normId)
                .Include(x => x.Product)
                .Include(x => x.NormDetails)
                .Select(x => new NormDetailsDto()
                {
                    Id = x.Id,
                    Name = x.Name,
                    ProductCode = x.Product.Code,
                    ProductName = x.Product.Name,
                    ProductId = x.Product.Id,
                    NormDetails = _mapper.Map<List<NormDetailDto>>(x.NormDetails)
                }).FirstOrDefaultAsync();
            return norm;
        }
    }
}
