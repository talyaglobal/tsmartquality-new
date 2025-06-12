using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.BaseDTOs.DefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.BaseUpdateDTOs.DefinitionUpdateDTOs;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhotoTypesController(IMapper mapper, IPhotoTypeService photoTypeService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IPhotoTypeService _photoTypeService = photoTypeService;

        [HttpGet]
        //[Authorize(Roles = "Root,PhotoTypes.Get")]
        public async Task<IActionResult> All()
        {
            var photoTypes = await _photoTypeService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var photoTypesDtos = _mapper.Map<List<PhotoTypeDto>>(photoTypes.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<PhotoTypeDto>>.Success(200, photoTypesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<PhotoType>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,PhotoTypes.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var photoType = await _photoTypeService.GetByIdAsync(id);
            var photoTypesDto = _mapper.Map<PhotoTypeDto>(photoType);
            return CreateActionResult(CustomResponseDto<PhotoTypeDto>.Success(200, photoTypesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,PhotoTypes.Add")]
        public async Task<IActionResult> Save(PhotoTypeDto photoTypeDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<PhotoType>(photoTypeDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var photoType = await _photoTypeService.AddAsync(processedEntity);

            var photoTypesDto = _mapper.Map<PhotoTypeDto>(photoType);
            return CreateActionResult(CustomResponseDto<PhotoTypeDto>.Success(201, photoTypesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,PhotoTypes.Update")]
        public async Task<IActionResult> Update(PhotoTypeUpdateDto photoTypeDto)
        {
            int userId = GetUserFromToken();
            var photoType = _mapper.Map<PhotoType>(photoTypeDto);
            photoType.UpdatedBy = userId;

            await _photoTypeService.UpdateAsync(photoType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,PhotoTypes.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var photoType = await _photoTypeService.GetByIdAsync(id);

            photoType.UpdatedBy = userId;

            await _photoTypeService.ChangeStatusAsync(photoType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
