using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs.ProductPortalDefinitionUpdateDtos;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StorageConditionsController(IMapper mapper, IStorageConditionService storageConditionService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IStorageConditionService _storageConditionService = storageConditionService;

        [HttpGet]
        //[Authorize(Roles = "Root,StorageConditions.Get")]
        public async Task<IActionResult> All()
        {
            var storageConditions = await _storageConditionService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var storageConditionsDtos = _mapper.Map<List<StorageConditionDto>>(storageConditions.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<StorageConditionDto>>.Success(200, storageConditionsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<StorageCondition>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,StorageConditions.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var storageCondition = await _storageConditionService.GetByIdAsync(id);
            var storageConditionsDto = _mapper.Map<StorageConditionDto>(storageCondition);
            return CreateActionResult(CustomResponseDto<StorageConditionDto>.Success(200, storageConditionsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,StorageConditions.Add")]
        public async Task<IActionResult> Save(StorageConditionDto storageConditionDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<StorageCondition>(storageConditionDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var storageCondition = await _storageConditionService.AddAsync(processedEntity);

            var storageConditionsDto = _mapper.Map<StorageConditionDto>(storageCondition);
            return CreateActionResult(CustomResponseDto<StorageConditionDto>.Success(201, storageConditionsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,StorageConditions.Update")]
        public async Task<IActionResult> Update(StorageConditionUpdateDto storageConditionDto)
        {
            int userId = GetUserFromToken();
            var storageCondition = _mapper.Map<StorageCondition>(storageConditionDto);
            storageCondition.UpdatedBy = userId;

            await _storageConditionService.UpdateAsync(storageCondition);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,StorageConditions.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var storageCondition = await _storageConditionService.GetByIdAsync(id);

            storageCondition.UpdatedBy = userId;

            await _storageConditionService.ChangeStatusAsync(storageCondition);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
