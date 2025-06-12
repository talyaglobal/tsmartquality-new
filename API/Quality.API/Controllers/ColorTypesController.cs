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
    public class ColorTypesController(IMapper mapper, IColorTypeService colorTypeService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IColorTypeService _colorTypeService = colorTypeService;

        [HttpGet]
        //[Authorize(Roles = "Root,ColorTypes.Get")]
        public async Task<IActionResult> All()
        {
            var colorTypes = await _colorTypeService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var colorTypesDtos = _mapper.Map<List<ColorTypeDto>>(colorTypes.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<ColorTypeDto>>.Success(200, colorTypesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<ColorType>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,ColorTypes.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var colorType = await _colorTypeService.GetByIdAsync(id);
            var colorTypesDto = _mapper.Map<ColorTypeDto>(colorType);
            return CreateActionResult(CustomResponseDto<ColorTypeDto>.Success(200, colorTypesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,ColorTypes.Add")]
        public async Task<IActionResult> Save(ColorTypeDto colorTypeDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<ColorType>(colorTypeDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var colorType = await _colorTypeService.AddAsync(processedEntity);

            var colorTypesDto = _mapper.Map<ColorTypeDto>(colorType);
            return CreateActionResult(CustomResponseDto<ColorTypeDto>.Success(201, colorTypesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,ColorTypes.Update")]
        public async Task<IActionResult> Update(ColorTypeUpdateDto colorTypeDto)
        {
            int userId = GetUserFromToken();
            var colorType = _mapper.Map<ColorType>(colorTypeDto);
            colorType.UpdatedBy = userId;

            await _colorTypeService.UpdateAsync(colorType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,ColorTypes.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var colorType = await _colorTypeService.GetByIdAsync(id);

            colorType.UpdatedBy = userId;

            await _colorTypeService.ChangeStatusAsync(colorType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
