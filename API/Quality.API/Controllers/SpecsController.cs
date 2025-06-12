using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs.CustomDto;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs.ProductPortalDefinitionUpdateDtos;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpecsController(IMapper mapper, ISpecService specService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ISpecService _specService = specService;

        [HttpGet]
        //[Authorize(Roles = "Root,Specs.Get")]
        public async Task<IActionResult> All()
        {
            var specs = await _specService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var specsDtos = _mapper.Map<List<SpecDto>>(specs.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<SpecDto>>.Success(200, specsDtos));
        }
        [HttpGet("[action]")]
        //[Authorize(Roles = "Root,Specs.Get")]
        public async Task<IActionResult> GetAllWithDetails()
        {
            var specs = await _specService.GetAllWithDetailsAsync();

            return CreateActionResult(CustomResponseDto<List<SpecAllDto>>.Success(200, specs));
        }
        [HttpGet("GetWithDetails/{specId}")]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetSpecByIdWithDetailsAsync(int specId)
        {
            var spec = await _specService.GetWithDetails(specId);
            return CreateActionResult(CustomResponseDto<SpecDetailsDto>.Success(200, spec));
        }
        [ServiceFilter(typeof(NotFoundFilter<Spec>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Specs.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var spec = await _specService.GetByIdAsync(id);
            var specsDto = _mapper.Map<SpecDto>(spec);
            return CreateActionResult(CustomResponseDto<SpecDto>.Success(200, specsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Specs.Add")]
        public async Task<IActionResult> Save(SpecDto specDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Spec>(specDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var spec = await _specService.AddAsync(processedEntity);

            var specsDto = _mapper.Map<SpecDto>(spec);
            return CreateActionResult(CustomResponseDto<SpecDto>.Success(201, specsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Specs.Update")]
        public async Task<IActionResult> Update(SpecUpdateDto specDto)
        {
            int userId = GetUserFromToken();
            var spec = _mapper.Map<Spec>(specDto);
            spec.UpdatedBy = userId;

            await _specService.UpdateAsync(spec);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Specs.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var spec = await _specService.GetByIdAsync(id);

            spec.UpdatedBy = userId;

            await _specService.ChangeStatusAsync(spec);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
