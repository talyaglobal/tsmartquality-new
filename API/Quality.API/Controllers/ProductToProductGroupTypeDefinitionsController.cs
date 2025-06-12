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
    public class ProductToProductGroupTypeDefinitionsController(IMapper mapper, IProductToProductGroupTypeDefinitionService productToProductGroupTypeDefinitionService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IProductToProductGroupTypeDefinitionService _productToProductGroupTypeDefinitionService = productToProductGroupTypeDefinitionService;

        [HttpGet]
        //[Authorize(Roles = "Root,ProductToProductGroupTypeDefinitions.Get")]
        public async Task<IActionResult> All()
        {
            var productToProductGroupTypeDefinitions = await _productToProductGroupTypeDefinitionService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var productToProductGroupTypeDefinitionsDtos = _mapper.Map<List<ProductToProductGroupTypeDefinitionDto>>(productToProductGroupTypeDefinitions.Where(x => x.Status == true && x.CompanyId == companyId).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductToProductGroupTypeDefinitionDto>>.Success(200, productToProductGroupTypeDefinitionsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<ProductToProductGroupTypeDefinition>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,ProductToProductGroupTypeDefinitions.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var productToProductGroupTypeDefinition = await _productToProductGroupTypeDefinitionService.GetByIdAsync(id);
            var productToProductGroupTypeDefinitionsDto = _mapper.Map<ProductToProductGroupTypeDefinitionDto>(productToProductGroupTypeDefinition);
            return CreateActionResult(CustomResponseDto<ProductToProductGroupTypeDefinitionDto>.Success(200, productToProductGroupTypeDefinitionsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,ProductToProductGroupTypeDefinitions.Add")]
        public async Task<IActionResult> Save(ProductToProductGroupTypeDefinitionDto productToProductGroupTypeDefinitionDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<ProductToProductGroupTypeDefinition>(productToProductGroupTypeDefinitionDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var productToProductGroupTypeDefinition = await _productToProductGroupTypeDefinitionService.AddAsync(processedEntity);

            var productToProductGroupTypeDefinitionsDto = _mapper.Map<ProductToProductGroupTypeDefinitionDto>(productToProductGroupTypeDefinition);
            return CreateActionResult(CustomResponseDto<ProductToProductGroupTypeDefinitionDto>.Success(201, productToProductGroupTypeDefinitionsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,ProductToProductGroupTypeDefinitions.Update")]
        public async Task<IActionResult> Update(ProductToProductGroupTypeDefinitionUpdateDto productToProductGroupTypeDefinitionDto)
        {
            int userId = GetUserFromToken();
            var productToProductGroupTypeDefinition = _mapper.Map<ProductToProductGroupTypeDefinition>(productToProductGroupTypeDefinitionDto);
            productToProductGroupTypeDefinition.UpdatedBy = userId;

            await _productToProductGroupTypeDefinitionService.UpdateAsync(productToProductGroupTypeDefinition);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,ProductToProductGroupTypeDefinitions.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var productToProductGroupTypeDefinition = await _productToProductGroupTypeDefinitionService.GetByIdAsync(id);

            productToProductGroupTypeDefinition.UpdatedBy = userId;

            await _productToProductGroupTypeDefinitionService.ChangeStatusAsync(productToProductGroupTypeDefinition);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
