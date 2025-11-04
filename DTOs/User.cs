namespace AuthDemo.DTOs
{

    public class LoginResultDto
    {
        public string Token { get; set; } = string.Empty;
        public string Permission { get; set; } = string.Empty;
    }

    public class UserLoginDto
    {
        public string Login { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
    public class UserItemDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Permission { get; set; } = string.Empty;
    }
    public class UserCreateDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }


}
