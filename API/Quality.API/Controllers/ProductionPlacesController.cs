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
    public class ProductionPlacesController(IMapper mapper, IProductionPlaceService productionPlaceService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IProductionPlaceService _productionPlaceService = productionPlaceService;

        [HttpGet]
        //[Authorize(Roles = "Root,ProductionPlaces.Get")]
        public async Task<IActionResult> All()
        {
            var productionPlaces = await _productionPlaceService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var productionPlacesDtos = _mapper.Map<List<ProductionPlaceDto>>(productionPlaces.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductionPlaceDto>>.Success(200, productionPlacesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<ProductionPlace>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,ProductionPlaces.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var productionPlace = await _productionPlaceService.GetByIdAsync(id);
            var productionPlacesDto = _mapper.Map<ProductionPlaceDto>(productionPlace);
            return CreateActionResult(CustomResponseDto<ProductionPlaceDto>.Success(200, productionPlacesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,ProductionPlaces.Add")]
        public async Task<IActionResult> Save(ProductionPlaceDto productionPlaceDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<ProductionPlace>(productionPlaceDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var productionPlace = await _productionPlaceService.AddAsync(processedEntity);

            var productionPlacesDto = _mapper.Map<ProductionPlaceDto>(productionPlace);
            return CreateActionResult(CustomResponseDto<ProductionPlaceDto>.Success(201, productionPlacesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,ProductionPlaces.Update")]
        public async Task<IActionResult> Update(ProductionPlaceUpdateDto productionPlaceDto)
        {
            int userId = GetUserFromToken();
            var productionPlace = _mapper.Map<ProductionPlace>(productionPlaceDto);
            productionPlace.UpdatedBy = userId;

            await _productionPlaceService.UpdateAsync(productionPlace);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,ProductionPlaces.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var productionPlace = await _productionPlaceService.GetByIdAsync(id);

            productionPlace.UpdatedBy = userId;

            await _productionPlaceService.ChangeStatusAsync(productionPlace);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

    }
}
