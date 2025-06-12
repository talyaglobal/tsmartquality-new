using Quality.Core.Models.ProductModels;
using Quality.Core.Models.ProductPortalModels;

namespace Quality.Core.Services
{
    public interface IProductHistoryService : IService<ProductHistory>
    {
        Task AddByProduct(Product oldEntity, Product newEntity);
        Task<ProductHistory> GetERPNotUpdatedData();
        Task<List<ProductHistory>> GetProductHistoriesWithDetailsAsync(int limit, int offset);

    }
}
