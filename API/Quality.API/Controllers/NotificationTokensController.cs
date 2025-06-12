using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.UpdateDTOs.BaseUpdateDTOs.DefinitionUpdateDTOs;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [OutputCache]
    [EnableRateLimiting("Basic")]
    public class NotificationTokensController(IMapper mapper, INotificationTokenService notificationTokenService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly INotificationTokenService _notificationTokenService = notificationTokenService;

        [HttpGet]
        //[Authorize(Roles = "Root,NotificationTokens.Get")]
        public async Task<IActionResult> All()
        {
            var notificationTokens = await _notificationTokenService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var notificationTokensDtos = _mapper.Map<List<NotificationTokenDto>>(notificationTokens.Where(x => x.Status == true && x.CompanyId == companyId).ToList());
            return CreateActionResult(CustomResponseDto<List<NotificationTokenDto>>.Success(200, notificationTokensDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<NotificationToken>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,NotificationTokens.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var notificationToken = await _notificationTokenService.GetByIdAsync(id);
            var notificationTokensDto = _mapper.Map<NotificationTokenDto>(notificationToken);
            return CreateActionResult(CustomResponseDto<NotificationTokenDto>.Success(200, notificationTokensDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,NotificationTokens.Add")]
        public async Task<IActionResult> Save(NotificationTokenDto notificationTokenDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<NotificationToken>(notificationTokenDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy = userId;
            processedEntity.UpdatedBy = userId;

            var notificationToken = await _notificationTokenService.AddAsync(processedEntity);

            var notificationTokensDto = _mapper.Map<NotificationTokenDto>(notificationToken);
            return CreateActionResult(CustomResponseDto<NotificationTokenDto>.Success(201, notificationTokensDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,NotificationTokens.Update")]
        public async Task<IActionResult> Update(NotificationTokenUpdateDto notificationTokenDto)
        {
            int userId = GetUserFromToken();
            var notificationToken = _mapper.Map<NotificationToken>(notificationTokenDto);
            notificationToken.UpdatedBy = userId;

            await _notificationTokenService.UpdateAsync(notificationToken);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,NotificationTokens.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var notificationToken = await _notificationTokenService.GetByIdAsync(id);

            notificationToken.UpdatedBy = userId;

            await _notificationTokenService.ChangeStatusAsync(notificationToken);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
