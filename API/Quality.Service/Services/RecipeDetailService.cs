using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class RecipeDetailService(IGenericRepository<RecipeDetail> repository, IUnitOfWork unitOfWork, IMapper mapper, IRecipeDetailRepository recipeDetailRepository, ICustomUpdateService<RecipeDetail> customUpdateService) : Service<RecipeDetail>(repository, unitOfWork), IRecipeDetailService
    {
        private readonly IRecipeDetailRepository _recipeDetailRepository = recipeDetailRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<RecipeDetail> _customUpdateService = customUpdateService;

        public override async Task<RecipeDetail> AddAsync(RecipeDetail recipeDetail)
        {
            recipeDetail.CreatedDate = DateTime.UtcNow;
            recipeDetail.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(recipeDetail);
        }

        public override async Task ChangeStatusAsync(RecipeDetail recipeDetail)
        {
            var current = await _recipeDetailRepository.GetByIdAsync(recipeDetail.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = recipeDetail.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(RecipeDetail recipeDetail)
        {
            var current = await _recipeDetailRepository.GetByIdAsync(recipeDetail.Id);

            RecipeDetail last = _customUpdateService.Check(current, recipeDetail);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = recipeDetail.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
