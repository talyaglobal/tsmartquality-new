using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs;
using Quality.Core.Models.ProductPortalModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductToCustomersController(IMapper mapper, IProductToCustomerService productToCustomerService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IProductToCustomerService _productToCustomerService = productToCustomerService;

        [HttpGet]
        //[Authorize(Roles = "Root,ProductToCustomers.Get")]
        public async Task<IActionResult> All()
        {
            var productToCustomers = await _productToCustomerService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var productToCustomersDtos = _mapper.Map<List<ProductToCustomerDto>>(productToCustomers.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.CreatedDate).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductToCustomerDto>>.Success(200, productToCustomersDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<ProductToCustomer>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,ProductToCustomers.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var productToCustomer = await _productToCustomerService.GetByIdAsync(id);
            var productToCustomersDto = _mapper.Map<ProductToCustomerDto>(productToCustomer);
            return CreateActionResult(CustomResponseDto<ProductToCustomerDto>.Success(200, productToCustomersDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,ProductToCustomers.Add")]
        public async Task<IActionResult> Save(ProductToCustomerDto productToCustomerDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<ProductToCustomer>(productToCustomerDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var productToCustomer = await _productToCustomerService.AddAsync(processedEntity);

            var productToCustomersDto = _mapper.Map<ProductToCustomerDto>(productToCustomer);
            return CreateActionResult(CustomResponseDto<ProductToCustomerDto>.Success(201, productToCustomersDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,ProductToCustomers.Update")]
        public async Task<IActionResult> Update(ProductToCustomerUpdateDto productToCustomerDto)
        {
            int userId = GetUserFromToken();
            var productToCustomer = _mapper.Map<ProductToCustomer>(productToCustomerDto);
            productToCustomer.UpdatedBy = userId;

            await _productToCustomerService.UpdateAsync(productToCustomer);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,ProductToCustomers.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var productToCustomer = await _productToCustomerService.GetByIdAsync(id);

            productToCustomer.UpdatedBy = userId;

            await _productToCustomerService.ChangeStatusAsync(productToCustomer);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
