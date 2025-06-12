using AutoMapper;
using Quality.API.Filters;
using Quality.Business;
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
    public class WarehousesController(IMapper mapper, IWarehouseService warehouseService/*, Lazy<INetsisService> netsisService*/) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IWarehouseService _warehouseService = warehouseService;
        //private readonly Lazy<INetsisService> _netsisService = netsisService;


        [HttpGet]
        //[Authorize(Roles = "Root,Warehouses.Get")]
        public async Task<IActionResult> All()
        {
            var warehouses = await _warehouseService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var warehousesDtos = _mapper.Map<List<WarehouseDto>>(warehouses.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<WarehouseDto>>.Success(200, warehousesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<Warehouse>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Warehouses.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var warehouse = await _warehouseService.GetByIdAsync(id);
            var warehousesDto = _mapper.Map<WarehouseDto>(warehouse);
            return CreateActionResult(CustomResponseDto<WarehouseDto>.Success(200, warehousesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Warehouses.Add")]
        public async Task<IActionResult> Save(WarehouseDto warehouseDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Warehouse>(warehouseDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var warehouse = await _warehouseService.AddAsync(processedEntity);

            var warehousesDto = _mapper.Map<WarehouseDto>(warehouse);
            return CreateActionResult(CustomResponseDto<WarehouseDto>.Success(201, warehousesDto));
        }

        //[HttpGet("Depolar")]
        //[Authorize(Roles = "Root,Products.Get")]
        //public async Task<IActionResult> Depolar()
        //{
        //    var products = _netsisService.Value.GetCode1sFromERP();
        //    foreach (var product in products)
        //    {
        //       await _warehouseService.AddAsync(product);
        //    }
        //    var productsDtos = _mapper.Map<List<WarehouseDto>>(products.Where(x => x.Status == true).OrderByDescending(x => x.CreatedDate).ToList());
        //    return CreateActionResult(CustomResponseDto<List<WarehouseDto>>.Success(200, productsDtos));
        //}

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Warehouses.Update")]
        public async Task<IActionResult> Update(WarehouseUpdateDto warehouseDto)
        {
            int userId = GetUserFromToken();
            var warehouse = _mapper.Map<Warehouse>(warehouseDto);
            warehouse.UpdatedBy = userId;

            await _warehouseService.UpdateAsync(warehouse);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Warehouses.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var warehouse = await _warehouseService.GetByIdAsync(id);

            warehouse.UpdatedBy = userId;

            await _warehouseService.ChangeStatusAsync(warehouse);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

    }
}
