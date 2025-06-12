using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class SellerService(IGenericRepository<Seller> repository, IUnitOfWork unitOfWork, IMapper mapper, ISellerRepository sellerRepository, ICustomUpdateService<Seller> customUpdateService) : Service<Seller>(repository, unitOfWork), ISellerService
    {
        private readonly ISellerRepository _sellerRepository = sellerRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Seller> _customUpdateService = customUpdateService;

        public override async Task<Seller> AddAsync(Seller seller)
        {
            seller.CreatedDate = DateTime.UtcNow;
            seller.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(seller);
        }

        public override async Task ChangeStatusAsync(Seller seller)
        {
            var current = await _sellerRepository.GetByIdAsync(seller.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = seller.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Seller seller)
        {
            var current = await _sellerRepository.GetByIdAsync(seller.Id);

            Seller last = _customUpdateService.Check(current, seller);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = seller.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
