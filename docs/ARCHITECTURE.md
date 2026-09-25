# Arquitetura - MANEJA Frontend

Este documento descreve a arquitetura adotada no **MANEJA Frontend**, a organização das camadas e as responsabilidades de cada parte da aplicação.

O objetivo é servir como referência para decisões estruturais e ajudar a equipe a manter consistência durante a evolução do projeto.

> Regras práticas de desenvolvimento, nomenclatura, branches e commits devem ser consultadas no `CONTRIBUTING.md`.

## 1. Visão geral da arquitetura

O MANEJA Frontend utiliza uma organização orientada a **features**, em que cada domínio da aplicação concentra seus próprios arquivos e responsabilidades.

A aplicação separa:

- apresentação;
- coordenação da interface;
- acesso a dados remotos;
- comunicação com a API;
- adaptação de dados;
- estado global;
- infraestrutura compartilhada.

O fluxo principal entre as camadas é:

```text
View
  ↓
ViewModel
  ↓
Hook
  ↓
Service
  ↓
Mapper
  ↓
DTO
  ↓
API
```

No retorno dos dados:

```text
API
 ↓
DTO
 ↓
Mapper
 ↓
Model
 ↓
Hook
 ↓
ViewModel
 ↓
View
```

Essa separação evita que responsabilidades de interface, requisição HTTP e transformação de dados fiquem misturadas.

## 2. Princípios adotados

A arquitetura do projeto segue os seguintes princípios:

- organização por domínio;
- separação de responsabilidades;
- dependências direcionadas entre camadas;
- isolamento do contrato da API;
- distinção entre estado local, remoto e global;
- reutilização de componentes compartilhados apenas quando forem realmente genéricos;
- baixo acoplamento entre interface e infraestrutura.

Mudanças que alterem esses princípios devem ser alinhadas com a equipe.


## 3. Estrutura de diretórios

A estrutura principal do projeto é:

```text
src/
├── app/
├── features/
├── infrastructure/
├── shared/
├── styles/
└── theme/
```

### `app/`

Contém as rotas da aplicação utilizando Expo Router.

Os arquivos dessa pasta devem permanecer simples e delegar a implementação visual e lógica para as features.

### `features/`

Contém as funcionalidades organizadas por domínio.

Exemplos:

```text
features/
├── auth/
├── home/
└── ...
```

Cada feature deve concentrar os arquivos relacionados à sua própria responsabilidade.

### `infrastructure/`

Contém implementações compartilhadas relacionadas à infraestrutura da aplicação.

Exemplos:

```text
infrastructure/
├── api/
└── storage/
```

Aqui ficam recursos como:

- cliente HTTP;
- interceptors;
- configuração da API;
- armazenamento seguro.

### `shared/`

Contém recursos reutilizáveis entre diferentes features.

Exemplo:

```text
shared/
└── components/
```

Componentes específicos de um domínio não devem ser colocados nessa pasta.

### `styles/`

Contém configurações e estilos globais da aplicação.

### `theme/`

Contém definições relacionadas ao tema e elementos visuais reutilizados no projeto.


## 4. Organização por features

Cada domínio deve ser organizado dentro de `src/features/`.

Uma feature pode seguir a seguinte estrutura:

```text
features/
└── auth/
    ├── components/
    ├── hooks/
    ├── mapper/
    ├── models/
    │   └── dtos/
    ├── schemas/
    ├── services/
    ├── stores/
    ├── viewmodels/
    └── views/
```

Nem toda feature precisa obrigatoriamente possuir todas essas pastas.

As pastas devem ser criadas conforme a necessidade da funcionalidade.

## 5. Fluxo entre camadas

### View

A View é responsável pela apresentação da interface.

Ela pode conter:

- JSX;
- componentes visuais;
- estados puramente visuais;
- interação direta do usuário.

Exemplo de estado visual:

```ts
const [showPassword, setShowPassword] = useState(false);
```

