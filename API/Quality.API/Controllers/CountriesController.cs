using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs.ProductPortalDefinitionUpdateDtos;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountriesController(IMapper mapper, ICountryService countryService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ICountryService _countryService = countryService;

        [HttpGet]
        //[Authorize(Roles = "Root,Countries.Get")]
        public async Task<IActionResult> All()
        {
            var countries = await _countryService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var countriesDtos = _mapper.Map<List<CountryDto>>(countries.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<CountryDto>>.Success(200, countriesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<Country>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Countries.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var country = await _countryService.GetByIdAsync(id);
            var countriesDto = _mapper.Map<CountryDto>(country);
            return CreateActionResult(CustomResponseDto<CountryDto>.Success(200, countriesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Countries.Add")]
        public async Task<IActionResult> Save(CountryDto countryDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Country>(countryDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var country = await _countryService.AddAsync(processedEntity);

            var countriesDto = _mapper.Map<CountryDto>(country);
            return CreateActionResult(CustomResponseDto<CountryDto>.Success(201, countriesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Countries.Update")]
        public async Task<IActionResult> Update(CountryUpdateDto countryDto)
        {
            int userId = GetUserFromToken();
            var country = _mapper.Map<Country>(countryDto);
            country.UpdatedBy = userId;

            await _countryService.UpdateAsync(country);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Countries.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var country = await _countryService.GetByIdAsync(id);

            country.UpdatedBy = userId;

            await _countryService.ChangeStatusAsync(country);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
