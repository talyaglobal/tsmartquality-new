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
    public class PackagingsController(IMapper mapper, IPackagingService packagingService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IPackagingService _packagingService = packagingService;

        [HttpGet]
        //[Authorize(Roles = "Root,Packagings.Get")]
        public async Task<IActionResult> All()
        {
            var packagings = await _packagingService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var packagingsDtos = _mapper.Map<List<PackagingDto>>(packagings.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<PackagingDto>>.Success(200, packagingsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<Packaging>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Packagings.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var packaging = await _packagingService.GetByIdAsync(id);
            var packagingsDto = _mapper.Map<PackagingDto>(packaging);
            return CreateActionResult(CustomResponseDto<PackagingDto>.Success(200, packagingsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Packagings.Add")]
        public async Task<IActionResult> Save(PackagingDto packagingDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Packaging>(packagingDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var packaging = await _packagingService.AddAsync(processedEntity);

            var packagingsDto = _mapper.Map<PackagingDto>(packaging);
            return CreateActionResult(CustomResponseDto<PackagingDto>.Success(201, packagingsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Packagings.Update")]
        public async Task<IActionResult> Update(PackagingUpdateDto packagingDto)
        {
            int userId = GetUserFromToken();
            var packaging = _mapper.Map<Packaging>(packagingDto);
            packaging.UpdatedBy = userId;

            await _packagingService.UpdateAsync(packaging);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Packagings.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var packaging = await _packagingService.GetByIdAsync(id);

            packaging.UpdatedBy = userId;

            await _packagingService.ChangeStatusAsync(packaging);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

    }
}
