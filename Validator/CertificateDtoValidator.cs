using AuthDemo.DTOs;
using AuthDemo.Repositories;
using FluentValidation;

namespace AuthDemo.Validators
{
    public class CertificateDtoValidator : AbstractValidator<CertificateDto>
    {
        public CertificateDtoValidator(ICertificateRepository repository)
        {
            // Campos obrigatórios
            RuleFor(x => x.NomeCurso)
                .NotEmpty().WithMessage("O nome do curso é obrigatório.")
                // Regra para verificar duplicidade
                .MustAsync(async (nomeCurso, cancellation) =>
                {
                    if (string.IsNullOrWhiteSpace(nomeCurso))
                        return true; // Não precisa validar duplicidade se vazio

                    var exists = await repository.ExistsByNomeCursoAsync(nomeCurso);
                    return !exists;
                })
                .WithMessage("Já existe um certificado com este nome de curso.");

            RuleFor(x => x.NomeInstituicao)
                .NotEmpty().WithMessage("O nome da instituição é obrigatório.");

            RuleFor(x => x.DataEmissao)
                .NotEmpty().WithMessage("A data de emissão é obrigatória.")
                .Must(date => date != default).WithMessage("A data de emissão é inválida.");
        }
    }
}