A View não deve realizar chamadas HTTP diretamente.

---

### ViewModel

O ViewModel coordena o comportamento da tela.

Pode ser responsável por:

- formulários;
- ações da interface;
- navegação;
- integração com stores;
- chamada de hooks;
- coordenação do fluxo da tela.

Exemplo conceitual:

```text
View
 ↓
useLoginViewModel
 ↓
useLogin
```

O ViewModel não deve acessar o Service diretamente quando existir um Hook responsável por aquela operação.

---

### Hooks

Os hooks dessa camada representam o acesso ao estado remoto da aplicação.

Eles encapsulam recursos como:

- `useQuery`;
- `useMutation`;
- cache;
- invalidação de dados;
- estados de carregamento;
- estados de erro relacionados à requisição.

Exemplo:

```ts
export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
  });
}
```

Os hooks não devem conter lógica visual específica da tela.

---

### Services

Os Services concentram a comunicação com a API.

São responsáveis por:

- definir chamadas aos endpoints;
- utilizar o cliente HTTP;
- trabalhar com DTOs;
- utilizar Mappers;
- retornar Models para as camadas superiores.

Exemplo conceitual:

```ts
authService.login()
authService.register()
authService.me()
```

Services não devem conhecer:

- componentes React;
- Views;
- ViewModels;
- navegação;
- estado visual.

---

### Mappers

Os Mappers fazem a conversão entre o formato usado pela API e o formato usado internamente no frontend.

Fluxos esperados:

```text
Model → DTO
DTO → Model
```

Exemplo:

```text
Frontend:
passwordConfirmation

API:
password_confirmation
```

Esse tipo de transformação deve permanecer concentrado nos Mappers.

---

### Models

Models representam os dados utilizados pelo frontend.

Eles devem seguir a convenção interna da aplicação, normalmente utilizando `camelCase`.

Exemplo:

```ts
export interface ResetPassword {
  resetToken: string;
  password: string;
  passwordConfirmation: string;
}
```

---

### DTOs

DTOs representam o contrato exato da API.

Eles devem preservar os nomes e formatos esperados ou retornados pelo backend.

Exemplo:

```ts
export interface ResetPasswordRequestDTO {
  reset_token: string;
  password: string;
  password_confirmation: string;
}
```

DTOs não devem chegar diretamente às Views.

## 6. Gerenciamento de estado

A aplicação utiliza soluções diferentes de acordo com o tipo de estado.

| Tipo de estado | Solução |
| --- | --- |
| Estado visual/local | `useState` |
| Estado de formulário | React Hook Form |
| Estado remoto/API | TanStack Query |
| Estado global do cliente | Zustand |
| Persistência sensível | SecureStore |

### Estado visual/local

Deve ser utilizado para informações exclusivas da interface.

Exemplos:

```text
senha visível ou escondida
modal aberto ou fechado
estado visual temporário
```

### Formulários

React Hook Form é responsável pelo estado dos formulários.

A validação é realizada com Zod.

### Estado remoto

TanStack Query gerencia os dados vindos da API, incluindo:

- queries;
- mutations;
- loading;
- erros;
- cache;
- invalidação.

### Estado global

Zustand é utilizado quando um estado precisa ser compartilhado entre diferentes partes da aplicação.

Exemplos:

```text
usuário autenticado
estado temporário compartilhado entre telas
```

Estado exclusivamente visual não deve ser movido para Zustand sem necessidade.

### Persistência sensível

Dados sensíveis que precisam permanecer persistidos devem utilizar uma solução apropriada, como SecureStore.

## 7. Infraestrutura

A infraestrutura compartilhada fica em:

```text
src/infrastructure/
```

Atualmente, os principais módulos são:

```text
infrastructure/
├── api/
└── storage/
```

### API

A camada de API concentra:

- configuração da URL base;
- clientes Axios;
- interceptors;
- tratamento relacionado à autenticação.

