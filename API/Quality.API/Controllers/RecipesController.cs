using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs.CustomDto;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs.ProductPortalDefinitionUpdateDtos;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController(IMapper mapper, IRecipeService recipeService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IRecipeService _recipeService = recipeService;

        [HttpGet]
        //[Authorize(Roles = "Root,Recipes.Get")]
        public async Task<IActionResult> All()
        {
            var recipes = await _recipeService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var recipesDtos = _mapper.Map<List<RecipeDto>>(recipes.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<RecipeDto>>.Success(200, recipesDtos));
        }
        [HttpGet("[action]")]
        //[Authorize(Roles = "Root,Specs.Get")]
        public async Task<IActionResult> GetAllWithDetails()
        {
            var recipes = await _recipeService.GetAllWithDetailsAsync();

            return CreateActionResult(CustomResponseDto<List<RecipeAllDto>>.Success(200, recipes));
        }
        [HttpGet("GetWithDetails/{recipeId}")]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetSpecByIdWithDetailsAsync(int recipeId)
        {
            var recipe = await _recipeService.GetWithDetails(recipeId);
            return CreateActionResult(CustomResponseDto<RecipeDetailsDto>.Success(200, recipe));
        }
        [ServiceFilter(typeof(NotFoundFilter<Recipe>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Recipes.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var recipe = await _recipeService.GetByIdAsync(id);
            var recipesDto = _mapper.Map<RecipeDto>(recipe);
            return CreateActionResult(CustomResponseDto<RecipeDto>.Success(200, recipesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Recipes.Add")]
        public async Task<IActionResult> Save(RecipeDto recipeDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Recipe>(recipeDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var recipe = await _recipeService.AddAsync(processedEntity);

            var recipesDto = _mapper.Map<RecipeDto>(recipe);
            return CreateActionResult(CustomResponseDto<RecipeDto>.Success(201, recipesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Recipes.Update")]
        public async Task<IActionResult> Update(RecipeUpdateDto recipeDto)
        {
            int userId = GetUserFromToken();
            var recipe = _mapper.Map<Recipe>(recipeDto);
            recipe.UpdatedBy = userId;

            await _recipeService.UpdateAsync(recipe);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Recipes.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var recipe = await _recipeService.GetByIdAsync(id);

            recipe.UpdatedBy = userId;

            await _recipeService.ChangeStatusAsync(recipe);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
