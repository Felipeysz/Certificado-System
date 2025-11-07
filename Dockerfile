# ==========================
# Etapa 1 — Build
# ==========================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copia o csproj e restaura dependências
COPY ["Certificado.csproj", "."]
RUN dotnet restore "Certificado.csproj"

# Copia todo o restante do código
COPY . .

# Publica a aplicação
RUN dotnet publish "Certificado.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==========================
# Etapa 2 — Runtime
# ==========================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copia os arquivos publicados da etapa de build
COPY --from=build /app/publish .

# Configurações de ambiente padrão
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Expõe a porta
EXPOSE 8080

# Cria a pasta keys (DataProtection)
RUN mkdir -p /app/keys

# Entry point
ENTRYPOINT ["dotnet", "Certificado.dll"]