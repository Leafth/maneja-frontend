# Guia de Desenvolvimento - MANEJA Frontend

Este documento define os padrões que devem ser seguidos durante o desenvolvimento do **MANEJA Frontend**.

O objetivo é manter o código consistente entre os membros da equipe, facilitar revisões e evitar que novas funcionalidades sejam implementadas seguindo estruturas diferentes das já adotadas no projeto.

> Antes de adicionar algo que altere a estrutura, os padrões ou o fluxo de desenvolvimento do projeto, alinhe a mudança com a equipe.

> Instruções de instalação e execução devem ficar no `README.md`. Explicações e decisões arquiteturais devem ficar no `ARCHITECTURE.md`.

---

## Desenvolvimento de uma feature

O desenvolvimento de uma nova feature deve seguir, preferencialmente, a ordem abaixo:

1. DTOs
2. Models
3. Mappers
4. Services
5. Hooks
6. Stores, quando necessário
7. Schemas
8. ViewModels
9. Views e Components
10. Routes

Essa ordem parte das camadas mais próximas da API e avança até a interface.

As regras específicas de cada uma dessas camadas serão documentadas e refinadas conforme o projeto evoluir. Quando houver dúvida sobre dependências entre camadas ou responsabilidades arquiteturais, consulte o `ARCHITECTURE.md`.

---

## Padrões de nomenclatura

A nomenclatura deve ser previsível e consistente em todo o projeto.

### Arquivos técnicos

Arquivos de models, DTOs, services, schemas, stores, hooks e view models devem utilizar **kebab-case**.

Exemplos:

```text
auth.service.ts
user.model.ts
reset-password.model.ts
login.dto.ts
login.schema.ts
password-reset.store.ts
use-login.ts
use-login.view-model.ts
```

Quando existir um sufixo que identifique a responsabilidade do arquivo, ele deve ser mantido.

```text
.model.ts
.dto.ts
.schema.ts
.service.ts
.store.ts
.view-model.ts
```

### Components e Views

Components e Views devem utilizar **PascalCase**.

Exemplos:

```text
SignUpView.tsx
Greetings.tsx
CreateNewPasswordView.tsx
HomeView.tsx
SignInBottomSheet.tsx
```

O nome exportado pelo componente deve seguir o mesmo padrão:

```tsx
export function CreateNewPasswordView() {
  // ...
}
```

### Funções e variáveis

Funções e variáveis devem utilizar **camelCase**.

```ts
const resetToken = '...';

function handleForgotPassword() {
  // ...
}

async function resetPassword() {
  // ...
}
```

Hooks devem sempre iniciar com `use`.

```ts
useLogin()
useMe()
useResetPassword()
useLoginViewModel()
```

### Tipos e interfaces

Tipos e interfaces devem utilizar **PascalCase**.

```ts
type LoginFormData = {
  // ...
};

interface PasswordResetState {
  // ...
}
```

### Constantes

Constantes globais ou valores fixos compartilhados podem utilizar **UPPER_SNAKE_CASE**.

```ts
const PASSWORD_MIN_LENGTH = 8;
```

## Imports e exports

Sempre que possível, utilize o alias `@/` para importar arquivos fora do módulo atual.

Prefira:

```ts
import { Button } from '@/shared/components/Button';
```

Evite caminhos relativos longos:

```ts
import { Button } from '../../../../shared/components/Button';
```

Imports relativos podem ser utilizados entre arquivos próximos da mesma feature.

```ts
import { useLogin } from '../hooks';
import { authService } from '../services';
```

Quando o import for utilizado somente como tipo, utilize `import type`.

```ts
import type { User } from '../models';
```

### Casing dos imports

O caminho do import deve respeitar exatamente as letras maiúsculas e minúsculas do arquivo ou diretório.

Correto:

```ts
import { Button } from '@/shared/components/Button';
```

Evite:

```ts
import { Button } from '@/shared/components/button';
```

Isso é importante porque sistemas como Windows podem aceitar diferenças de capitalização que posteriormente causam erro em ambientes Linux, CI ou build.

### Barrel files

Arquivos `index.ts` podem ser utilizados para centralizar exports dentro de um módulo ou camada.

Exemplo:

```ts
export { useLogin } from './use-login';
export { useLogout } from './use-logout';
export { useMe } from './use-me';
```

