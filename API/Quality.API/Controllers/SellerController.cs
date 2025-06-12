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
    public class SellersController(IMapper mapper, ISellerService sellerService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ISellerService _sellerService = sellerService;

        [HttpGet]
        //[Authorize(Roles = "Root,Sellers.Get")]
        public async Task<IActionResult> All()
        {
            var sellers = await _sellerService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var sellersDtos = _mapper.Map<List<SellerDto>>(sellers.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<SellerDto>>.Success(200, sellersDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<Seller>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Sellers.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var seller = await _sellerService.GetByIdAsync(id);
            var sellersDto = _mapper.Map<SellerDto>(seller);
            return CreateActionResult(CustomResponseDto<SellerDto>.Success(200, sellersDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Sellers.Add")]
        public async Task<IActionResult> Save(SellerDto sellerDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Seller>(sellerDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var seller = await _sellerService.AddAsync(processedEntity);

            var sellersDto = _mapper.Map<SellerDto>(seller);
            return CreateActionResult(CustomResponseDto<SellerDto>.Success(201, sellersDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Sellers.Update")]
        public async Task<IActionResult> Update(SellerUpdateDto sellerDto)
        {
            int userId = GetUserFromToken();
            var seller = _mapper.Map<Seller>(sellerDto);
            seller.UpdatedBy = userId;

            await _sellerService.UpdateAsync(seller);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Sellers.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var seller = await _sellerService.GetByIdAsync(id);

            seller.UpdatedBy = userId;

            await _sellerService.ChangeStatusAsync(seller);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
