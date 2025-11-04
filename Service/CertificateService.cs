using AuthDemo.DTOs;
using AuthDemo.Models;
using AuthDemo.Repositories;
using AuthDemo.Validators;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authorization;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AuthDemo.Services
{
    public class CertificateService
    {
        private readonly ICertificateRepository _repository;
        private readonly CertificateDtoValidator _validator;
        private readonly IWebHostEnvironment _env;

        public CertificateService(ICertificateRepository repository, IWebHostEnvironment env)
        {
            _repository = repository;
            _env = env;
            _validator = new CertificateDtoValidator(_repository);
        }

        public async Task<List<Certificate>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<(bool Success, string[] Errors)> CreateAsync(
            CertificateDto dto,
            IFormFile? certificadoVazioFile = null,
            IFormFile? logoFile = null,
            IFormFile? assinaturaFile = null)
        {
            ValidationResult result = await _validator.ValidateAsync(dto);
            if (!result.IsValid)
                return (false, result.Errors.Select(e => e.ErrorMessage).ToArray());

            var safeFileNameBase = string.Concat(dto.NomeCurso.Split(Path.GetInvalidFileNameChars()));
            var certificateFolder = Path.Combine(_env.WebRootPath, "img/certificados", safeFileNameBase);
            Directory.CreateDirectory(certificateFolder);

            if (!string.IsNullOrEmpty(dto.CertificadoGeradoBase64))
            {
                var base64Data = dto.CertificadoGeradoBase64.Split(',')[1];
                var bytes = Convert.FromBase64String(base64Data);

                var imagePath = Path.Combine(certificateFolder, safeFileNameBase + ".png");

                // Redimensiona para tamanho padrão antes de salvar
                using (var ms = new MemoryStream(bytes))
                using (var originalImage = new Bitmap(ms))
                {
                    int targetWidth = 900;
                    int targetHeight = 600;

                    using (var resizedImage = new Bitmap(targetWidth, targetHeight, System.Drawing.Imaging.PixelFormat.Format32bppArgb))
                    {
                        resizedImage.SetResolution(originalImage.HorizontalResolution, originalImage.VerticalResolution);

                        using (var graphics = Graphics.FromImage(resizedImage))
                        {
                            graphics.CompositingQuality = CompositingQuality.HighQuality;
                            graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                            graphics.SmoothingMode = SmoothingMode.HighQuality;

                            float scale = Math.Min((float)targetWidth / originalImage.Width, (float)targetHeight / originalImage.Height);
                            int newWidth = (int)(originalImage.Width * scale);
                            int newHeight = (int)(originalImage.Height * scale);
                            int offsetX = (targetWidth - newWidth) / 2;
                            int offsetY = (targetHeight - newHeight) / 2;

                            graphics.DrawImage(originalImage, offsetX, offsetY, newWidth, newHeight);
                        }

                        resizedImage.Save(imagePath, ImageFormat.Png);
                    }
                }


                dto.CertificadoVazio = "/img/certificados/" + safeFileNameBase + "/" + safeFileNameBase + ".png";

                if (!string.IsNullOrEmpty(dto.NomeAlunoConfig))
                {
                    var configPath = Path.Combine(certificateFolder, safeFileNameBase + ".config");
                    await System.IO.File.WriteAllTextAsync(configPath, dto.NomeAlunoConfig);
                }
            }
            else if (certificadoVazioFile != null && certificadoVazioFile.Length > 0)
            {
                var extension = Path.GetExtension(certificadoVazioFile.FileName);
                var filePath = Path.Combine(certificateFolder, safeFileNameBase + extension);

                await using var stream = new FileStream(filePath, FileMode.Create);
                await certificadoVazioFile.CopyToAsync(stream);

                dto.CertificadoVazio = "/img/certificados/" + safeFileNameBase + "/" + safeFileNameBase + extension;

                if (!string.IsNullOrEmpty(dto.NomeAlunoConfig))
                {
                    var configPath = Path.Combine(certificateFolder, safeFileNameBase + ".config");
                    await System.IO.File.WriteAllTextAsync(configPath, dto.NomeAlunoConfig);
                }
            }

            if (logoFile != null && logoFile.Length > 0)
                dto.LogoInstituicao = await SaveFile(logoFile, "img/logoInstituicao");

            if (assinaturaFile != null && assinaturaFile.Length > 0)
                dto.Assinatura = await SaveFile(assinaturaFile, "img/assinaturas");

            var certificate = new Certificate
            {
                NomeCurso = dto.NomeCurso,
                CargaHoraria = dto.CargaHoraria,
                DataInicio = dto.DataInicio,
                DataTermino = dto.DataTermino,
                NomeInstituicao = dto.NomeInstituicao,
                EnderecoInstituicao = dto.EnderecoInstituicao,
                Cidade = dto.Cidade,
                DataEmissao = dto.DataEmissao,
                LogoInstituicao = dto.LogoInstituicao,
                NomeResponsavel = dto.NomeResponsavel,
                CargoResponsavel = dto.CargoResponsavel,
                Assinatura = dto.Assinatura,
                SeloQrCode = dto.SeloQrCode,
                CodigoCertificado = dto.CodigoCertificado,
                CertificadoVazio = dto.CertificadoVazio
            };

            await _repository.AddAsync(certificate);
            return (true, Array.Empty<string>());
        }

        private async Task<string> SaveFile(IFormFile file, string folder, string? fileNameWithoutExtension = null)
        {
            string folderPath = Path.Combine(_env.WebRootPath, folder);
            Directory.CreateDirectory(folderPath);

            string extension = Path.GetExtension(file.FileName);
            string safeFileName = fileNameWithoutExtension != null
                ? string.Concat(fileNameWithoutExtension.Split(Path.GetInvalidFileNameChars()))
                : Path.GetFileNameWithoutExtension(file.FileName);

            string filePath = Path.Combine(folderPath, safeFileName + extension);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return "/" + Path.Combine(folder, safeFileName + extension).Replace("\\", "/");
        }
        
        
        public async Task DeleteAsync(int id)
        {
            var certificate = await _repository.GetByIdAsync(id);
            if (certificate == null) return;

            if (!string.IsNullOrEmpty(certificate.CertificadoVazio))
            {
                var certificadoVazioPath = Path.Combine(_env.WebRootPath,
                    certificate.CertificadoVazio.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
                var certificateFolder = Path.GetDirectoryName(certificadoVazioPath);

                if (Directory.Exists(certificateFolder))
                    Directory.Delete(certificateFolder, true);
            }

            await _repository.DeleteAsync(id);
        }


        public async Task<byte[]> CertificarAlunoAsync(string nomeCurso, string nomeAluno)
        {
            var safeFileNameBase = string.Concat(nomeCurso.Split(Path.GetInvalidFileNameChars()));
            var certificateFolder = Path.Combine(_env.WebRootPath, "img/certificados", safeFileNameBase);

            var imagePath = Path.Combine(certificateFolder, safeFileNameBase + ".png");
            var configPath = Path.Combine(certificateFolder, safeFileNameBase + ".config");

            if (!System.IO.File.Exists(imagePath))
                throw new FileNotFoundException("Certificado não encontrado.");

            // Desserializa config ou cria default
            NomeAlunoConfig config;
            if (System.IO.File.Exists(configPath))
            {
                var configJson = await System.IO.File.ReadAllTextAsync(configPath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                options.Converters.Add(new NumberOrStringToStringConverter());
                config = JsonSerializer.Deserialize<NomeAlunoConfig>(configJson, options) ?? new NomeAlunoConfig();
            }
            else
            {
                config = new NomeAlunoConfig();
            }

            // Valores padrão
            float fontSize = float.TryParse(config.FontSize.Replace("px", ""), out var fs) && fs > 0 ? fs : 16f;
            float x = float.TryParse(config.Left.Replace("px", ""), out var lx) ? lx : 50f;
            float y = float.TryParse(config.Top.Replace("px", ""), out var ty) ? ty : 50f;

            // Cria bitmap de alta qualidade
            using var original = new Bitmap(imagePath);
            using var bitmap = new Bitmap(original.Width, original.Height, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
            bitmap.SetResolution(original.HorizontalResolution, original.VerticalResolution);

            using var graphics = Graphics.FromImage(bitmap);
            graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            graphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
            graphics.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
            graphics.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAliasGridFit;

            // Copia a imagem base
            graphics.DrawImage(original, 0, 0, bitmap.Width, bitmap.Height);

            // Prepara fonte
            using var font = new Font(config.FontFamily, fontSize,
                config.FontWeight.ToLower() == "bold" ? FontStyle.Bold : FontStyle.Regular);

            // Converte cor
            Color color = config.Color.StartsWith("rgb")
                ? Color.FromArgb(
                    int.Parse(config.Color.Replace("rgb(", "").Replace(")", "").Split(',')[0].Trim()),
                    int.Parse(config.Color.Replace("rgb(", "").Replace(")", "").Split(',')[1].Trim()),
                    int.Parse(config.Color.Replace("rgb(", "").Replace(")", "").Split(',')[2].Trim()))
                : ColorTranslator.FromHtml(config.Color);

            using var brush = new SolidBrush(color);

            // Cria StringFormat para centralizar horizontalmente
            float rectWidth = Math.Max(config.Width > 0 ? config.Width : 400, 100);
            float rectHeight = Math.Max(config.Height > 0 ? config.Height : fontSize * 2f, fontSize * 1.5f);

            var rect = new RectangleF(x + 168.5f, y + 16.5f, rectWidth, rectHeight);

            // StringFormat para centralizar horizontalmente
            var stringFormat = new StringFormat
            {
                Alignment = StringAlignment.Center, // centraliza horizontal
                LineAlignment = StringAlignment.Near // topo no y
            };

            graphics.DrawString(nomeAluno, font, brush, rect, stringFormat);


            using var ms = new MemoryStream();
            bitmap.Save(ms, ImageFormat.Png);
            return ms.ToArray();
        }



        public class NumberOrStringToStringConverter : JsonConverter<string>
        {
            public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            {
                if (reader.TokenType == JsonTokenType.Number)
                    return reader.GetDouble().ToString();
                if (reader.TokenType == JsonTokenType.String)
                    return reader.GetString();
                throw new JsonException();
            }

            public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
            {
                writer.WriteStringValue(value);
            }
        }



        private class NomeAlunoConfig
        {
            [JsonPropertyName("top")]
            public string Top { get; set; }

            [JsonPropertyName("left")]
            public string Left { get; set; }

            [JsonPropertyName("width")]
            public int Width { get; set; }

            [JsonPropertyName("height")]
            public float Height { get; set; }

            [JsonPropertyName("fontFamily")]
            public string FontFamily { get; set; }

            [JsonPropertyName("fontSize")]
            public string FontSize { get; set; }

            [JsonPropertyName("color")]
            public string Color { get; set; }

            [JsonPropertyName("fontWeight")]
            public string FontWeight { get; set; }

            [JsonPropertyName("textAlign")]
            public string TextAlign { get; set; }
        }
    }
}
