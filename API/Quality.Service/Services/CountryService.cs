using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class CountryService(IGenericRepository<Country> repository, IUnitOfWork unitOfWork, IMapper mapper, ICountryRepository countryRepository, ICustomUpdateService<Country> customUpdateService) : Service<Country>(repository, unitOfWork), ICountryService
    {
        private readonly ICountryRepository _countryRepository = countryRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Country> _customUpdateService = customUpdateService;

        public override async Task<Country> AddAsync(Country country)
        {
            country.CreatedDate = DateTime.UtcNow;
            country.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(country);
        }

        public override async Task ChangeStatusAsync(Country country)
        {
            var current = await _countryRepository.GetByIdAsync(country.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = country.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Country country)
        {
            var current = await _countryRepository.GetByIdAsync(country.Id);

            Country last = _customUpdateService.Check(current, country);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = country.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
