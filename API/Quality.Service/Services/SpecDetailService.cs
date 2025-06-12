using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class SpecDetailService(IGenericRepository<SpecDetail> repository, IUnitOfWork unitOfWork, IMapper mapper, ISpecDetailRepository specDetailRepository, ICustomUpdateService<SpecDetail> customUpdateService) : Service<SpecDetail>(repository, unitOfWork), ISpecDetailService
    {
        private readonly ISpecDetailRepository _specDetailRepository = specDetailRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<SpecDetail> _customUpdateService = customUpdateService;

        public override async Task<SpecDetail> AddAsync(SpecDetail specDetail)
        {
            specDetail.CreatedDate = DateTime.UtcNow;
            specDetail.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(specDetail);
        }

        public override async Task ChangeStatusAsync(SpecDetail specDetail)
        {
            var current = await _specDetailRepository.GetByIdAsync(specDetail.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = specDetail.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(SpecDetail specDetail)
        {
            var current = await _specDetailRepository.GetByIdAsync(specDetail.Id);

            SpecDetail last = _customUpdateService.Check(current, specDetail);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = specDetail.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
