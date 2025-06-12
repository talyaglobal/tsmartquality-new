using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class CustomerService(IGenericRepository<Customer> repository, IUnitOfWork unitOfWork, IMapper mapper, ICustomerRepository customerRepository, ICustomUpdateService<Customer> customUpdateService) : Service<Customer>(repository, unitOfWork), ICustomerService
    {
        private readonly ICustomerRepository _customerRepository = customerRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Customer> _customUpdateService = customUpdateService;

        public override async Task<Customer> AddAsync(Customer customer)
        {
            customer.CreatedDate = DateTime.UtcNow;
            customer.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(customer);
        }

        public override async Task ChangeStatusAsync(Customer customer)
        {
            var current = await _customerRepository.GetByIdAsync(customer.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = customer.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Customer customer)
        {
            var current = await _customerRepository.GetByIdAsync(customer.Id);

            Customer last = _customUpdateService.Check(current, customer);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = customer.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
