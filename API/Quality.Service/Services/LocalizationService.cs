using AutoMapper;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class LocalizationService(IGenericRepository<Localization> repository, IUnitOfWork unitOfWork, IMapper mapper, ILocalizationRepository localizationRepository, ICustomUpdateService<Localization> customUpdateService) : Service<Localization>(repository, unitOfWork), ILocalizationService
    {
        private readonly ILocalizationRepository _localizationRepository = localizationRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Localization> _customUpdateService = customUpdateService;

        public override async Task<Localization> AddAsync(Localization localization)
        {
            localization.CreatedDate = DateTime.UtcNow;
            localization.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(localization);
        }

        public override async Task ChangeStatusAsync(Localization localization)
        {
            var current = await _localizationRepository.GetByIdAsync(localization.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = localization.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Localization localization)
        {
            var current = await _localizationRepository.GetByIdAsync(localization.Id);

            Localization last = _customUpdateService.Check(current, localization);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = localization.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
