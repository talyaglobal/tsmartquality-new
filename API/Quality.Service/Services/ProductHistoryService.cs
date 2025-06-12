using AutoMapper;
using Quality.Core.Models.ProductModels;
using Quality.Core.Models.ProductPortalModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;
using Microsoft.EntityFrameworkCore;

namespace Quality.Service.Services
{
    public class ProductHistoryService(IGenericRepository<ProductHistory> repository, IUnitOfWork unitOfWork, IMapper mapper, IProductHistoryRepository productHistoryRepository, IERPSettingRepository erpSettingRepository) : Service<ProductHistory>(repository, unitOfWork), IProductHistoryService
    {
        private readonly IProductHistoryRepository _productHistoryRepository = productHistoryRepository;
        private readonly IMapper _mapper = mapper;
        private readonly IERPSettingRepository _erpSettingRepository = erpSettingRepository;


        public override async Task<ProductHistory> AddAsync(ProductHistory productHistory)
        {
            productHistory.CreatedDate = DateTime.UtcNow;
            productHistory.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(productHistory);
        }

        public override async Task UpdateAsync(ProductHistory productHistory)
        {
            await base.UpdateAsync(productHistory);
        }

        public async Task<ProductHistory> GetERPNotUpdatedData()
        {
            var erpSetting = _erpSettingRepository.Where(x => x.Status).Take(1).OrderBy(x => x.Id).FirstOrDefault();
            if (erpSetting != null)
            {
                var product = await _productHistoryRepository.Where(x => (x.IsERP1Updated != null && erpSetting.Company1Db != null && erpSetting.Company1Db != "" && x.Code_New != null && x.Code_New != "") || (x.IsERP2Updated != null && erpSetting.Company2Db != null && erpSetting.Company2Db != "" && x.Code2_New != null && x.Code2_New != "") || (x.IsERP3Updated != null && erpSetting.Company3Db != null && erpSetting.Company3Db != "" && x.Code3_New != null && x.Code3_New != "")).OrderBy(x => x.CreatedDate).FirstOrDefaultAsync();

                return product;
            }
            return null;
        }

        public async Task AddByProduct(Product oldEntity, Product newEntity)
        {
            ProductHistory productHistory = new();

            productHistory.ProductId = oldEntity.Id;

            
            productHistory.SellerId_Old = oldEntity.SellerId;
            productHistory.SellerId_New = newEntity.SellerId != null ? newEntity.SellerId : oldEntity.SellerId;

            productHistory.Code_Old = oldEntity.Code;
            productHistory.Code_New = newEntity.Code != null ? newEntity.Code : oldEntity.Code;

            
            
            productHistory.ProductGroupId_Old = oldEntity.ProductGroupId;
            productHistory.ProductGroupId_New = newEntity.ProductGroupId != null ? newEntity.ProductGroupId : oldEntity.ProductGroupId;

            productHistory.Name_Old = oldEntity.Name;
            productHistory.Name_New = newEntity.Name != null ? newEntity.Name : oldEntity.Name;

            
            productHistory.BrandId_Old = oldEntity.BrandId;
            productHistory.BrandId_New = newEntity.BrandId != null ? newEntity.BrandId : oldEntity.BrandId;

            productHistory.IsERP1Updated = false;
            productHistory.IsERP2Updated = false;
            productHistory.IsERP3Updated = false;

            productHistory.CreatedBy = newEntity.UpdatedBy;
            productHistory.UpdatedBy = newEntity.UpdatedBy;
            productHistory.CreatedDate = DateTime.UtcNow;
            productHistory.UpdatedDate = DateTime.UtcNow;

            await AddAsync(productHistory);
        }

        public override async Task ChangeStatusAsync(ProductHistory productHistory)
        {
            var current = await _productHistoryRepository.GetByIdAsync(productHistory.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = productHistory.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public async Task<List<ProductHistory>> GetProductHistoriesWithDetailsAsync(int limit, int offset)
        {
            var products = await _productHistoryRepository.GetAll()

                .Include(x => x.Product)
                .Include(x => x.Seller)
                .Include(x => x.ProductGroup)
                .Include(x => x.Brand)
                .Include(x => x.BudgetGroup)
                .Include(x => x.SalesGroup)
                .Include(x => x.RawMaterialGroup)
                .Include(x => x.StorageCondition)
                .Include(x => x.Packaging)
                .Include(x => x.ProductionPlace)
                .Include(x => x.CuttingType)
                .Include(x => x.QualityType)
                .Include(x => x.ColorType)
                .Include(x => x.SalesBased)
                .Include(x => x.SemiProductGroup)
                .Include(x => x.ProductStatus)

                .Skip(offset)
                .Take(limit)
                .ToListAsync();
            return products;
        }
    }
}
