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
    public class SalesBasedsController(IMapper mapper, ISalesBasedService salesBasedService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ISalesBasedService _salesBasedService = salesBasedService;

        [HttpGet]
        //[Authorize(Roles = "Root,SalesBaseds.Get")]
        public async Task<IActionResult> All()
        {
            var salesBaseds = await _salesBasedService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var salesBasedsDtos = _mapper.Map<List<SalesBasedDto>>(salesBaseds.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<SalesBasedDto>>.Success(200, salesBasedsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<SalesBased>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,SalesBaseds.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var salesBased = await _salesBasedService.GetByIdAsync(id);
            var salesBasedsDto = _mapper.Map<SalesBasedDto>(salesBased);
            return CreateActionResult(CustomResponseDto<SalesBasedDto>.Success(200, salesBasedsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,SalesBaseds.Add")]
        public async Task<IActionResult> Save(SalesBasedDto salesBasedDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<SalesBased>(salesBasedDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var salesBased = await _salesBasedService.AddAsync(processedEntity);

            var salesBasedsDto = _mapper.Map<SalesBasedDto>(salesBased);
            return CreateActionResult(CustomResponseDto<SalesBasedDto>.Success(201, salesBasedsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,SalesBaseds.Update")]
        public async Task<IActionResult> Update(SalesBasedUpdateDto salesBasedDto)
        {
            int userId = GetUserFromToken();
            var salesBased = _mapper.Map<SalesBased>(salesBasedDto);
            salesBased.UpdatedBy = userId;

            await _salesBasedService.UpdateAsync(salesBased);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,SalesBaseds.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var salesBased = await _salesBasedService.GetByIdAsync(id);

            salesBased.UpdatedBy = userId;

            await _salesBasedService.ChangeStatusAsync(salesBased);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
