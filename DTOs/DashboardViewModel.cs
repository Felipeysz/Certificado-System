using System.Collections.Generic;

namespace AuthDemo.DTOs
{
    public class DashboardViewModel
    {
        public string Permission { get; set; } = "Colaborador";
        public IEnumerable<CertificateItemDto> Certificados { get; set; } = new List<CertificateItemDto>();
        public IEnumerable<UserItemDto> Usuarios { get; set; } = new List<UserItemDto>();
    }

    public class CertificateItemDto
    {
        public int Id { get; set; }
        public string NomeCurso { get; set; } = string.Empty;
        public string NomeInstituicao { get; set; } = string.Empty;
        public string DataEmissao { get; set; } = string.Empty;
        public string CodigoCertificado { get; set; } = string.Empty;
        public string CertificadoVazio { get; set; } = "~/images/certificados/placeholder.png";
    }
}
