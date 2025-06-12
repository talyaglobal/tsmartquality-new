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
    public class NormDetailsController(IMapper mapper, INormDetailService normDetailService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly INormDetailService _normDetailService = normDetailService;

        [HttpGet]
        //[Authorize(Roles = "Root,NormDetails.Get")]
        public async Task<IActionResult> All()
        {
            var normDetails = await _normDetailService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var normDetailsDtos = _mapper.Map<List<NormDetailDto>>(normDetails.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Title).ToList());
            return CreateActionResult(CustomResponseDto<List<NormDetailDto>>.Success(200, normDetailsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<NormDetail>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,NormDetails.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var normDetail = await _normDetailService.GetByIdAsync(id);
            var normDetailsDto = _mapper.Map<NormDetailDto>(normDetail);
            return CreateActionResult(CustomResponseDto<NormDetailDto>.Success(200, normDetailsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,NormDetails.Add")]
        public async Task<IActionResult> Save(NormDetailDto normDetailDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<NormDetail>(normDetailDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var normDetail = await _normDetailService.AddAsync(processedEntity);

            var normDetailsDto = _mapper.Map<NormDetailDto>(normDetail);
            return CreateActionResult(CustomResponseDto<NormDetailDto>.Success(201, normDetailsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,NormDetails.Update")]
        public async Task<IActionResult> Update(NormDetailUpdateDto normDetailDto)
        {
            int userId = GetUserFromToken();
            var normDetail = _mapper.Map<NormDetail>(normDetailDto);
            normDetail.UpdatedBy = userId;

            await _normDetailService.UpdateAsync(normDetail);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,NormDetails.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var normDetail = await _normDetailService.GetByIdAsync(id);

            normDetail.UpdatedBy = userId;

            await _normDetailService.ChangeStatusAsync(normDetail);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
