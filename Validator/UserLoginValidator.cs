using AuthDemo.DTOs;
using FluentValidation;

namespace AuthDemo.Validators
{
    public class UserLoginValidator : AbstractValidator<UserLoginDto>
    {
        public UserLoginValidator()
        {
            RuleFor(x => x.Login)
                .NotEmpty().WithMessage("O campo de login é obrigatório.")
                .MinimumLength(3).WithMessage("O login deve ter no mínimo 3 caracteres.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("A senha é obrigatória.")
                .MinimumLength(6).WithMessage("A senha deve ter no mínimo 6 caracteres.");
        }
    }
}
