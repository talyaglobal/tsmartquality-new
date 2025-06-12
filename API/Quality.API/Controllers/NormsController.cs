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
    public class NormsController(IMapper mapper, INormService normService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly INormService _normService = normService;

        [HttpGet]
        //[Authorize(Roles = "Root,Norms.Get")]
        public async Task<IActionResult> All()
        {
            var norms = await _normService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var normsDtos = _mapper.Map<List<NormDto>>(norms.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<NormDto>>.Success(200, normsDtos));
        }
        [HttpGet("[action]")]
        //[Authorize(Roles = "Root,Specs.Get")]
        public async Task<IActionResult> GetAllWithDetails()
        {
            var norms = await _normService.GetAllWithDetailsAsync();

            return CreateActionResult(CustomResponseDto<List<NormAllDto>>.Success(200, norms));
        }
        [HttpGet("GetWithDetails/{normId}")]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetSpecByIdWithDetailsAsync(int normId)
        {
            var norm = await _normService.GetWithDetails(normId);
            return CreateActionResult(CustomResponseDto<NormDetailsDto>.Success(200, norm));
        }
        [ServiceFilter(typeof(NotFoundFilter<Norm>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Norms.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var norm = await _normService.GetByIdAsync(id);
            var normsDto = _mapper.Map<NormDto>(norm);
            return CreateActionResult(CustomResponseDto<NormDto>.Success(200, normsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Norms.Add")]
        public async Task<IActionResult> Save(NormDto normDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Norm>(normDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var norm = await _normService.AddAsync(processedEntity);

            var normsDto = _mapper.Map<NormDto>(norm);
            return CreateActionResult(CustomResponseDto<NormDto>.Success(201, normsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Norms.Update")]
        public async Task<IActionResult> Update(NormUpdateDto normDto)
        {
            int userId = GetUserFromToken();
            var norm = _mapper.Map<Norm>(normDto);
            norm.UpdatedBy = userId;

            await _normService.UpdateAsync(norm);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Norms.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var norm = await _normService.GetByIdAsync(id);

            norm.UpdatedBy = userId;

            await _normService.ChangeStatusAsync(norm);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
