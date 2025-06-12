using AutoMapper;
using Quality.Core.Models.ProductPortalModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class ProductToCustomerService(IGenericRepository<ProductToCustomer> repository, IUnitOfWork unitOfWork, IMapper mapper, IProductToCustomerRepository productToCustomerRepository, ICustomUpdateService<ProductToCustomer> customUpdateService) : Service<ProductToCustomer>(repository, unitOfWork), IProductToCustomerService
    {
        private readonly IProductToCustomerRepository _productToCustomerRepository = productToCustomerRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<ProductToCustomer> _customUpdateService = customUpdateService;

        public override async Task<ProductToCustomer> AddAsync(ProductToCustomer productToCustomer)
        {
            productToCustomer.CreatedDate = DateTime.UtcNow;
            productToCustomer.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(productToCustomer);
        }

        public override async Task ChangeStatusAsync(ProductToCustomer productToCustomer)
        {
            var current = await _productToCustomerRepository.GetByIdAsync(productToCustomer.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = productToCustomer.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(ProductToCustomer productToCustomer)
        {
            var current = await _productToCustomerRepository.GetByIdAsync(productToCustomer.Id);

            ProductToCustomer last = _customUpdateService.Check(current, productToCustomer);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = productToCustomer.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
