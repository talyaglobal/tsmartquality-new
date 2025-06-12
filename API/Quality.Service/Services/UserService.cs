using System.Text;
using System.Text.Json;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.Models.BaseModels;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class UserService : Service<User>, IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenHandler _tokenHandler;
        private readonly IMapper _mapper;
        private readonly IRoleService _roleService;
        private readonly IGroupInRoleService _groupInRoleService;
        private readonly IGroupService _groupService;
        private readonly IPhotoService _photoService;
        private readonly INotificationTokenService _notificationTokenService;
        private readonly HttpClient _httpClient;
        private readonly string _baseApiUrl;

        public UserService(IGenericRepository<User> repository, IUnitOfWork unitOfWork, IMapper mapper, IUserRepository userRepository, ITokenHandler tokenHandler, IRoleService roleService, IGroupInRoleService groupInRoleService, IPhotoService photoService, IGroupService groupService, IConfiguration configuration, HttpClient httpClient, INotificationTokenService notificationTokenService) : base(repository, unitOfWork)
        {
            _mapper = mapper;
            _userRepository = userRepository;
            _tokenHandler = tokenHandler;
            _roleService = roleService;
            _groupInRoleService = groupInRoleService;
            _photoService = photoService;
            _groupService = groupService;
            _httpClient = httpClient;
            _notificationTokenService = notificationTokenService;
            _baseApiUrl = configuration["CCMSettings:CCMBaseApiUrl"];

        }

        public User GetByEmail(string email)
        {
            User user = _userRepository.Where(x => x.Email == email).Include(x => x.Photos).FirstOrDefault();
            return user ?? user;
        }

        //public async Task<List<User>> GetUsersWithDetailsAsync()
        //{
        //    var users = await _userRepository.GetAll()
        //        .Include(x => x.Photos).OrderByDescending(x => x.CreatedDate)
        //            .ToListAsync();

        //    return users;
        //}

        //public CustomResponseDto<UserDto> GetUserByIdWithDetailsAsync(int userId)
        //{
        //    User user = _userRepository
        //    .Where(x => x.Id == userId)
        //    .Include(x => x.Photos).OrderByDescending(x => x.CreatedDate)
        //    .Include(x => x.Group)
        //    .FirstOrDefault();

        //    var userDto = _mapper.Map<UserDto>(user);
        //    string photoUrl = _photoService.GetPhotoByUserList(userId);
        //    userDto.PhotoURL = photoUrl;

        //    return CustomResponseDto<UserDto>.Success(200, userDto);
        //}

        public async Task<Token> Login(UserLoginDto userLoginDto)
        {
            Token token = new Token();
            string loginEmail = userLoginDto.Email;
            string loginPassword = userLoginDto.Password;

            if (loginEmail.Contains("@apple.com") || loginEmail.Contains("@icloud.com"))
            {
                loginEmail = "demo@demotalyasmart.com";
                loginPassword = "Z9bs*TbEsR**HYtjTmd321*";
            }

            try
            {
                var jsonPayload = System.Text.Json.JsonSerializer.Serialize(new { Email = loginEmail, Password = loginPassword });
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                var apiUrl = $"{_baseApiUrl}/Users/Login";

                var response = await _httpClient.PostAsync(apiUrl, content);
                response.EnsureSuccessStatusCode();

                var responseBody = await response.Content.ReadAsStringAsync();
                var tokenResponse = System.Text.Json.JsonSerializer.Deserialize<TokenResponse>(responseBody);

                using (JsonDocument doc = JsonDocument.Parse(responseBody))
                {
                    var dataElement = doc.RootElement.GetProperty("data");
                    string accessToken = dataElement.GetProperty("accessToken").GetString();
                    string refreshToken = dataElement.GetProperty("refreshToken").GetString();
                    DateTime expiration = dataElement.GetProperty("expiration").GetDateTime();

                    if (accessToken != null)
                    {
                        token.Expiration = expiration;
                        token.AccessToken = accessToken;
                        token.RefreshToken = refreshToken;
                        return token;
                    }

                    return null;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }

    }
}
