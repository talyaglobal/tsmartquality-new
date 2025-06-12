using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.Services
{
    public interface IProductToProductGroupTypeDefinitionService : IService<ProductToProductGroupTypeDefinition>
    {
        Task UpdateMappings(List<ProductToProductGroupTypeDefinition> productToProductGroupTypeDefinitions, int companyId, int userId);

    }
}
