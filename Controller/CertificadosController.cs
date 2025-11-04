using AuthDemo.DTOs;
using AuthDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthDemo.Controllers
{
    [Authorize]
    public class CertificadosController : Controller
    {
        private readonly CertificateService _service;

        public CertificadosController(CertificateService service)
        {
            _service = service;
        }

        // GET: /Certificados/Create
        public IActionResult Create()
        {
            return View(new CertificateDto());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(
            CertificateDto dto,
            IFormFile? certificadoVazioFile,
            IFormFile? logoFile,
            IFormFile? assinaturaFile)
        {
            var (isSuccess, serviceErrors) = await _service.CreateAsync(dto, certificadoVazioFile, logoFile, assinaturaFile);

            ModelState.Clear();

            if (!isSuccess)
            {
                foreach (var err in serviceErrors)
                    ModelState.AddModelError(string.Empty, err);

                return View(dto);
            }

            TempData["SuccessMessage"] = "Certificado criado com sucesso!";
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            TempData["SuccessMessage"] = "Certificado excluído com sucesso!";
            return RedirectToAction("Index", "Home");
        }

        // GET: /certificado/{nomeCurso} -> Exibe o form para digitar o nome do aluno
        [HttpGet("/certificado/{nomeCurso}"), AllowAnonymous]
        public IActionResult EnviarAluno(string nomeCurso)
        {
            ViewBag.NomeCurso = nomeCurso;
            return View();
        }

        // POST: /certificado/{nomeCurso} -> Gera o certificado com o nome digitado
        [HttpPost("/certificado/{nomeCurso}"), AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EnviarAluno(string nomeCurso, string nomeAluno)
        {
            if (string.IsNullOrWhiteSpace(nomeAluno))
            {
                TempData["ErrorMessage"] = "O nome do aluno é obrigatório.";
                return RedirectToAction("EnviarAluno", new { nomeCurso });
            }

            var bytes = await _service.CertificarAlunoAsync(nomeCurso, nomeAluno);
            var fileName = $"Certificado_{nomeAluno.Replace(" ", "_")}.png";
            return File(bytes, "image/png", fileName);
        }
    }
}
