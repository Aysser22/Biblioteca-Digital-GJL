# Biblioteca-Digital-GJL
Projeto para digitalizar a Biblioteca da Escola Estadual Geraldo Jardim Linhares
# 📚 Biblioteca Digital GJL

Bastidores
Lidando com a Bagunça de Dados (O desafio da organização)
No início, os dados dos livros podem estar incompletos ou em formatos diferentes. O "bastidor" aqui é a sua luta para padronizar tudo.
## Descrição do Projeto

Identificação do Caos (Livros sem autor ou nomes errados) → Criação de Regras (Você decide o que é obrigatório preencher) → Construção de Filtros (O código limpa o que o usuário digita) → Harmonia no Sistema (Tudo fica salvo no mesmo padrão para não quebrar o site)
A **Biblioteca Digital GJL** é uma plataforma inovadora de gerenciamento de acervo para a Escola Estadual Geraldo Jardim Linhares. O sistema integra tecnologia de digitalização, gestão de dados com blockchain e experiência personalizada para alunos, transformando a forma como a comunidade escolar interage com a literatura.

> **Missão:** Democratizar o acesso ao conhecimento através de uma biblioteca digital segura, transparente e gamificada, que incentiva a leitura entre os estudantes.

---

## 🎯 Funcionalidades Principais

Fluxo de Digitalização e Cadastro
Este é o processo de transformar o livro físico em um registro digital no seu banco de dados.
### 1️⃣ Digitalização e Processamento de Acervo
Transformação de livros físicos em registros digitais através de processamento inteligente:

Ação do Usuário (Input de Dados/Foto) → Processamento de Imagem (OCR) (Extração de texto da capa/páginas) → 
→Validação do Sistema (Checagem de campos obrigatórios e duplicatas) → Armazenamento em Banco de Dados (Registro do arquivo digital e metadados) →
→Confirmação de Disponibilidade (Livro aparece como "Ativo" no catálogo).
- **Captura de Dados:** Upload de informações do livro (título, autor, ISBN, categoria)
- **Processamento por OCR:** Extração automatizada de texto de capas e páginas
- **Validação Inteligente:** Sistema de checagem de campos obrigatórios e detecção de duplicatas
- **Indexação:** Armazenamento estruturado com metadados padronizados

📷 *[Sugestão: Adicionar diagrama visual do fluxo de digitalização aqui]*

### 2️⃣ Sistema de Busca e Recomendação
Experiência personalizada que aprende com o perfil de cada aluno:

Jornada do Aluno (Descoberta e Leitura)
Este caminho foca em como o estudante sai da curiosidade para o conhecimento.
- **Autenticação Segura:** Login com credenciais de estudante
- **Histórico Inteligente:** Rastreamento de livros lidos e preferências
- **Busca Avançada:** Filtro por gênero, autor, ISBN ou título
- **Recomendações Personalizadas:** Sugestões baseadas em histórico de leitura
- **Dupla Modalidade:** Acesso a versões digitais ou reserva de livros físicos

Acesso Inicial (O aluno abre o site da biblioteca) → Identificação (Login) (Ele insere suas credenciais de estudante para acessar o acervo restrito) →
 Reconhecimento de Perfil (O sistema carrega o histórico e as preferências desse aluno específico) → O Desejo de Busca (Ele digita o nome de um livro ou filtra por um gênero como "Ficção") → A Curadoria dos Bastidores (O sistema cruza a busca com o que está disponível e o que o aluno gosta) →O Clique Decisivo (O aluno escolhe o livro e abre a versão digital ou reserva o físico) 
📸 *[Sugestão: Inserir mockup da interface de busca com filtros]*

A Conclusão (Ele fecha o livro, e o sistema registra: "Este usuário gosta desse estilo", alimentando o próximo ciclo).
### 3️⃣ Gamificação com Blockchain (Solana)
Sistema de incentivos que reconhece e recompensa leitores ativos:

O Porque escolhemos a tecnologia solana
Se alguém perguntar "por que complicar com tecnologia de cripto?", a resposta é baseada em três pilares:
- **Tokens de Leitura:** Pontos ganhos por cada livro completado
- **Ranking de Super Leitores:** Leaderboard transparente e imutável
- **Prêmios Escolares:** Conversão de pontos em reconhecimento e benefícios
- **Sistema de Conquistas:** Badges e certificados de leitura

Transparência Total: Todos podem ver quantos livros a escola tem e quais são os mais lidos, sem chance de manipulação de dados.
---

Segurança de Dados: O banco de dados da escola pode dar problema, mas o que está na Solana é permanente. Os registros de leitura dos alunos estão protegidos pela mesma tecnologia que protege moedas digitais.
## 🏗️ Arquitetura do Sistema

Incentivo (Gamificação): Você pode criar um sistema onde o aluno ganha um "ponto" (token) na Solana por cada livro lido. Esses pontos podem virar prêmios na escola ou apenas um ranking de "Super Leitores".
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

Link de um esboço do projeto:https://script.google.com/macros/s/AKfycbzZfvktRGej3WFRGLM1FoBVJfiO4xkgC5wt1Gry6icsL5HO3sQGv8HiEwbDpKoz9Vq_/exec
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

Para contribuir ou obter mais informações sobre o projeto, entre em contato com a equipe de desenvolvimento. ayssertaborda4@gmail.com    vandinhoesv56@gmail.com   lucasgusbatera@gmail.com


---

**Biblioteca Digital GJL** | Por uma escola melhor conectada com a leitura 📚✨
