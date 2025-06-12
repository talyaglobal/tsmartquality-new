using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class NormDetailService(IGenericRepository<NormDetail> repository, IUnitOfWork unitOfWork, IMapper mapper, INormDetailRepository normDetailRepository, ICustomUpdateService<NormDetail> customUpdateService) : Service<NormDetail>(repository, unitOfWork), INormDetailService
    {
        private readonly INormDetailRepository _normDetailRepository = normDetailRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<NormDetail> _customUpdateService = customUpdateService;

        public override async Task<NormDetail> AddAsync(NormDetail normDetail)
        {
            normDetail.CreatedDate = DateTime.UtcNow;
            normDetail.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(normDetail);
        }

        public override async Task ChangeStatusAsync(NormDetail normDetail)
        {
            var current = await _normDetailRepository.GetByIdAsync(normDetail.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = normDetail.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(NormDetail normDetail)
        {
            var current = await _normDetailRepository.GetByIdAsync(normDetail.Id);

            NormDetail last = _customUpdateService.Check(current, normDetail);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = normDetail.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
