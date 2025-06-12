using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class RecipeRepository(AppDbContext context) : GenericRepository<Recipe>(context), IRecipeRepository
    {
    }
}
