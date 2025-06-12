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
    public class ProductGroupTypeDefinitionsController(IMapper mapper, IProductGroupTypeDefinitionService productGroupTypeDefinitionService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IProductGroupTypeDefinitionService _productGroupTypeDefinitionService = productGroupTypeDefinitionService;

        [HttpGet]
        //[Authorize(Roles = "Root,ProductGroupTypeDefinitions.Get")]
        public async Task<IActionResult> All()
        {
            var productGroupTypeDefinitions = await _productGroupTypeDefinitionService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var productGroupTypeDefinitionsDtos = _mapper.Map<List<ProductGroupTypeDefinitionDto>>(productGroupTypeDefinitions.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductGroupTypeDefinitionDto>>.Success(200, productGroupTypeDefinitionsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<ProductGroupTypeDefinition>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,ProductGroupTypeDefinitions.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var productGroupTypeDefinition = await _productGroupTypeDefinitionService.GetByIdAsync(id);
            var productGroupTypeDefinitionsDto = _mapper.Map<ProductGroupTypeDefinitionDto>(productGroupTypeDefinition);
            return CreateActionResult(CustomResponseDto<ProductGroupTypeDefinitionDto>.Success(200, productGroupTypeDefinitionsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,ProductGroupTypeDefinitions.Add")]
        public async Task<IActionResult> Save(ProductGroupTypeDefinitionDto productGroupTypeDefinitionDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<ProductGroupTypeDefinition>(productGroupTypeDefinitionDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var productGroupTypeDefinition = await _productGroupTypeDefinitionService.AddAsync(processedEntity);

            var productGroupTypeDefinitionsDto = _mapper.Map<ProductGroupTypeDefinitionDto>(productGroupTypeDefinition);
            return CreateActionResult(CustomResponseDto<ProductGroupTypeDefinitionDto>.Success(201, productGroupTypeDefinitionsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,ProductGroupTypeDefinitions.Update")]
        public async Task<IActionResult> Update(ProductGroupTypeDefinitionUpdateDto productGroupTypeDefinitionDto)
        {
            int userId = GetUserFromToken();
            var productGroupTypeDefinition = _mapper.Map<ProductGroupTypeDefinition>(productGroupTypeDefinitionDto);
            productGroupTypeDefinition.UpdatedBy = userId;

            await _productGroupTypeDefinitionService.UpdateAsync(productGroupTypeDefinition);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,ProductGroupTypeDefinitions.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var productGroupTypeDefinition = await _productGroupTypeDefinitionService.GetByIdAsync(id);

            productGroupTypeDefinition.UpdatedBy = userId;

            await _productGroupTypeDefinitionService.ChangeStatusAsync(productGroupTypeDefinition);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
