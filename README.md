# 🏋️ TreinAI API

<div align="center">

🌍 **API em Produção:** [api.treinai.space](https://api.treinai.space)

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

## 🎯 Sobre o Projeto

O **TreinAI API** (anteriormente designado como Bootcamp Treinos) é o núcleo fundacional de uma plataforma robusta projetada para revolucionar o ecossistema de gestão e planejamento fitness. Construída focando em escalabilidade severa e alta performance, esta API atende à necessidade crescente de uma personalização fina nos treinamentos físicos. Por meio desta arquitetura limpa, não só profissionais como os próprios utilizadores podem estruturar detalhadamente suas jornadas: desde a conceitualização de planos globais de treino, até a orquestração minuciosa de dias ativos, ciclos de descanso e baterias rigorosas de exercícios parametrizados.

Indo além dos moldes tradicionais e estáticos, o sistema destaca-se por prover um aparato completo para o registro dinâmico e em "tempo real" das sessões ativas. O motor processual não apenas capta, mas assegura com precisão os instantes exatos de início e conclusão de cada rotina completada. Essa manipulação temporal é severamente gerenciada atrelada ao relógio universal (UTC), anulando divergências geográficas ou surpresas decorrentes dos horários de verão globais.

A segurança, a precisão e a resiliência não são tratadas como atributos, mas sim fundações. Incorporamos um paradigma moderno de defesa estabelecendo sessões blindadas por meio do **Better Auth**. Paralelamente, qualquer tentativa de manipulação de dados em nossa malha de rotas (Fastify) é rigorosamente enquadrada e validada pelo Zod, estabelecendo contratos imutáveis antes mesmo da persistência em nosso banco PostgreSQL. Como culminação natural da nossa ênfase numa "Developer Experience" (DX) premium, expomos dinamicamente nossas coleções tipadas via documentação interativa com Scalar, agilizando drasticamente os ciclos de integração com os ecossistemas front-end.

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
    A[Usuário/Frontend] -->|Requisição| B[Fastify Server]
    B -->|Middleware| C[Better Auth]
    B -->|Validação Zod| D[Handlers/Routes]
    D -->|ORM| E[Prisma Client]
    E -->|Persistência| F[(PostgreSQL)]
    B -->|Docs| G[Scalar /docs]
```

---

## 🗺 Modelo de Dados (ERD)

Abaixo, a representação visual detalhada das entidades do sistema:

```mermaid
erDiagram
    User ||--o{ WorkoutPlan : "possui"
    WorkoutPlan ||--o{ WorkoutDay : "contém"
    WorkoutDay ||--o{ WorkoutExercise : "inclui"
    WorkoutDay ||--o{ WorkoutSession : "registra"
    User ||--o{ Session : "autenticação"
    User ||--o{ Account : "autenticação"
    
    User {
        string id PK
        string name
        string email
        boolean emailVerified
        string image
        int weightInGrams
        int heightInCentimeters
        int age
        int bodyFatPercentage
        datetime createdAt
        datetime updatedAt
    }
    
    WorkoutPlan {
        string id PK
        string name
        boolean isActive
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    WorkoutDay {
        string id PK
        string name
        boolean isRest
        enum weekDay
        int estimatedDurationInSeconds
        string coverImageUrl
        string workoutPlanId FK
        datetime createdAt
        datetime updatedAt
    }
    
    WorkoutExercise {
        string id PK
        string name
        int order
        int sets
        int reps
        int restTimeInSeconds
        string workoutDayId FK
        datetime createdAt
        datetime updatedAt
    }
    
    WorkoutSession {
        string id PK
        datetime startedAt
        datetime completedAt
        string workoutDayId FK
        datetime createdAt
        datetime updatedAt
    }
```

---

## ⚙️ Configuração

### 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto considerando o `.env.example` ou use as configurações abaixo:

```env
PORT=8080
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
# Configurações do Better Auth
BETTER_AUTH_SECRET="sua_chave_secreta"
BETTER_AUTH_URL="http://localhost:8080"
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

A documentação interativa completa (Swagger/Scalar) está disponível na URL de produção:
👉 `https://api.treinai.space/docs`

(Ou em desenvolvimento ambiente local via `http://localhost:8080/docs`)

Aqui você encontrará todos os modelos de dados e poderá testar as rotas diretamente do navegador.

---

## 🔒 Autenticação

A API utiliza o **Better Auth** para gerenciar sessões e autenticação.

- **Endpoint Base**: `/api/auth/*`
- **Métodos**: Suporta Email/Senha e outros adaptadores configurados.
- **Persistência**: As sessões são armazenadas no banco via adaptador Prisma.

---

## 📝 UTC (Coordinated Universal Time)

UTC é o padrão global de referência para fusos horários. Não sofre ajuste de horário de verão e é definido com base em relógios atômicos de alta precisão. Na API, todas as datas de sessões são tratadas em UTC para garantir consistência.
