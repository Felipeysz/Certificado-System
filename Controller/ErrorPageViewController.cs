using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace AuthDemo.Controllers
{
    public class ErrorPageController : Controller
    {
        public IActionResult Index()
        {
            var feature = HttpContext.Features.Get<IExceptionHandlerPathFeature>();
            var errorMessage = feature?.Error?.Message ?? "Erro desconhecido";

            ViewBag.ErrorMessage = errorMessage;
            return View();
        }
    }
}
