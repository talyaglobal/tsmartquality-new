using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class ProductToProductGroupTypeDefinitionService(IGenericRepository<ProductToProductGroupTypeDefinition> repository, IUnitOfWork unitOfWork, IMapper mapper, IProductToProductGroupTypeDefinitionRepository productToProductGroupTypeDefinitionRepository, ICustomUpdateService<ProductToProductGroupTypeDefinition> customUpdateService) : Service<ProductToProductGroupTypeDefinition>(repository, unitOfWork), IProductToProductGroupTypeDefinitionService
    {
        private readonly IProductToProductGroupTypeDefinitionRepository _productToProductGroupTypeDefinitionRepository = productToProductGroupTypeDefinitionRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<ProductToProductGroupTypeDefinition> _customUpdateService = customUpdateService;

        public override async Task<ProductToProductGroupTypeDefinition> AddAsync(ProductToProductGroupTypeDefinition productToProductGroupTypeDefinition)
        {
            productToProductGroupTypeDefinition.CreatedDate = DateTime.UtcNow;
            productToProductGroupTypeDefinition.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(productToProductGroupTypeDefinition);
        }

        public override async Task ChangeStatusAsync(ProductToProductGroupTypeDefinition productToProductGroupTypeDefinition)
        {
            var current = await _productToProductGroupTypeDefinitionRepository.GetByIdAsync(productToProductGroupTypeDefinition.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = productToProductGroupTypeDefinition.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(ProductToProductGroupTypeDefinition productToProductGroupTypeDefinition)
        {
            var current = await _productToProductGroupTypeDefinitionRepository.GetByIdAsync(productToProductGroupTypeDefinition.Id);

            ProductToProductGroupTypeDefinition last = _customUpdateService.Check(current, productToProductGroupTypeDefinition);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = productToProductGroupTypeDefinition.UpdatedBy;

            await base.UpdateAsync(last);
        }

        public async Task UpdateMappings(List<ProductToProductGroupTypeDefinition> productToProductGroupTypeDefinitions, int companyId, int userId)
        {
            if (productToProductGroupTypeDefinitions == null)
                return;

            

            // Veritabanındaki mevcut kullanıcıları getiriyoruz
            var existingMappings =  _productToProductGroupTypeDefinitionRepository
                .Where(x => x.CompanyId == companyId && x.ProductId == productToProductGroupTypeDefinitions[0].ProductId)
                .ToList();

            var toActivate = new List<ProductToProductGroupTypeDefinition>();
            var toDeactivate = new List<ProductToProductGroupTypeDefinition>();
            var toAdd = new List<ProductToProductGroupTypeDefinition>();

            // Gelen verileri mevcut kullanıcılarla kontrol et
            foreach (var productToProductGroupTypeDefinition in productToProductGroupTypeDefinitions)
            {
                var existingMapping = existingMappings
                    .FirstOrDefault(x => x.ProductId == productToProductGroupTypeDefinition.ProductId && x.ProductGroupTypeId == productToProductGroupTypeDefinition.ProductGroupTypeId);

                // Mevcut bir kullanıcı varsa ve durumu aktif değilse durumu etkinleştir
                if (existingMapping != null)
                {
                    if (!existingMapping.Status)
                    {
                        existingMapping.Status = true;
                        existingMapping.UpdatedBy = userId;
                        existingMapping.CompanyId = companyId;
                        existingMapping.ProductGroupTypeDefinitionId = productToProductGroupTypeDefinition.ProductGroupTypeDefinitionId;
                        toActivate.Add(existingMapping);
                    }
                }
                // Mevcut kullanıcı yoksa yeni bir kayıt oluştur
                else if(productToProductGroupTypeDefinition.ProductGroupTypeId != null && productToProductGroupTypeDefinition.ProductGroupTypeDefinitionId != null && productToProductGroupTypeDefinition.ProductId != null && productToProductGroupTypeDefinition.ProductGroupTypeId != 0 && productToProductGroupTypeDefinition.ProductGroupTypeDefinitionId != 0 && productToProductGroupTypeDefinition.ProductId != 0)
                {
                    productToProductGroupTypeDefinition.CompanyId = companyId;
                    productToProductGroupTypeDefinition.CreatedBy = userId;
                    productToProductGroupTypeDefinition.UpdatedBy = userId;
                    productToProductGroupTypeDefinition.Status = true;
                    toAdd.Add(productToProductGroupTypeDefinition);
                }
            }

            // Mevcut veritabanı kayıtlarıyla gelen kayıtları karşılaştırarak eksik olanları devre dışı bırak
            foreach (var existingMapping in existingMappings)
            {
                var isInIncomingRequest = productToProductGroupTypeDefinitions
                    .Any(x => x.ProductId == existingMapping.ProductId && x.ProductGroupTypeId == existingMapping.ProductGroupTypeId);

                if (!isInIncomingRequest && existingMapping.Status)
                {
                    existingMapping.Status = false;
                    existingMapping.UpdatedBy = userId; // İsteğe göre farklı bir kullanıcı atanabilir
                    existingMapping.CompanyId = companyId;
                    toDeactivate.Add(existingMapping);
                }
            }

            // Toplu güncellemeler
            if (toActivate.Any())
            {
                await _productToProductGroupTypeDefinitionRepository.UpdateRangeAsync(toActivate);
            }
            if (toDeactivate.Any())
            {
                await _productToProductGroupTypeDefinitionRepository.UpdateRangeAsync(toDeactivate);
            }
            if (toAdd.Any())
            {
                await _productToProductGroupTypeDefinitionRepository.AddRangeAsync(toAdd);
            }
        }

    }
}
