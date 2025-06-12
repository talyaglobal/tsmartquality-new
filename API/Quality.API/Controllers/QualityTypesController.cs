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
    public class QualityTypesController(IMapper mapper, IQualityTypeService qualityTypeService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IQualityTypeService _qualityTypeService = qualityTypeService;

        [HttpGet]
        //[Authorize(Roles = "Root,QualityTypes.Get")]
        public async Task<IActionResult> All()
        {
            var qualityTypes = await _qualityTypeService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var qualityTypesDtos = _mapper.Map<List<QualityTypeDto>>(qualityTypes.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<QualityTypeDto>>.Success(200, qualityTypesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<QualityType>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,QualityTypes.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var qualityType = await _qualityTypeService.GetByIdAsync(id);
            var qualityTypesDto = _mapper.Map<QualityTypeDto>(qualityType);
            return CreateActionResult(CustomResponseDto<QualityTypeDto>.Success(200, qualityTypesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,QualityTypes.Add")]
        public async Task<IActionResult> Save(QualityTypeDto qualityTypeDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<QualityType>(qualityTypeDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var qualityType = await _qualityTypeService.AddAsync(processedEntity);

            var qualityTypesDto = _mapper.Map<QualityTypeDto>(qualityType);
            return CreateActionResult(CustomResponseDto<QualityTypeDto>.Success(201, qualityTypesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,QualityTypes.Update")]
        public async Task<IActionResult> Update(QualityTypeUpdateDto qualityTypeDto)
        {
            int userId = GetUserFromToken();
            var qualityType = _mapper.Map<QualityType>(qualityTypeDto);
            qualityType.UpdatedBy = userId;

            await _qualityTypeService.UpdateAsync(qualityType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,QualityTypes.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var qualityType = await _qualityTypeService.GetByIdAsync(id);

            qualityType.UpdatedBy = userId;

            await _qualityTypeService.ChangeStatusAsync(qualityType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
