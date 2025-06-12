namespace Quality.Core.Models.BaseModels
{
    public class Token
    {
        public string AccessToken { get; set; }
        public DateTime Expiration { get; set; }
        public string RefreshToken { get; set; }
    }

    public class TokenResponse
    {
        public Token? Data { get; set; }
        public int? StatusCode { get; set; }
        public object? Errors { get; set; }
    }
}
