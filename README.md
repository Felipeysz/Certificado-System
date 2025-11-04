# 🧾 - Sistema de Autenticação e Certificados

## 📘 Visão Geral

O **NeoAuth** é um sistema desenvolvido em **ASP.NET Core MVC**, com o
objetivo de gerenciar **usuários** e **certificados digitais de
cursos**.\
Ele permite que administradores criem e gerenciem colaboradores, bem
como emitam certificados personalizados com base em templates visuais.

------------------------------------------------------------------------

## 🚀 Funcionalidades Principais

### 🔐 Autenticação de Usuários

-   Login com **usuário ou e-mail**.
-   Sistema de **lembrar-me** opcional.
-   Exibição de mensagens de erro personalizadas.
-   Interface moderna com design inspirado em **NeoAuth Style**.

### 👥 Gerenciamento de Usuários

-   Criar novos colaboradores (usuários com permissão limitada).
-   Visualizar e excluir usuários.
-   Apenas **admins** podem criar e excluir outros usuários.

### 🧾 Certificados de Curso

-   Criação de certificados personalizados com base em um **template
    visual**.
-   Upload de **certificados vazios** em formato JPG, PNG ou PDF.
-   Edição de campos dinâmicos no certificado (nome do aluno, curso,
    data, etc.).
-   Personalização completa de texto: fonte, tamanho, cor, negrito e
    alinhamento.
-   Pré-visualização interativa em tempo real.
-   Geração automática de certificado final (imagem Base64).

### 📊 Dashboard

-   Exibe **usuários cadastrados** e **certificados criados**.
-   Acesso rápido para criação, exclusão e envio de certificados.
-   Cópia de link do certificado diretamente da interface.
-   Design totalmente responsivo e estilizado em CSS moderno.

------------------------------------------------------------------------

## 🧩 Estrutura do Projeto

    AuthDemo/
    ├── Controllers/
    │   ├── AuthController.cs
    │   ├── CertificadosController.cs
    │   └── UsersController.cs
    │
    ├── DTOs/
    │   ├── UserLoginDto.cs
    │   ├── UserCreateDto.cs
    │   ├── CertificateDto.cs
    │   └── DashboardViewModel.cs
    │
    ├── Views/
    │   ├── Auth/
    │   │   └── Login.cshtml
    │   ├── Certificados/
    │   │   ├── Create.cshtml
    │   │   └── _CertificateFieldsPartial.cshtml
    │   ├── Users/
    │   │   └── Create.cshtml
    │   └── Shared/
    │       ├── Error.cshtml
    │       └── _Layout.cshtml
    │
    ├── wwwroot/
    │   ├── css/
    │   │   ├── NeoAuth.css
    │   │   ├── styleDashboard.css
    │   │   └── CreateCertification.css
    │   └── js/
    │       ├── certificate-form.js
    │       └── configNomeAlunoCertificado.js
    │
    └── Program.cs

------------------------------------------------------------------------

## 🧠 Páginas Principais

### 🔹 Login (`Login.cshtml`)

Formulário de login com ícones, validações e botão de mostrar senha.

### 🔹 Criar Usuário (`Users/Create.cshtml`)

Permite ao administrador registrar um novo colaborador com **usuário,
e-mail e senha**.

### 🔹 Dashboard (`Home/Index.cshtml`)

Painel administrativo para visualizar e gerenciar usuários e
certificados.

### 🔹 Criar Certificado (`Certificados/Create.cshtml`)

Interface interativa para criar certificados personalizados e configurar
estilo de texto.

### 🔹 Página de Erro (`Shared/Error.cshtml`)

Mostra mensagens de erro amigáveis com motivo e botão para retornar ao
início.

------------------------------------------------------------------------

## ⚙️ Tecnologias Utilizadas

  Categoria        Tecnologia
  ---------------- ---------------------------------------------------------
  Backend          ASP.NET Core 8 MVC
  Frontend         Razor Pages, Bootstrap 5, Animate.css, FontAwesome
  Linguagem        C#
  Banco de Dados   SQLite (ou SQL Server, dependendo da configuração)
  Scripts          JavaScript (html2canvas, interações e pré-visualização)
  CSS              Customizado (NeoAuth Style System)

------------------------------------------------------------------------

## 💡 Como Usar

### 1️⃣ Clonar o Projeto

``` bash
git clone https://github.com/seuusuario/NeoAuth.git
cd NeoAuth
```

### 2️⃣ Configurar o Banco de Dados

-   No arquivo `appsettings.json`, defina a **string de conexão** para
    SQLite ou SQL Server.

Exemplo (SQLite):

``` json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=neoauth.db"
}
```

### 3️⃣ Executar Migrações

``` bash
dotnet ef database update
```

### 4️⃣ Rodar o Projeto

``` bash
dotnet run
```

### 5️⃣ Acessar no Navegador

    https://localhost:7253

------------------------------------------------------------------------

## 🔑 Estrutura de Permissões

  Tipo de Usuário   Permissões
  ----------------- --------------------------------------------------
  **Admin**         Criar, editar e excluir usuários e certificados
  **Colaborador**   Criar e editar certificados
  **Aluno**         Acesso apenas para visualização dos certificados

------------------------------------------------------------------------

## 📦 Scripts e Funcionalidades JS

### `certificate-form.js`

Gerencia o preview do certificado e os elementos arrastáveis.

### `configNomeAlunoCertificado.js`

Responsável por carregar e renderizar campos editáveis dinamicamente.

------------------------------------------------------------------------

## 🎨 Estilos Customizados

O projeto segue o padrão **NeoAuth Design System**, com: - Cores escuras
e contraste suave. - Bordas arredondadas. - Efeitos `hover` e
`fade-in`. - Animações `animate.css`. - Ícones `Bootstrap Icons` e
`FontAwesome`.

------------------------------------------------------------------------

## 🧰 Dependências Externas

-   [Bootstrap 5](https://getbootstrap.com/)
-   [FontAwesome 6](https://fontawesome.com/)
-   [Animate.css](https://animate.style/)
-   [html2canvas](https://html2canvas.hertzen.com/)
-   [Google Fonts](https://fonts.google.com/)

------------------------------------------------------------------------

## 🛠️ Possíveis Melhorias Futuras

-   Implementar controle de logs de erro detalhado.
-   Adicionar suporte a envio de e-mail automático de certificados.
-   Criar sistema de assinatura digital do certificado.
-   Implementar editor drag-and-drop mais completo.

------------------------------------------------------------------------

## 👨‍💻 Autor

**Felipe**\
Desenvolvedor Fullstack e criador do sistema **NeoAuth**.

------------------------------------------------------------------------

## 🪪 Licença

Este projeto está sob a licença **MIT** --- você pode usar, modificar e
distribuir livremente.
