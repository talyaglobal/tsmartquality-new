using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs.ProductPortalDefinitionUpdateDtos;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
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
    public class BrandsController(IMapper mapper, IBrandService brandService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IBrandService _brandService = brandService;

        [HttpGet]
        //[Authorize(Roles = "Root,Brands.Get")]
        public async Task<IActionResult> All()
        {
            var brands = await _brandService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var brandsDtos = _mapper.Map<List<BrandDto>>(brands.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<BrandDto>>.Success(200, brandsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<Brand>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Brands.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var brand = await _brandService.GetByIdAsync(id);
            var brandsDto = _mapper.Map<BrandDto>(brand);
            return CreateActionResult(CustomResponseDto<BrandDto>.Success(200, brandsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Brands.Add")]
        public async Task<IActionResult> Save(BrandDto brandDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Brand>(brandDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var brand = await _brandService.AddAsync(processedEntity);

            var brandsDto = _mapper.Map<BrandDto>(brand);
            return CreateActionResult(CustomResponseDto<BrandDto>.Success(201, brandsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Brands.Update")]
        public async Task<IActionResult> Update(BrandUpdateDto brandDto)
        {
            int userId = GetUserFromToken();
            var brand = _mapper.Map<Brand>(brandDto);
            brand.UpdatedBy = userId;

            await _brandService.UpdateAsync(brand);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Brands.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var brand = await _brandService.GetByIdAsync(id);

            brand.UpdatedBy = userId;

            await _brandService.ChangeStatusAsync(brand);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
