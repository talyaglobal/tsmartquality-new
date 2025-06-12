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
    public class RawMaterialsController(IMapper mapper, IRawMaterialService rawMaterialPortalService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IRawMaterialService _rawMaterialPortalService = rawMaterialPortalService;

        [HttpGet]
        //[Authorize(Roles = "Root,RawMaterials.Get")]
        public async Task<IActionResult> All()
        {
            var rawMaterialPortals = await _rawMaterialPortalService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var rawMaterialPortalsDtos = _mapper.Map<List<RawMaterialDto>>(rawMaterialPortals.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<RawMaterialDto>>.Success(200, rawMaterialPortalsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<RawMaterial>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,RawMaterials.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var rawMaterialPortal = await _rawMaterialPortalService.GetByIdAsync(id);
            var rawMaterialPortalsDto = _mapper.Map<RawMaterialDto>(rawMaterialPortal);
            return CreateActionResult(CustomResponseDto<RawMaterialDto>.Success(200, rawMaterialPortalsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,RawMaterials.Add")]
        public async Task<IActionResult> Save(RawMaterialDto rawMaterialPortalDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<RawMaterial>(rawMaterialPortalDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var rawMaterialPortal = await _rawMaterialPortalService.AddAsync(processedEntity);

            var rawMaterialPortalsDto = _mapper.Map<RawMaterialDto>(rawMaterialPortal);
            return CreateActionResult(CustomResponseDto<RawMaterialDto>.Success(201, rawMaterialPortalsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,RawMaterials.Update")]
        public async Task<IActionResult> Update(RawMaterialUpdateDto rawMaterialPortalDto)
        {
            int userId = GetUserFromToken();
            var rawMaterialPortal = _mapper.Map<RawMaterial>(rawMaterialPortalDto);
            rawMaterialPortal.UpdatedBy = userId;

            await _rawMaterialPortalService.UpdateAsync(rawMaterialPortal);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,RawMaterials.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var rawMaterialPortal = await _rawMaterialPortalService.GetByIdAsync(id);

            rawMaterialPortal.UpdatedBy = userId;

            await _rawMaterialPortalService.ChangeStatusAsync(rawMaterialPortal);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
