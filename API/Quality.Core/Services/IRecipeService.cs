using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs.CustomDto;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.Services
{
    public interface IRecipeService : IService<Recipe>
    {
        Task<List<RecipeAllDto>> GetAllWithDetailsAsync();
        Task<RecipeDetailsDto> GetWithDetails(int recipeId);
    }
}
