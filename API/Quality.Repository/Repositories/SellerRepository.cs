using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class SellerRepository(AppDbContext context) : GenericRepository<Seller>(context), ISellerRepository
    {
    }
}
