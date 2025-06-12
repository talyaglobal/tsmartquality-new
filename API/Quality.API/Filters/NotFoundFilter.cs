﻿using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.Models.BaseModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Quality.API.Filters
{
    public class NotFoundFilter<T>(IService<T> service) : IAsyncActionFilter where T : BaseEntity
    {
        private readonly IService<T> _service = service;

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var idValue = context.ActionArguments.Values.FirstOrDefault();
            if (idValue == null)
            {
                await next.Invoke();
                return;
            }
            var id = (int)idValue;
            var anyEntity = await _service.AnyAsync(x => x.Id == id);
            if (anyEntity)
            {
                await next.Invoke();
                return;
            }
            context.Result = new NotFoundObjectResult(CustomResponseDto<NoContentDto>
                .Fail(404, $"{typeof(T).Name} Not Found"));
        }

    }
}
