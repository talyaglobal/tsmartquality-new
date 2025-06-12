using AutoMapper;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs.CustomDto;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;
using Microsoft.EntityFrameworkCore;

namespace Quality.Service.Services
{
    public class RecipeService(IGenericRepository<Recipe> repository, IUnitOfWork unitOfWork, IMapper mapper, IRecipeRepository recipeRepository, ICustomUpdateService<Recipe> customUpdateService) : Service<Recipe>(repository, unitOfWork), IRecipeService
    {
        private readonly IRecipeRepository _recipeRepository = recipeRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Recipe> _customUpdateService = customUpdateService;

        public override async Task<Recipe> AddAsync(Recipe recipe)
        {
            recipe.CreatedDate = DateTime.UtcNow;
            recipe.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(recipe);
        }

        public override async Task ChangeStatusAsync(Recipe recipe)
        {
            var current = await _recipeRepository.GetByIdAsync(recipe.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = recipe.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Recipe recipe)
        {
            var current = await _recipeRepository.GetByIdAsync(recipe.Id);

            Recipe last = _customUpdateService.Check(current, recipe);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = recipe.UpdatedBy;

            await base.UpdateAsync(last);
        }
        public async Task<List<RecipeAllDto>> GetAllWithDetailsAsync()
        {
            var specs = await _recipeRepository.GetAll()
                .Include(x => x.Product)
                .Include(x => x.SemiProduct)
                .Select(x => new RecipeAllDto() { Id = x.Id, Name = x.Name, ProductCode = x.Product.Code, ProductName = x.Product.Name, SemiProductName = x.SemiProduct.Name })
                .ToListAsync();

            return specs;
        }
        public async Task<RecipeDetailsDto> GetWithDetails(int recipeId)
        {
            var recipe = await _recipeRepository.Where(x => x.Id == recipeId)
                .Include(x => x.Product)
                .Include(x => x.SemiProduct)
                .Include(x => x.RecipeDetails)
                .Select(x => new RecipeDetailsDto()
                {
                    Id = x.Id,
                    Name = x.Name,
                    ProductCode = x.Product.Code,
                    ProductName = x.Product.Name,
                    ProductId = x.Product.Id,
                    RecipeDetails = _mapper.Map<List<RecipeDetailDto>>(x.RecipeDetails)
                }).FirstOrDefaultAsync();
            return recipe;
        }
    }
}
