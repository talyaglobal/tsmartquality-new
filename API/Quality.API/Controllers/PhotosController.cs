using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.BaseDTOs.DefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.BaseUpdateDTOs.DefinitionUpdateDTOs;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhotosController(IMapper mapper, IPhotoService photoService, IFileService fileService, IUserService userService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IPhotoService _photoService = photoService;
        private readonly IFileService _fileService = fileService;
        private readonly IUserService _userService = userService;

        [HttpGet]
        //[Authorize(Roles = "Root,Photos.Get")]
        public async Task<IActionResult> All()
        {
            var photos = await _photoService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var photosDtos = _mapper.Map<List<PhotoDto>>(photos.Where(x => x.CompanyId == companyId && x.Status).OrderByDescending(x => x.CreatedDate).ToList());
            return CreateActionResult(CustomResponseDto<List<PhotoDto>>.Success(200, photosDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<Photo>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Photos.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var photo = await _photoService.GetByIdAsync(id);
            var photosDto = _mapper.Map<PhotoDto>(photo);
            return CreateActionResult(CustomResponseDto<PhotoDto>.Success(200, photosDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Photos.Add")]
        public async Task<IActionResult> Save([FromForm] PhotoDto photoDto)
        {
            List<string> uploadedUrls = [];

            int userId = GetUserFromToken();

            Photo processedEntity = _mapper.Map<Photo>(photoDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            uploadedUrls = _fileService.FileSaveToServer(photoDto.PhotoFiles, "./Contents/");

            if (uploadedUrls.Count == 0)
            {
                return CreateActionResult(CustomResponseDto<NoContentDto>.Fail(500, "An error occurred while uploading the photo !"));
            }
            else if (uploadedUrls.Count == 1)
            {
                processedEntity.PhotoUrl = uploadedUrls[0];

                await _photoService.UploadSinglePhotoAsync(processedEntity);
                return CreateActionResult(CustomResponseDto<Photo>.Success(200, processedEntity));
            }
            else if (uploadedUrls.Count > 1)
            {
                List<Photo> photos = [];
                foreach (var url in uploadedUrls)
                {
                    var photo = new Photo
                    {
                        PhotoUrl = url,
                        CreatedBy = userId,
                        UpdatedBy = userId,
                        ProductId = processedEntity.ProductId,
                        UserId = processedEntity.UserId
                    };
                    photos.Add(photo);
                }

                await _photoService.UploadMultiPhotosAsync(photos);

                return CreateActionResult(CustomResponseDto<NoContentDto>.Success(201));
            }
            else
            {
                return CreateActionResult(CustomResponseDto<NoContentDto>.Fail(500, "An error occurred while uploading the photo !"));
            }
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Photos.Update")]
        public async Task<IActionResult> Update(PhotoUpdateDto photoDto)
        {
            int userId = GetUserFromToken();
            var photo = _mapper.Map<Photo>(photoDto);
            photo.UpdatedBy = userId;

            await _photoService.UpdateAsync(photo);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Photos.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var photo = await _photoService.GetByIdAsync(id);

            photo.UpdatedBy = userId;

            await _photoService.ChangeStatusAsync(photo);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
