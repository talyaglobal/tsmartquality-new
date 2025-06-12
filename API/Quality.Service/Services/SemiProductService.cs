using AutoMapper;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class SemiProductService(IGenericRepository<SemiProduct> repository, IUnitOfWork unitOfWork, IMapper mapper, ISemiProductRepository semiProductRepository, ISemiProductGroupService semiProductGroupService, ICustomUpdateService<SemiProduct> customUpdateService) : Service<SemiProduct>(repository, unitOfWork), ISemiProductService
    {
        private readonly ISemiProductRepository _semiProductRepository = semiProductRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ISemiProductGroupService _semiProductGroupService = semiProductGroupService;
        private readonly ICustomUpdateService<SemiProduct> _customUpdateService = customUpdateService;

        string semiProductGroupName;

        public override async Task<SemiProduct> AddAsync(SemiProduct semiProduct)
        {
            try
            {
                semiProduct.CreatedDate = DateTime.UtcNow;
                semiProduct.UpdatedDate = DateTime.UtcNow;

                return await base.AddAsync(semiProduct);
            }
            catch (Exception ex)
            {
                // Hatanın detaylarını yazdırma
                Console.WriteLine("\n---------------- HATA LİSTESİ AŞAĞIDAKİ GİBİDİR ----------------n");
                Console.WriteLine("Exception Type: " + ex.GetType().FullName);
                Console.WriteLine("Message: " + ex.Message);
                Console.WriteLine("Stack Trace: " + ex.StackTrace);

                if (ex.InnerException != null)
                {
                    Console.WriteLine("Inner Exception Type: " + ex.InnerException.GetType().FullName);
                    Console.WriteLine("Inner Exception Message: " + ex.InnerException.Message);
                    Console.WriteLine("Inner Exception Stack Trace: " + ex.InnerException.StackTrace);
                }

                Console.WriteLine("Exception ToString: " + ex.ToString());

                return semiProduct;
            }
        }


        public override async Task ChangeStatusAsync(SemiProduct semiProduct)
        {
            var current = await _semiProductRepository.GetByIdAsync(semiProduct.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = semiProduct.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(SemiProduct semiProduct)
        {
            var current = await _semiProductRepository.GetByIdAsync(semiProduct.Id);

            SemiProduct last = _customUpdateService.Check(current, semiProduct);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = semiProduct.UpdatedBy;
            await base.UpdateAsync(last);
        }

        public async Task<CustomResponseDto<SemiProductDto>> GetSemiProductByIdWithDetailsAsync(int semiProductId)
        {
            SemiProduct semiProduct = _semiProductRepository.Where(x => x.Id == semiProductId).OrderByDescending(x => x.CreatedDate).FirstOrDefault();

            if (semiProduct == null)
            {
                return CustomResponseDto<SemiProductDto>.Fail(404, "SemiProduct not found");
            }

            var semiProductDto = _mapper.Map<SemiProductDto>(semiProduct);
            semiProductDto.SemiProductGroupName = await GetSemiProductGroupNameAsync(semiProductDto.Id);
            return CustomResponseDto<SemiProductDto>.Success(200, semiProductDto);
        }

        public async Task<string> GetSemiProductGroupNameAsync(int semiProductId)
        {
            try
            {
                SemiProduct semiProduct = await _semiProductRepository.GetByIdAsync(semiProductId);
                SemiProductGroup semiProductGroup = await _semiProductGroupService.GetByIdAsync(semiProduct.Id);
                semiProductGroupName = semiProductGroup.Name;
            }
            catch (Exception ex) { Console.WriteLine(ex.Message); }
            return semiProductGroupName;
        }
    }
}
