namespace AuthDemo.Models
{
    public enum UserPermission
    {
        Admin,
        Colaborador
    }

    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserPermission Permission { get; set; } = UserPermission.Colaborador;
    }
}
