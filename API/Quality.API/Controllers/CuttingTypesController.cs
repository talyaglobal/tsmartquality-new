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
    public class CuttingTypesController(IMapper mapper, ICuttingTypeService cuttingTypeService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ICuttingTypeService _cuttingTypeService = cuttingTypeService;

        [HttpGet]
        //[Authorize(Roles = "Root,CuttingTypes.Get")]
        public async Task<IActionResult> All()
        {
            var cuttingTypes = await _cuttingTypeService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var cuttingTypesDtos = _mapper.Map<List<CuttingTypeDto>>(cuttingTypes.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<CuttingTypeDto>>.Success(200, cuttingTypesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<CuttingType>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,CuttingTypes.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var cuttingType = await _cuttingTypeService.GetByIdAsync(id);
            var cuttingTypesDto = _mapper.Map<CuttingTypeDto>(cuttingType);
            return CreateActionResult(CustomResponseDto<CuttingTypeDto>.Success(200, cuttingTypesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,CuttingTypes.Add")]
        public async Task<IActionResult> Save(CuttingTypeDto cuttingTypeDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<CuttingType>(cuttingTypeDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var cuttingType = await _cuttingTypeService.AddAsync(processedEntity);

            var cuttingTypesDto = _mapper.Map<CuttingTypeDto>(cuttingType);
            return CreateActionResult(CustomResponseDto<CuttingTypeDto>.Success(201, cuttingTypesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,CuttingTypes.Update")]
        public async Task<IActionResult> Update(CuttingTypeUpdateDto cuttingTypeDto)
        {
            int userId = GetUserFromToken();
            var cuttingType = _mapper.Map<CuttingType>(cuttingTypeDto);
            cuttingType.UpdatedBy = userId;

            await _cuttingTypeService.UpdateAsync(cuttingType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,CuttingTypes.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var cuttingType = await _cuttingTypeService.GetByIdAsync(id);

            cuttingType.UpdatedBy = userId;

            await _cuttingTypeService.ChangeStatusAsync(cuttingType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
