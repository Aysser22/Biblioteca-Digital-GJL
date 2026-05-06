# 📚 Biblioteca Digital GJL

## Descrição do Projeto

A **Biblioteca Digital GJL** é uma plataforma inovadora de gerenciamento de acervo para a Escola Estadual Geraldo Jardim Linhares. O sistema integra tecnologia de digitalização, gestão de dados com blockchain e experiência personalizada para alunos, transformando a forma como a comunidade escolar interage com a literatura.

> **Missão:** Democratizar o acesso ao conhecimento através de uma biblioteca digital segura, transparente e gamificada, que incentiva a leitura entre os estudantes.

---

## 🎯 Funcionalidades Principais

### 1️⃣ Digitalização e Processamento de Acervo
Transformação de livros físicos em registros digitais através de processamento inteligente:

- **Captura de Dados:** Upload de informações do livro (título, autor, ISBN, categoria)
- **Processamento por OCR:** Extração automatizada de texto de capas e páginas
- **Validação Inteligente:** Sistema de checagem de campos obrigatórios e detecção de duplicatas
- **Indexação:** Armazenamento estruturado com metadados padronizados

📷 *[Sugestão: Adicionar diagrama visual do fluxo de digitalização aqui]*

### 2️⃣ Sistema de Busca e Recomendação
Experiência personalizada que aprende com o perfil de cada aluno:

- **Autenticação Segura:** Login com credenciais de estudante
- **Histórico Inteligente:** Rastreamento de livros lidos e preferências
- **Busca Avançada:** Filtro por gênero, autor, ISBN ou título
- **Recomendações Personalizadas:** Sugestões baseadas em histórico de leitura
- **Dupla Modalidade:** Acesso a versões digitais ou reserva de livros físicos

📸 *[Sugestão: Inserir mockup da interface de busca com filtros]*

### 3️⃣ Gamificação com Blockchain (Solana)
Sistema de incentivos que reconhece e recompensa leitores ativos:

- **Tokens de Leitura:** Pontos ganhos por cada livro completado
- **Ranking de Super Leitores:** Leaderboard transparente e imutável
- **Prêmios Escolares:** Conversão de pontos em reconhecimento e benefícios
- **Sistema de Conquistas:** Badges e certificados de leitura

---

## 🏗️ Arquitetura do Sistema

### Bastidores da Organização
O desafio da padronização de dados começa no tratamento da informação bruta:

```
🔴 CAOS INICIAL
   ↓
   ├─ Identificação de dados inconsistentes
   ├─ Definição de regras de preenchimento
   ├─ Construção de filtros de validação
   ↓
🟢 HARMONIA NO SISTEMA
   └─ Todos os dados salvos em padrão único
```

### Fluxo de Digitalização e Cadastro

```
👤 Usuário Insere Dados
   ↓
📸 Processamento de Imagem (OCR)
   ↓
✅ Validação e Checagem de Duplicatas
   ↓
💾 Armazenamento em Banco de Dados
   ↓
📖 Livro Ativo no Catálogo
```

*[Sugestão: Criar diagrama visual com ícones para cada etapa]*

### Jornada do Aluno: Descoberta e Leitura

```
1. 🌐 Acesso à Plataforma
   ↓
2. 🔐 Login com Credenciais Escolares
   ↓
3. 👤 Carregamento de Perfil e Histórico
   ↓
4. 🔍 Busca por Livro ou Filtro de Gênero
   ↓
5. 🎯 Recomendações Personalizadas
   ↓
6. 📚 Seleção: Ler Digital ou Reservar Físico
   ↓
7. ✨ Registro de Leitura e Feedback
```

*[Sugestão: Storyboard visual mostrando aluno em cada etapa]*

---

## 🔗 Integração com Blockchain (Solana)

### Por Que Solana?

Nossa escolha por blockchain Solana é fundamentada em três pilares estratégicos:

#### 1. **Transparência Total** 🔍
- Visibilidade completa do acervo escolar
- Relatórios públicos de livros mais lidos
- Impossibilidade de manipulação de dados
- Auditoria permanente de transações

#### 2. **Segurança de Dados** 🔐
- **Proteção permanente:** Registros imutáveis em blockchain
- **Redundância natural:** Dados distribuídos em múltiplos nós
- **Backup automático:** Independente de infraestrutura local
- **Privacidade:** Criptografia de dados sensíveis de alunos

#### 3. **Gamificação e Incentivos** 🎮
- **Token de Leitura:** Recompensa por atividade
- **Ranking Transparente:** Leaderboard verificável
- **Smart Contracts:** Premação automática e confiável
- **Engajamento Sustentado:** Motivação baseada em valor tangível

---

## 🛠️ Stack Tecnológico

| Componente | Tecnologia |
|-----------|-----------|
| **Blockchain** | Solana |
| **Smart Contracts** | Rust / Anchor |
| **Frontend** | [A confirmar] |
| **Backend** | [A confirmar] |
| **Banco de Dados** | [A confirmar] |
| **OCR** | Tesseract / Cloud Vision |
| **Autenticação** | [A confirmar] |

---

## 👥 Públicos-Alvo

- **Alunos:** Acesso a acervo digitalizado com recomendações personalizadas
- **Professores:** Gestão de reservas e acompanhamento de leitura
- **Bibliotecários:** Dashboard administrativo para gestão do acervo
- **Gestores Escolares:** Relatórios e analytics de utilização
- **Comunidade:** Acesso parcial conforme políticas da escola

---

## 🚀 Benefícios Esperados

✅ **Acesso Democrático:** Biblioteca 24/7, dentro e fora da escola  
✅ **Descoberta Facilitada:** Recomendações personalizadas aumentam engajamento  
✅ **Dados Protegidos:** Blockchain garante segurança e transparência  
✅ **Incentivo à Leitura:** Gamificação motiva alunos a lerem mais  
✅ **Preservação Digital:** Acervo protegido de perda física  

---

## 📊 Exemplo de Caso de Uso

### Maria, Aluna do 8º Ano

1. Maria acessa a biblioteca digital pelo celular
2. Autentica com suas credenciais (RA escolar)
3. O sistema mostra: "Maria, você leu 5 livros deste ano! 🏆"
4. Descobre "Mistério no Colégio" recomendado porque leu "Percy Jackson"
5. Lê o livro em 2 semanas, ganha 10 tokens Solana
6. Os tokens a colocam no top 20 de leitores do mês
7. Converte pontos em 1 ingresso para evento literário da escola

---

## 📐 Protótipo e Esboço

**Explore a versão inicial do projeto:**


**Explore a versão inicial do projeto:**

[📋 Esboço do Projeto (Google Apps Script)](https://script.google.com/macros/s/AKfycbzZfvktRGej3WFRGLM1FoBVJfiO4xkgC5wt1Gry6icsL5HO3sQGv8HiEwbDpKoz9Vq_/exec)

---

## 📝 Próximas Fases

- [ ] Design de UI/UX finalizado
- [ ] Desenvolvimento de API REST
- [ ] Integração com Solana Devnet
- [ ] Testes beta com grupo piloto de alunos
- [ ] Deploy em produção
- [ ] Programa de formação de usuários

---

## 📞 Contato e Contribuição

Para contribuir ou obter mais informações sobre o projeto, entre em contato com a equipe de desenvolvimento.
ayssertaborda4@gmail.com    vandinhoesv56@gmail.com   lucasgusbatera@gmail.com


---

**Biblioteca Digital GJL** | Por uma escola melhor conectada com a leitura 📚✨

