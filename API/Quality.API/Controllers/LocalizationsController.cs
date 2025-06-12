using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.BaseDTOs.DefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.BaseUpdateDTOs.DefinitionUpdateDTOs;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [OutputCache]
    [EnableRateLimiting("Basic")]
    public class LocalizationsController(IMapper mapper, ILocalizationService localizationService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ILocalizationService _localizationService = localizationService;

        [HttpGet]
        //[Authorize(Roles = "Root,Localizations.Get")]
        public async Task<IActionResult> All()
        {
            var localizations = await _localizationService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var localizationsDtos = _mapper.Map<List<LocalizationDto>>(localizations.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Keyword).ToList());
            return CreateActionResult(CustomResponseDto<List<LocalizationDto>>.Success(200, localizationsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<Localization>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Localizations.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var localization = await _localizationService.GetByIdAsync(id);
            var localizationsDto = _mapper.Map<LocalizationDto>(localization);
            return CreateActionResult(CustomResponseDto<LocalizationDto>.Success(200, localizationsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Localizations.Add")]
        public async Task<IActionResult> Save(LocalizationDto localizationDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Localization>(localizationDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var localization = await _localizationService.AddAsync(processedEntity);

            var localizationsDto = _mapper.Map<LocalizationDto>(localization);
            return CreateActionResult(CustomResponseDto<LocalizationDto>.Success(201, localizationsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Localizations.Update")]
        public async Task<IActionResult> Update(LocalizationUpdateDto localizationDto)
        {
            int userId = GetUserFromToken();
            var localization = _mapper.Map<Localization>(localizationDto);
            localization.UpdatedBy = userId;

            await _localizationService.UpdateAsync(localization);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Localizations.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var localization = await _localizationService.GetByIdAsync(id);

            localization.UpdatedBy = userId;

            await _localizationService.ChangeStatusAsync(localization);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
