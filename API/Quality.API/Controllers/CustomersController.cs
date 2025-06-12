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
    public class CustomersController(IMapper mapper, ICustomerService customerService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ICustomerService _customerService = customerService;

        [HttpGet]
        //[Authorize(Roles = "Root,Customers.Get")]
        public async Task<IActionResult> All()
        {
            var customers = await _customerService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var customersDtos = _mapper.Map<List<CustomerDto>>(customers.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<CustomerDto>>.Success(200, customersDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<Customer>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Customers.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var customer = await _customerService.GetByIdAsync(id);
            var customersDto = _mapper.Map<CustomerDto>(customer);
            return CreateActionResult(CustomResponseDto<CustomerDto>.Success(200, customersDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Customers.Add")]
        public async Task<IActionResult> Save(CustomerDto customerDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Customer>(customerDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId; processedEntity.Status = true;
            processedEntity.UpdatedBy = userId;

            var customer = await _customerService.AddAsync(processedEntity);

            var customersDto = _mapper.Map<CustomerDto>(customer);
            return CreateActionResult(CustomResponseDto<CustomerDto>.Success(201, customersDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Customers.Update")]
        public async Task<IActionResult> Update(CustomerUpdateDto customerDto)
        {
            int userId = GetUserFromToken();
            var customer = _mapper.Map<Customer>(customerDto);
            customer.UpdatedBy = userId;

            await _customerService.UpdateAsync(customer);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Customers.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var customer = await _customerService.GetByIdAsync(id);

            customer.UpdatedBy = userId;

            await _customerService.ChangeStatusAsync(customer);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