Evite criar um único barrel global que concentre exports de todo o projeto.

---

## Requisições e acesso à API

Toda integração com a API deve respeitar o fluxo definido na arquitetura do projeto.

Antes de implementar uma nova integração, consulte o `ARCHITECTURE.md` para verificar as responsabilidades de Views, ViewModels, Hooks, Services, Mappers e DTOs.

Como regra geral, não crie chamadas HTTP diretamente dentro de Views ou Components.

A implementação deve seguir os padrões já estabelecidos no projeto e evitar atalhos entre camadas sem alinhamento prévio com a equipe.

---

## Fluxo Git

O projeto utiliza duas branches principais:

```text
main
develop
```

O fluxo padrão é:

```text
feature/*  ─┐
fix/*      ─┤
refactor/* ─┤──> develop ──> main
docs/*     ─┤
chore/*    ─┘
```

A `develop` concentra o desenvolvimento integrado da próxima versão.

A `main` deve representar uma versão estável do projeto e só deve receber alterações vindas da `develop`.

Não desenvolva funcionalidades diretamente em `main` ou `develop`.

### Criando uma branch

Antes de iniciar uma nova tarefa, atualize a `develop`:

```bash
git switch develop
git pull origin develop
```

Depois crie uma branch específica para a alteração.

Nova funcionalidade:

```bash
git switch -c feature/password-reset
```

Correção:

```bash
git switch -c fix/auth-interceptor
```

Refatoração:

```bash
git switch -c refactor/auth-hooks
```

Documentação:

```bash
git switch -c docs/contributing
```

Manutenção:

```bash
git switch -c chore/update-dependencies
```

### Nomenclatura das branches

Utilize nomes curtos, descritivos e em **kebab-case**.

```text
feature/password-reset
feature/property-management
fix/auth-interceptor
refactor/auth-hooks
docs/contributing
chore/update-dependencies
```

### Commits

As mensagens de commit devem ser escritas em **português** e seguir o padrão de Conventional Commits.

Tipos principais:

- `feat`: nova funcionalidade
- `fix`: correção de comportamento
- `refactor`: alteração interna sem adicionar funcionalidade nem corrigir bug
- `docs`: documentação
- `chore`: configuração ou manutenção

### Pull Requests

Ao finalizar uma tarefa, envie a branch para o repositório e abra um Pull Request para a `develop`.

Exemplo:

```text
feature/password-reset -> develop
```

Um bom Pull Request deve:

- tratar de uma alteração ou objetivo bem definido;
- possuir título claro e objetivo;
- explicar resumidamente o que foi alterado;
- informar como a alteração foi validada;
- incluir screenshots quando houver mudanças relevantes de interface;
- evitar arquivos ou alterações que não façam parte do objetivo da branch;
- estar atualizado com a `develop` antes do merge;
- estar livre de conflitos;
- permitir que outro desenvolvedor entenda a mudança sem precisar interpretar todo o diff.

Quando uma mudança exigir alteração dos padrões existentes do projeto, isso deve ser destacado no Pull Request e alinhado com a equipe antes do merge.

---

## Checklist antes de subir uma alteração

Antes de fazer push e abrir um Pull Request, verifique:

- [ ] A branch foi criada a partir da `develop` atualizada.
- [ ] A nomenclatura dos arquivos, funções, componentes e variáveis segue o padrão do projeto.
- [ ] A estrutura da feature segue as convenções existentes.
- [ ] O fluxo definido no `ARCHITECTURE.md` foi respeitado.
- [ ] Não existem chamadas HTTP diretas em Views ou Components.
- [ ] Imports utilizam os caminhos e o casing corretos.
- [ ] Não existem imports relativos desnecessariamente longos.
- [ ] Não existem `console.log` utilizados apenas para debug.
- [ ] Não existe código comentado ou temporário sem necessidade.
- [ ] Nenhuma informação sensível foi adicionada ao repositório.
- [ ] O lint e a verificação de tipos não apresentam novos erros.
- [ ] A alteração foi validada manualmente no fluxo afetado.
- [ ] A branch está atualizada e sem conflitos com a `develop`.
- [ ] O Pull Request será aberto contra a `develop`.

---

Este guia deve evoluir junto com o projeto. Novos padrões podem ser adicionados conforme a equipe consolide novas decisões de desenvolvimento.
