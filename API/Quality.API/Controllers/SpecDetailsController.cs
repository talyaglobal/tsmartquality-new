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
    public class SpecDetailsController(IMapper mapper, ISpecDetailService specDetailService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ISpecDetailService _specDetailService = specDetailService;

        [HttpGet]
        //[Authorize(Roles = "Root,SpecDetails.Get")]
        public async Task<IActionResult> All()
        {
            var specDetails = await _specDetailService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var specDetailsDtos = _mapper.Map<List<SpecDetailDto>>(specDetails.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Title).ToList());
            return CreateActionResult(CustomResponseDto<List<SpecDetailDto>>.Success(200, specDetailsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<SpecDetail>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,SpecDetails.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var specDetail = await _specDetailService.GetByIdAsync(id);
            var specDetailsDto = _mapper.Map<SpecDetailDto>(specDetail);
            return CreateActionResult(CustomResponseDto<SpecDetailDto>.Success(200, specDetailsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,SpecDetails.Add")]
        public async Task<IActionResult> Save(SpecDetailDto specDetailDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<SpecDetail>(specDetailDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var specDetail = await _specDetailService.AddAsync(processedEntity);

            var specDetailsDto = _mapper.Map<SpecDetailDto>(specDetail);
            return CreateActionResult(CustomResponseDto<SpecDetailDto>.Success(201, specDetailsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,SpecDetails.Update")]
        public async Task<IActionResult> Update(SpecDetailUpdateDto specDetailDto)
        {
            int userId = GetUserFromToken();
            var specDetail = _mapper.Map<SpecDetail>(specDetailDto);
            specDetail.UpdatedBy = userId;

            await _specDetailService.UpdateAsync(specDetail);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,SpecDetails.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var specDetail = await _specDetailService.GetByIdAsync(id);

            specDetail.UpdatedBy = userId;

            await _specDetailService.ChangeStatusAsync(specDetail);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
