# 🏋️ Bootcamp Treinos API

<div align="center">

**API robusta** desenvolvida para o gerenciamento de planos de treino, exercícios e sessões, focada em performance e experiência do desenvolvedor.

[![Node.js](https://img.shields.io/badge/Node.js-v24+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.7-000000?style=flat&logo=fastify)](https://www.fastify.io/)
[![Prisma](https://img.shields.io/badge/Prisma-7.4-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Zod](https://img.shields.io/badge/Zod-Validação-3E67B1?style=flat&logo=zod)](https://zod.dev/)
[![Biome](https://img.shields.io/badge/Biome-Linter-60A5FA?style=flat&logo=biome)](https://biomejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://www.docker.com/)

</div>

---

## 🎯 Sobre

O **Bootcamp Treinos API** é uma solução completa para gestão fitness, permitindo que usuários criem planos de treino personalizados, organizem seus dias de atividades, detalhem exercícios e registrem suas sessões em tempo real.

| Recurso | Descrição |
| :--- | :--- |
| **Autenticação** | Login seguro via Email/Senha com Better Auth |
| **Gestão de Treinos** | Criação e organização de planos, dias e exercícios |
| **Sessões** | Registro de início e fim de cada treino em tempo real |
| **Documentação** | Interface interativa Scalar em `/docs` |
| **Validação** | Tipagem estática rigorosa com Zod |

---

## 🛠 Tecnologias

| Tecnologia | Versão | Descrição |
| :--- | :--- | :--- |
| **Node.js** | 24+ | Runtime JavaScript de alta performance |
| **Fastify** | 5.7 | Framework web focado em baixa sobrecarga |
| **TypeScript** | 5.9 | Superset JavaScript com tipagem estática |
| **Prisma** | 7.4 | ORM moderno para Node.js e TypeScript |
| **PostgreSQL** | 17 | Banco de dados relacional robusto |
| **Better Auth** | 1.5 | Solução completa de autenticação |
| **Zod** | 3.24 | Validação de schemas e inferência de tipos |
| **Biome** | 2.4 | Toolchain rápida para formatação e lint |
| **tsx** | 4.21 | Executor de TypeScript nativo |

---

## 🏗 Arquitetura

### Fluxo de Aplicação


```mermaid
graph TD
    A[Usuário] -->|Requisição| B[Fastify Server]
    B -->|Proxy| C[Better Auth]
    B -->|Validação Zod| D[Handlers/Routes]
    D -->|ORM| E[Prisma Client]
    E -->|Persistência| F[(PostgreSQL)]
    B -->|Docs| G[Scalar /docs]
```

---

## ⚙️ Configuração

### 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
PORT=8080
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
# Configurações adicionais do Better Auth caso necessário
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:8080
```

### 🗄 Banco de Dados

Certifique-se de ter um PostgreSQL rodando. Você pode utilizar o `docker-compose.yml` incluso:

```bash
docker compose up -d
```

Aplique as migrações:

```bash
npx prisma generate
npx prisma migrate dev
```

---

## 🚀 Execução

### 🔧 Pré-requisitos

- Node.js >= 24
- pnpm

### 🛠 Instalação

```bash
pnpm install
```

### 📡 Desenvolvimento

```bash
pnpm run dev
```

### 🧹 Lint & Formatação

```bash
pnpm run format
```

---

## 📘 Documentação da API

A documentação interativa completa (Swagger/Scalar) está disponível em:
👉 `http://localhost:8080/docs`

Aqui você encontrará todos os modelos de dados e poderá testar as rotas diretamente do navegador.

---

## 🔒 Autenticação

A API utiliza o **Better Auth** para gerenciar sessões e autenticação.

- **Endpoint Base**: `/api/auth/*`
- **Métodos**: Suporta Email/Senha e outros adaptadores configurados.
- **Persistência**: As sessões são armazenadas no banco via adaptador Prisma.

---

## 🗺 Banco de Dados (ERD)

Abaixo, a representação visual das entidades do sistema:

```mermaid
erDiagram
    User ||--o{ WorkoutPlan : "possui"
    WorkoutPlan ||--o{ WorkoutDay : "contém"
    WorkoutDay ||--o{ WorkoutExercise : "inclui"
    WorkoutDay ||--o{ WorkoutSession : "registra"
    
    User {
        string id PK
        string name
        string email
        datetime createdAt
    }
    
    WorkoutPlan {
        string id PK
        string name
        boolean isActive
        string userId FK
    }
    
    WorkoutDay {
        string id PK
        string name
        enum weekDay
        boolean isRest
        string workoutPlanId FK
    }
    
    WorkoutExercise {
        string id PK
        string name
        int sets
        int reps
        int restTime
        string workoutDayId FK
    }
    
    WorkoutSession {
        string id PK
        datetime startedAt
        datetime completedAt
        string workoutDayId FK
    }
```

---

## 📝 UTC (Coordinated Universal Time)

UTC é o padrão global de referência para fusos horários. Não sofre ajuste de horário de verão e é definido com base em relógios atômicos de alta precisão. Na API, todas as datas de sessões são tratadas em UTC para garantir consistência.

