# MANEJA Frontend

<p>
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-20232A?logo=react&logoColor=61DAFB" />
  <img alt="Expo" src="https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img alt="NativeWind" src="https://img.shields.io/badge/NativeWind-38BDF8?logo=tailwindcss&logoColor=white" />
  <img alt="TanStack Query" src="https://img.shields.io/badge/TanStack%20Query-FF4154?logo=reactquery&logoColor=white" />
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-443E38?logoColor=white" />
  <img alt="React Hook Form" src="https://img.shields.io/badge/React%20Hook%20Form-EC5990?logo=reacthookform&logoColor=white" />
  <img alt="Zod" src="https://img.shields.io/badge/Zod-3E67B1?logo=zod&logoColor=white" />
  <img alt="Axios" src="https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white" />
</p>

<p>
  Aplicação mobile para apoio ao gerenciamento de propriedades rurais e atividades de manejo.
</p>

## Sobre o projeto

O **MANEJA** é uma aplicação voltada ao apoio do gerenciamento de propriedades rurais, com foco na organização das informações utilizadas no manejo e acompanhamento do rebanho.

Este repositório contém o **frontend mobile** da aplicação, responsável pela experiência do usuário, navegação entre os fluxos da aplicação e integração com a API do projeto.


## Funcionalidades

Atualmente, o frontend possui suporte para:

- cadastro de usuários;
- autenticação;
- gerenciamento de sessão;
- renovação de sessão com refresh token;
- recuperação de senha por código enviado por e-mail;
- redefinição de senha;
- navegação entre fluxos públicos e autenticados;
- integração com a MANEJA API.

Novas funcionalidades relacionadas à gestão da propriedade e do rebanho serão adicionadas conforme a evolução do projeto.


## Principais fluxos

### Autenticação

```text
Cadastro / Login
      ↓
Autenticação na API
      ↓
Armazenamento da sessão
      ↓
Identificação do usuário
      ↓
Acesso à aplicação
```

### Recuperação de senha

```text
Informar e-mail
      ↓
Receber código de verificação
      ↓
Validar código
      ↓
Criar nova senha
      ↓
Retornar ao login
```


## Pré-requisitos

Antes de executar o projeto, tenha instalado:

![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Npm](https://img.shields.io/badge/Npm-2C8EBB?style=flat&logo=&logoColor=white)
![Expo Go](https://img.shields.io/badge/Expo%20Go-000020?style=flat&logo=expo&logoColor=white)

Para utilizar funcionalidades que dependem de dados persistentes, a **MANEJA API** também deve estar em execução.

## Executando o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Leafth/maneja-frontend.git
```

Entre no diretório:

```bash
cd maneja-frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto.

```env
EXPO_PUBLIC_API_URL=http://SEU_IP:3000/api/v1
```

> Em um dispositivo físico, `localhost` aponta para o próprio dispositivo. Para acessar uma API executada no computador, utilize o endereço IP da máquina na rede.

### 4. Inicie o Expo

```bash
npx expo start
```

Escaneie o QR Code utilizando o **Expo Go** ou abra a aplicação através de um ambiente Android/iOS configurado.

### Limpando o cache

```bash
npx expo start --clear
```

## Scripts

Os principais comandos utilizados durante o desenvolvimento são:

```bash
# Iniciar o projeto
npx expo start

# Iniciar limpando o cache
npx expo start --clear

# Verificar o código com o lint
npm run lint
```

---

## Estrutura do projeto

A aplicação utiliza `src/app` como raiz do Expo Router e organiza as funcionalidades por feature. As responsabilidades e regras entre essas camadas estão descritas em **[ARCHITECTURE.md](./ARCHITECTURE.md)**.


## Integração com a API

O frontend utiliza a **MANEJA API** para autenticação e demais funcionalidades persistentes.

Repositório: [MANEJA API](https://github.com/Leafth/maneja-api)

A URL base utilizada pela aplicação é definida por:

```env
EXPO_PUBLIC_API_URL
```

Ao testar em dispositivo físico, certifique-se de que o dispositivo consegue acessar a máquina onde a API está sendo executada.

## Documentação

A documentação do projeto está dividida da seguinte forma:

| Arquivo | Conteúdo |
| --- | --- |
| `README.md` | Visão geral, tecnologias, configuração e execução |
| `CONTRIBUTING.md` | Padrões que devem ser seguidos durante o desenvolvimento |
| `ARCHITECTURE.md` | Arquitetura, camadas e responsabilidades estruturais |

- **[Guia de desenvolvimento](./CONTRIBUTING.md)**
- **[Arquitetura do projeto](./ARCHITECTURE.md)**