A aplicação possui clientes HTTP separados quando necessário para evitar dependências indevidas entre fluxos.

### Interceptors

Os interceptors são responsáveis por comportamentos transversais às requisições.

Exemplos:

- inclusão do access token;
- identificação de respostas `401`;
- tentativa de renovação de sessão;
- repetição da requisição original após refresh.

Rotas públicas não devem depender do fluxo de renovação da sessão.

### Storage

A camada de storage concentra a persistência relacionada à autenticação.

O projeto diferencia:

```text
access token
→ memória da aplicação

refresh token
→ armazenamento seguro
```

Essa separação evita manter informações sensíveis em stores globais sem necessidade.

## 8. Navegação

A aplicação utiliza Expo Router.

A estrutura de rotas é organizada principalmente em grupos:

```text
src/app/
├── (auth)/
└── (app)/
```

### `(auth)`

Contém rotas relacionadas a fluxos que não exigem uma sessão autenticada.

Exemplos:

- entrada;
- cadastro;
- recuperação de acesso.

### `(app)`

Contém as rotas da área autenticada da aplicação.

Os arquivos dentro de `src/app` devem permanecer simples.

Exemplo:

```tsx
import { SignUp } from '@/features/auth/views/SignUp';

export default function SignUpRoute() {
  return <SignUp />;
}
```

A implementação da tela deve permanecer dentro da feature correspondente.

## 9. Autenticação e sessão

A autenticação utiliza dois tipos principais de token:

```text
access token
refresh token
```

O fluxo geral é:

```text
Login
 ↓
access token + refresh token
 ↓
salvamento da sessão
 ↓
consulta do usuário autenticado
 ↓
estado global
 ↓
área autenticada
```

### Access token

O access token é utilizado para autenticar requisições protegidas.

Ele permanece em memória durante a execução da aplicação.

### Refresh token

O refresh token possui duração maior e é utilizado para renovar a sessão.

Ele é armazenado utilizando SecureStore.

### Renovação da sessão

Quando uma rota protegida retorna `401`, o interceptor pode tentar renovar a sessão utilizando o refresh token.

Após uma renovação bem-sucedida:

```text
novo access token
novo refresh token
```

são armazenados e a requisição original pode ser executada novamente.

Rotas públicas não devem iniciar automaticamente esse fluxo.

## 10. Componentes compartilhados

Componentes reutilizáveis por diferentes partes da aplicação ficam em:

```text
src/shared/components/
```

Exemplos:

```text
AppText
Button
FormGroup
Input
Logo
OtpInput
```

Componentes específicos de um domínio devem permanecer dentro da feature correspondente.

Exemplo:

```text
features/auth/components/SignInBottomSheet
```

A regra geral é:

```text
Componente genérico e reutilizável
→ shared/components

Componente que conhece um domínio específico
→ features/<feature>/components
```

## 11. Regras de dependência

As dependências entre camadas devem seguir um fluxo previsível.

```text
View
 ↓
ViewModel
 ↓
Hook
 ↓
Service
 ↓
Infrastructure
```

Models, DTOs e Mappers participam do fluxo de dados conforme necessário.

Regras principais:

```text
View não chama Service diretamente.

View não realiza chamada HTTP diretamente.

ViewModel utiliza Hooks para operações remotas.

Hook pode utilizar Service.

Service não conhece React.

DTO não chega diretamente à View.

Conversões entre API e frontend ficam nos Mappers.
```

Essas regras ajudam a manter as responsabilidades separadas e reduzem o acoplamento entre interface e infraestrutura.

## Referências do projeto

Para outras informações, consulte:

- [README.md](./README.md) — visão geral, configuração e execução;
- [CONTRIBUTING.md](./CONTRIBUTING.md) — padrões que devem ser seguidos durante o desenvolvimento.

Este documento deve evoluir conforme a arquitetura do projeto for refinada.
