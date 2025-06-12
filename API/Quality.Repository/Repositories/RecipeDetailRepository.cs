using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class RecipeDetailRepository(AppDbContext context) : GenericRepository<RecipeDetail>(context), IRecipeDetailRepository
    {
    }
}
