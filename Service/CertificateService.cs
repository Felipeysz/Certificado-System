using AuthDemo.DTOs;
using AuthDemo.Models;
using AuthDemo.Repositories;
using AuthDemo.Validators;
using FluentValidation.Results;
using System.Text.Json;
using System.Text.Json.Serialization;
using SixLabors.Fonts;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Drawing.Processing;

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

                using var ms = new MemoryStream(bytes);
                using var image = Image.Load<Rgba32>(ms);

                int targetWidth = 900;
                int targetHeight = 600;

                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(targetWidth, targetHeight),
                    Mode = ResizeMode.Pad,
                    Position = AnchorPositionMode.Center,
                    PadColor = Color.White
                }));

                await image.SaveAsPngAsync(imagePath);

                dto.CertificadoVazio = "/img/certificados/" + safeFileNameBase + "/" + safeFileNameBase + ".png";

                if (!string.IsNullOrEmpty(dto.NomeAlunoConfig))
                {
                    var configPath = Path.Combine(certificateFolder, safeFileNameBase + ".config");
                    await File.WriteAllTextAsync(configPath, dto.NomeAlunoConfig);
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
                    await File.WriteAllTextAsync(configPath, dto.NomeAlunoConfig);
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

            if (!File.Exists(imagePath))
                throw new FileNotFoundException("Certificado não encontrado.");

            NomeAlunoConfig config;
            if (File.Exists(configPath))
            {
                var configJson = await File.ReadAllTextAsync(configPath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                options.Converters.Add(new NumberOrStringToStringConverter());
                config = JsonSerializer.Deserialize<NomeAlunoConfig>(configJson, options) ?? new NomeAlunoConfig();
            }
            else
            {
                config = new NomeAlunoConfig();
            }

            float fontSize = float.TryParse(config.FontSize.Replace("px", ""), out var fs) && fs > 0 ? fs : 16f;
            float x = float.TryParse(config.Left.Replace("px", ""), out var lx) ? lx : 50f;
            float y = float.TryParse(config.Top.Replace("px", ""), out var ty) ? ty : 50f;

            using var image = await Image.LoadAsync<Rgba32>(imagePath);

            var font = SystemFonts.CreateFont(
                string.IsNullOrWhiteSpace(config.FontFamily) ? "Arial" : config.FontFamily,
                fontSize,
                config.FontWeight.ToLower() == "bold" ? FontStyle.Bold : FontStyle.Regular
            );

            var color = Color.TryParse(config.Color, out var parsedColor) ? parsedColor : Color.Black;

            float rectWidth = config.Width > 0 ? config.Width : 400;
            float rectHeight = config.Height > 0 ? config.Height : fontSize * 2f;

            var rect = new RectangleF(x + 168.5f, y + 16.5f, rectWidth, rectHeight);

            image.Mutate(ctx =>
            {
                // cria opções apenas para medir o texto
                var measureOptions = new SixLabors.Fonts.TextOptions(font)
                {
                    WrappingLength = rect.Width
                };

                // obtém o tamanho do texto com a font atual
                var textSize = TextMeasurer.MeasureSize(nomeAluno, measureOptions);

                // calcula ponto para centralizar horizontalmente dentro do rect
                var drawX = rect.X + (rect.Width - textSize.Width) / 2f;
                var drawY = rect.Y; // mantém topo como antes
                var drawPoint = new SixLabors.ImageSharp.PointF(drawX, drawY);

                // chamada NÃO ambígua para desenhar: texto, fonte, cor, ponto
                ctx.DrawText(nomeAluno, font, color, drawPoint);
            });




            using var ms = new MemoryStream();
            await image.SaveAsync(ms, new PngEncoder());
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
            public string Top { get; set; } = "0";

            [JsonPropertyName("left")]
            public string Left { get; set; } = "0";

            [JsonPropertyName("width")]
            public int Width { get; set; }

            [JsonPropertyName("height")]
            public float Height { get; set; }

            [JsonPropertyName("fontFamily")]
            public string FontFamily { get; set; } = "Arial";

            [JsonPropertyName("fontSize")]
            public string FontSize { get; set; } = "16px";

            [JsonPropertyName("color")]
            public string Color { get; set; } = "black";

            [JsonPropertyName("fontWeight")]
            public string FontWeight { get; set; } = "regular";

            [JsonPropertyName("textAlign")]
            public string TextAlign { get; set; } = "center";
        }
    }
}
