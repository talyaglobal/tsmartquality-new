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
    public class ERPSettingsController(IMapper mapper, IERPSettingService erpSettingService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IERPSettingService _erpSettingService = erpSettingService;

        [HttpGet]
        //[Authorize(Roles = "Root,ERPSettings.Get")]
        public async Task<IActionResult> All()
        {
            var erpSettings = await _erpSettingService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var erpSettingsDtos = _mapper.Map<List<ERPSettingDto>>(erpSettings.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.CreatedDate).ToList());
            return CreateActionResult(CustomResponseDto<List<ERPSettingDto>>.Success(200, erpSettingsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<ERPSetting>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,ERPSettings.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var erpSetting = await _erpSettingService.GetByIdAsync(id);
            var erpSettingsDto = _mapper.Map<ERPSettingDto>(erpSetting);
            return CreateActionResult(CustomResponseDto<ERPSettingDto>.Success(200, erpSettingsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,ERPSettings.Add")]
        public async Task<IActionResult> Save(ERPSettingDto erpSettingDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<ERPSetting>(erpSettingDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var erpSetting = await _erpSettingService.AddAsync(processedEntity);

            var erpSettingsDto = _mapper.Map<ERPSettingDto>(erpSetting);
            return CreateActionResult(CustomResponseDto<ERPSettingDto>.Success(201, erpSettingsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,ERPSettings.Update")]
        public async Task<IActionResult> Update(ERPSettingUpdateDto erpSettingDto)
        {
            int userId = GetUserFromToken();
            var erpSetting = _mapper.Map<ERPSetting>(erpSettingDto);
            erpSetting.UpdatedBy = userId;

            await _erpSettingService.UpdateAsync(erpSetting);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,ERPSettings.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var erpSetting = await _erpSettingService.GetByIdAsync(id);

            erpSetting.UpdatedBy = userId;

            await _erpSettingService.ChangeStatusAsync(erpSetting);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
