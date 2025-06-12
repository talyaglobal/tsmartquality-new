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
    public class RecipeDetailsController(IMapper mapper, IRecipeDetailService recipeDetailService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IRecipeDetailService _recipeDetailService = recipeDetailService;

        [HttpGet]
        //[Authorize(Roles = "Root,RecipeDetails.Get")]
        public async Task<IActionResult> All()
        {
            var recipeDetails = await _recipeDetailService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var recipeDetailsDtos = _mapper.Map<List<RecipeDetailDto>>(recipeDetails.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.CreatedDate).ToList());
            return CreateActionResult(CustomResponseDto<List<RecipeDetailDto>>.Success(200, recipeDetailsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<RecipeDetail>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,RecipeDetails.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var recipeDetail = await _recipeDetailService.GetByIdAsync(id);
            var recipeDetailsDto = _mapper.Map<RecipeDetailDto>(recipeDetail);
            return CreateActionResult(CustomResponseDto<RecipeDetailDto>.Success(200, recipeDetailsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,RecipeDetails.Add")]
        public async Task<IActionResult> Save(RecipeDetailDto recipeDetailDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<RecipeDetail>(recipeDetailDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var recipeDetail = await _recipeDetailService.AddAsync(processedEntity);

            var recipeDetailsDto = _mapper.Map<RecipeDetailDto>(recipeDetail);
            return CreateActionResult(CustomResponseDto<RecipeDetailDto>.Success(201, recipeDetailsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,RecipeDetails.Update")]
        public async Task<IActionResult> Update(RecipeDetailUpdateDto recipeDetailDto)
        {
            int userId = GetUserFromToken();
            var recipeDetail = _mapper.Map<RecipeDetail>(recipeDetailDto);
            recipeDetail.UpdatedBy = userId;

            await _recipeDetailService.UpdateAsync(recipeDetail);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,RecipeDetails.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var recipeDetail = await _recipeDetailService.GetByIdAsync(id);

            recipeDetail.UpdatedBy = userId;

            await _recipeDetailService.ChangeStatusAsync(recipeDetail);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
