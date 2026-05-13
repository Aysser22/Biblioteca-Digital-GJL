import { useCallback, useEffect, useMemo, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { IDL } from "./idl";

const ENV_PROGRAM_ID = import.meta.env.VITE_PROGRAM_ID;
const ENV_MINT_ADDRESS = import.meta.env.VITE_MINT_ADDRESS;
const DEFAULT_PROGRAM_ID = "Biblibrary11111111111111111111111111111111111";
const DEFAULT_MINT = "ReplaceWithYourMintAddressHere";

type UserAccountData = {
  owner: string;
  xp: number;
  level: number;
  totalTokens: number;
  booksRead: string[];
};

type Book = {
  id: string;
  isbn: string;
  title: string;
  author: string;
  description: string;
  rating: number;
  pages: number;
  genre: string[];
  coverUrl?: string;
  publishedYear: number;
  language: string;
  content?: string; // Trecho do livro para leitura
};

type ReadingList = {
  id: string;
  name: string;
  description: string;
  books: string[];
  isPublic: boolean;
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  xpReward: number;
};

const allBooks: Book[] = [
  {
    id: "1",
    isbn: "9780451524935",
    title: "1984",
    author: "George Orwell",
    description: "Uma distopia clássica sobre vigilância totalitária e controle mental em uma sociedade opressiva.",
    rating: 4.8,
    pages: 328,
    genre: ["Distopia", "Ficção Científica", "Política"],
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
    publishedYear: 1949,
    language: "Inglês",
    content: `Era um dia luminoso e frio de abril, e os relógios batiam treze horas. Winston Smith, com o queixo enfiado no peito para escapar do vento cruel, deslizou rapidamente pelas portas de vidro das Mansões Vitória, embora não tão rapidamente para evitar que uma nuvem de poeira de areia entrasse junto com ele.

    O saguão cheirava a repolho cozido e a esteiras velhas. Num canto distante, um pôster colado à parede olhava para baixo com olhos enormes. Era um dos que mostrava simplesmente um rosto enorme, com mais de um metro de largura: o rosto de um homem de uns quarenta e cinco anos, com um bigode preto espesso e feições que retinham uma espécie de nobreza rude. Winston dirigiu-se para as escadas. Era inútil tentar o elevador. Mesmo nos melhores tempos raramente funcionava, e agora a eletricidade era cortada durante o dia. Era parte da campanha de economia no preparo para a Semana do Ódio.`
  },
  {
    id: "2",
    isbn: "9780156012195",
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    description: "Uma jornada filosófica através dos olhos de uma criança, explorando temas de amizade, amor e humanidade.",
    rating: 4.7,
    pages: 96,
    genre: ["Infantil", "Filosofia", "Clássico"],
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg",
    publishedYear: 1943,
    language: "Francês",
    content: `Quando eu tinha seis anos vi uma vez uma imagem magnífica num livro sobre a Floresta Virgem que se chamava "Histórias Vivas". Representava uma serpente jiboia engolindo um animal. Eis a cópia do desenho.

    No livro estava escrito: "As jiboias engolem a presa inteira, sem mastigar. Depois não podem mover-se e dormem durante os seis meses da digestão."

    Pensei muito então nas aventuras da selva e, por minha vez, consegui traçar com um lápis de cor um desenho. Meu desenho número 1. Era assim:

    Mostrei minha obra-prima aos adultos e perguntei-lhes se o meu desenho lhes fazia medo.

    Responderam-me: "Por que um chapéu faria medo a alguém?"

    Meu desenho não representava um chapéu. Representava uma jiboia digerindo um elefante. Desenhei então o interior da jiboia, a fim de que os adultos pudessem compreender. Eles têm sempre necessidade de explicações.`
  },
  {
    id: "3",
    isbn: "9780141439518",
    title: "Orgulho e Preconceito",
    author: "Jane Austen",
    description: "Uma história romântica sobre Elizabeth Bennet e Mr. Darcy, explorando preconceitos sociais e amor verdadeiro.",
    rating: 4.6,
    pages: 432,
    genre: ["Romance", "Clássico", "Sociedade"],
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
    publishedYear: 1813,
    language: "Inglês",
    content: `É uma verdade universalmente conhecida que um homem solteiro, possuidor de uma boa fortuna, deve estar necessitado de uma esposa.

    Por pouco que se conheçam os sentimentos ou as opiniões desse homem a respeito do assunto, essa verdade fica tão bem fixada na mente das famílias vizinhas, que ele é considerado como propriedade legítima de uma ou outra de suas filhas.

    "Meu caro Mr. Bennet", disse certa vez sua esposa, "já ouviu falar que Netherfield Park finalmente foi alugado?"

    Mr. Bennet respondeu que não.

    "Mas foi mesmo", replicou ela, "pois Mrs. Long acabou de me contar. E ela soube por intermédio de Mr. Morris. Segundo Mrs. Long, Netherfield foi alugado por um jovem muito rico do norte da Inglaterra; que chegou na segunda-feira numa carruagem puxada por quatro cavalos para ver a propriedade, e ficou tão encantado com ela que imediatamente concordou com os termos de Mr. Morris; e deve tomar posse antes do dia de São Miguel, e alguns de seus criados já estarão aqui na próxima semana para preparar tudo."`
  },
  {
    id: "4",
    isbn: "9780061120084",
    title: "Para Todos os Garotos que Já Amei",
    author: "Jenny Han",
    description: "Uma história adolescente sobre amor, família e segredos revelados através de cartas de amor.",
    rating: 4.5,
    pages: 288,
    genre: ["Romance", "Juvenil", "Drama"],
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
    publishedYear: 2014,
    language: "Inglês",
    content: `Eu não acredito em amor à primeira vista. Para mim, o amor é como uma planta. Você rega, cuida, e aos poucos ela cresce. Mas Margot, minha irmã mais velha, sempre acreditou em amor à primeira vista. Ela dizia que quando você encontra a pessoa certa, simplesmente sabe.

    Margot tinha dezesseis anos quando conheceu o amor de sua vida. Eu tinha doze. Foi no verão antes dela ir para a faculdade. Ela trabalhava numa sorveteria no centro da cidade, e ele apareceu lá um dia pedindo um sundae de chocolate com calda extra.

    Seu nome era Ravi. Ravi Roshan. Ele tinha dezessete anos, olhos castanhos profundos e um sorriso que fazia você se sentir como se fosse a única pessoa no mundo. Margot me contou tudo sobre ele naquela noite, deitada na minha cama, sussurrando para não acordar nossos pais.

    "Lara Jean, ele é perfeito", ela disse. "Ele gosta de livros antigos e de filmes em preto e branco. E ele toca violão. Ele me escreveu uma música!"

    Eu rolei os olhos. "Ele provavelmente escreve músicas para todas as garotas."

    Mas Margot apenas sorriu seu sorriso secreto. "Não, Lara Jean. Desta vez é diferente. Eu sinto isso."`
  },
  {
    id: "5",
    isbn: "9780525559474",
    title: "O Nome do Vento",
    author: "Patrick Rothfuss",
    description: "A jornada épica de um jovem prodígio musical em busca de conhecimento e vingança.",
    rating: 4.9,
    pages: 662,
    genre: ["Fantasia", "Aventura", "Épico"],
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg",
    publishedYear: 2007,
    language: "Inglês",
    content: `Era noite no Waystone Inn. O vento uivava lá fora, e o fogo crepitava na lareira. Era uma noite perfeita para uma história, e todos os fregueses habituais estavam lá.

    "Conte-nos uma história, Kote", pediu o Cronista, um jovem escriba com olhos brilhantes de curiosidade.

    O homem atrás do balcão, que todos conheciam como Kote, o dono da estalagem, ergueu os olhos de seu trabalho. Ele era alto e magro, com cabelos ruivos que começavam a ficar grisalhos nas têmporas. Seus olhos eram verdes como jade antigo.

    "Uma história?", ele disse, com um sorriso cansado. "Já faz muito tempo que não conto histórias."

    Mas o Cronista insistiu, e os outros fregueses murmuraram em concordância. Finalmente, Kote suspirou e começou:

    "Muito bem. Mas vocês devem saber que esta não é apenas uma história. É a minha história. O nome do vento é uma coisa poderosa. Quando um vento tem um nome, ele pode ser chamado, controlado, usado como ferramenta ou arma.

    Meu nome é Kvothe. Eu nasci numa trupe de artistas itinerantes chamada Chandrian. Minha mãe era uma bela cantora, meu pai um ator talentoso. Eu tinha uma irmã chamada Netalia, que era ainda mais talentosa que eu."`
  },
  {
    id: "6",
    isbn: "9788535914849",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    description: "Um clássico da literatura brasileira sobre ciúmes, traição e a complexidade das relações humanas.",
    rating: 4.4,
    pages: 208,
    genre: ["Clássico", "Romance", "Literatura Brasileira"],
    coverUrl: "https://covers.openlibrary.org/b/isbn/9788535914849-L.jpg",
    publishedYear: 1899,
    language: "Português",
    content: `Uma noite destas, vindo da cidade para o Engenho Novo, encontrei num trem da Central um rapaz aqui do bairro, que eu conheço de vista e de chapéu. Cumprimentou-me, sentou-se ao pé de mim, falou da lua e dos ministros, e acabou recitando-me versos. A viagem era curta, e os versos pode ser que não fossem inteiramente maus. Sucedeu, porém, que, como eu estava cansado, fechei os olhos três ou quatro vezes; tanto bastou para que ele interrompesse a leitura e metesse os versos no bolso.

    — Continue, disse eu acordando.

    — Já acabei, murmurou ele.

    — São muito bonitos.

    Vi-lhe fazer um gesto para tirá-los outra vez do bolso, mas não passou do gesto; estava amuado. No dia seguinte entrou a dizer de mim nomes feios, e acabou alcunhando-me Dom Casmurro. Os vizinhos, que não gostam dos meus hábitos reclusos e calados, deram curso à alcunha, que afinal pegou. Nem por isso me zanguei. Contei a anedota aos amigos da cidade, e eles, por graça, chamam-me assim, alguns em bilhetes: "Dom Casmurro, domingo vou jantar com você". — "Vou para Petrópolis, Dom Casmurro; a casa é a mesma da Renânia; vê se deixas essa caverna mais cedo; sao nove horas da noite".`
  },
  {
    id: "7",
    isbn: "9788576573348",
    title: "A Revolução dos Bichos",
    author: "George Orwell",
    description: "Uma alegoria política sobre uma revolução animal que degenera em tirania.",
    rating: 4.7,
    pages: 112,
    genre: ["Política", "Sátira", "Clássico"],
    coverUrl: "https://covers.openlibrary.org/b/isbn/9788576573348-L.jpg",
    publishedYear: 1945,
    language: "Inglês",
    content: `Sr. Jones, da Granja do Solar, tinha trancado os galinheiros para a noite, mas estava bêbado demais para se lembrar de apagar as lanternas. Cambaleando com uma lanterna na mão oscilante de um lado para outro, ele chutou a porta dos fundos da casa, tirou as botas e foi direto para a cama, onde a Sra. Jones já roncava.

    Assim que a luz na casa-grande se apagou, houve um alvoroço e um bater de asas por toda a granja. Durante o dia inteiro havia corrido o rumor de que o Velho Major, o porco premiado, tivera um estranho sonho na noite anterior e desejava comunicá-lo aos outros animais. Fora combinado que se reuniriam no grande celeiro assim que o Sr. Jones estivesse seguramente fora do caminho. O Velho Major (assim era chamado, embora o nome em seu certificado de exposição fosse Willingdon Beauty) era tão respeitado em toda a granja que todos estavam dispostos a perder uma hora de sono para ouvi-lo.

    No topo de uma espécie de plataforma elevada, sob uma lanterna pendurada numa viga, estava o Velho Major, confortavelmente deitado numa cama de palha, com uma caneca de cerveja ao lado. Ele era doze anos de idade e ultimamente ficara bastante gordo, mas ainda era um porco majestoso, sábio, benevolente, com presas ligeiramente curvas. Logo os outros animais começaram a chegar e a se instalar da melhor maneira possível.`
  },
  {
    id: "8",
    isbn: "9786555320550",
    title: "O Alquimista",
    author: "Paulo Coelho",
    description: "A jornada espiritual de um pastor em busca de seu tesouro pessoal e realização dos sonhos.",
    rating: 4.3,
    pages: 208,
    genre: ["Filosofia", "Espiritualidade", "Aventura"],
    coverUrl: "https://covers.openlibrary.org/b/isbn/9786555320550-L.jpg",
    publishedYear: 1988,
    language: "Português",
    content: `O menino se chamava Santiago. Era pastor de ovelhas, e gostava de viajar pelo mundo. Aprendera tudo o que sabia com seu pai, que também fora pastor e que lhe ensinara a ler. Seu pai comprara um livro de histórias, e o menino aprendera a ler com ele. Lia o livro todas as noites, e embora não entendesse tudo, sentia que através daquelas histórias podia viajar sem sair do lugar.

    Aos dezesseis anos, Santiago vendeu suas ovelhas e comprou um saco de livros. Leu tudo o que pôde sobre geografia, história e ciências. Mas o que mais gostava eram os livros sobre alquimia. Lia sobre os grandes segredos da transformação dos metais em ouro, e sonhava em encontrar a Pedra Filosofal, que transformaria qualquer metal em ouro.

    Um dia, chegou a uma cidade chamada Tarifa. Era uma cidade portuária, e o menino ficou encantado com os barcos que iam e vinham. Sentou-se num muro e ficou observando o movimento do porto. De repente, uma velha se aproximou dele.

    — Você está lendo o futuro nas linhas da sua mão? — perguntou ela.

    — Não — respondeu o menino. — Estou apenas descansando.

    — Então me deixe ler o futuro na sua mão — disse a velha.

    O menino estendeu a mão, e a velha começou a examinar as linhas.`
  }
];

const achievements: Achievement[] = [
  { id: "first-book", name: "Primeira Leitura", description: "Leia seu primeiro livro", icon: "📖", unlocked: false, xpReward: 50 },
  { id: "bookworm", name: "Verme de Livro", description: "Leia 5 livros", icon: "🐛", unlocked: false, xpReward: 100 },
  { id: "scholar", name: "Erudito", description: "Leia 10 livros", icon: "🎓", unlocked: false, xpReward: 200 },
  { id: "genre-explorer", name: "Explorador de Gêneros", description: "Leia livros de 3 gêneros diferentes", icon: "🗺️", unlocked: false, xpReward: 150 },
  { id: "speed-reader", name: "Leitor Veloz", description: "Leia 3 livros em um mês", icon: "⚡", unlocked: false, xpReward: 120 }
];

function App() {
  const wallet = useWallet();
  const connection = useMemo(
    () => new web3.Connection(clusterApiUrl("devnet"), "processed"),
    []
  );

  const [userAccount, setUserAccount] = useState<UserAccountData | null>(null);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [isbn, setIsbn] = useState("");
  const [programIdString, setProgramIdString] = useState(ENV_PROGRAM_ID ?? DEFAULT_PROGRAM_ID);
  const [mintAddress, setMintAddress] = useState(ENV_MINT_ADDRESS ?? DEFAULT_MINT);
  const [status, setStatus] = useState("Conecte a wallet para carregar o perfil.");
  const [userPda, setUserPda] = useState<PublicKey | null>(null);
  const [mintAuthority, setMintAuthority] = useState<PublicKey | null>(null);

  // New state for enhanced features
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [readingLists, setReadingLists] = useState<ReadingList[]>([
    { id: "want-to-read", name: "Quero Ler", description: "Livros que quero ler", books: [], isPublic: true },
    { id: "currently-reading", name: "Lendo Agora", description: "Livros que estou lendo", books: [], isPublic: true },
    { id: "read", name: "Já Li", description: "Livros que terminei", books: [], isPublic: true }
  ]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(achievements);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [readingGoal] = useState(12); // books per year

  // Reader state
  const [showReader, setShowReader] = useState(false);
  const [readingBook, setReadingBook] = useState<Book | null>(null);

  const programPublicKey = useMemo(() => {
    try {
      return new PublicKey(programIdString);
    } catch {
      return null;
    }
  }, [programIdString]);

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return null;
    return new AnchorProvider(connection, wallet as any, {
      preflightCommitment: "processed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider || !programPublicKey) return null;
    return new Program(IDL as any, programPublicKey, provider);
  }, [provider, programPublicKey]);

  // Filter books based on search and genre
  const filteredBooks = useMemo(() => {
    return allBooks.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === "Todos" || book.genre.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    });
  }, [searchQuery, selectedGenre]);

  // Get unique genres
  const genres = useMemo(() => {
    const allGenres = allBooks.flatMap(book => book.genre);
    return ["Todos", ...Array.from(new Set(allGenres))];
  }, []);

  useEffect(() => {
    if (!wallet.publicKey) {
      setUserPda(null);
      setMintAuthority(null);
      setUserAccount(null);
      setTokenBalance("0");
      setStatus("Conecte a wallet para carregar o perfil.");
      return;
    }

    (async () => {
      if (!programPublicKey) {
        setStatus("Program ID inválido. Atualize a configuração do programa.");
        setUserPda(null);
        setMintAuthority(null);
        return;
      }

      const [pda] = await PublicKey.findProgramAddress(
        [Buffer.from("user_account"), wallet.publicKey!.toBuffer()],
        programPublicKey
      );
      const [mintPda] = await PublicKey.findProgramAddress(
        [Buffer.from("mint_authority")],
        programPublicKey
      );
      setUserPda(pda);
      setMintAuthority(mintPda);
    })();
  }, [wallet.publicKey, programPublicKey]);

  // Check and unlock achievements
  const checkAchievements = useCallback((booksRead: string[]) => {
    const newAchievements = [...userAchievements];

    // First book achievement
    if (booksRead.length >= 1 && !newAchievements.find(a => a.id === "first-book")?.unlocked) {
      newAchievements.find(a => a.id === "first-book")!.unlocked = true;
    }

    // Bookworm achievement
    if (booksRead.length >= 5 && !newAchievements.find(a => a.id === "bookworm")?.unlocked) {
      newAchievements.find(a => a.id === "bookworm")!.unlocked = true;
    }

    // Scholar achievement
    if (booksRead.length >= 10 && !newAchievements.find(a => a.id === "scholar")?.unlocked) {
      newAchievements.find(a => a.id === "scholar")!.unlocked = true;
    }

    // Genre explorer achievement
    const readBooks = allBooks.filter(book => booksRead.includes(book.isbn));
    const uniqueGenres = new Set(readBooks.flatMap(book => book.genre));
    if (uniqueGenres.size >= 3 && !newAchievements.find(a => a.id === "genre-explorer")?.unlocked) {
      newAchievements.find(a => a.id === "genre-explorer")!.unlocked = true;
    }

    setUserAchievements(newAchievements);
  }, [userAchievements]);

  const loadProfile = useCallback(async () => {
    if (!program || !userPda || !wallet.publicKey) return;
    setStatus("Carregando perfil...");

    try {
      const account = await program.account.userAccount.fetch(userPda);
      const raw = account as any;
      const profile: UserAccountData = {
        owner: raw.owner.toBase58(),
        xp: raw.xp?.toNumber ? raw.xp.toNumber() : Number(raw.xp),
        level: Number(raw.level),
        totalTokens: raw.totalTokens?.toNumber ? raw.totalTokens.toNumber() : Number(raw.totalTokens),
        booksRead: raw.booksRead ?? [],
      };
      setUserAccount(profile);

      // Check achievements
      checkAchievements(profile.booksRead);
      setStatus("Perfil carregado com sucesso.");

      if (mintAddress && mintAddress !== DEFAULT_MINT) {
        const mintPublicKey = new PublicKey(mintAddress);
        const ata = await getAssociatedTokenAddress(mintPublicKey, wallet.publicKey);
        try {
          const accountInfo = await getAccount(connection, ata);
          setTokenBalance(accountInfo.amount.toString());
        } catch {
          setTokenBalance("0");
        }
      }
    } catch (error) {
      setStatus("Conta de usuário não encontrada. Crie seu perfil primeiro.");
      setUserAccount(null);
      setTokenBalance("0");
    }
  }, [program, userPda, wallet.publicKey, connection, mintAddress]);

  const initializeUser = useCallback(async () => {
    if (!program || !userPda || !wallet.publicKey) return;
    setStatus("Inicializando perfil...");

    try {
      await program.methods
        .initializeUser()
        .accounts({
          userAccount: userPda,
          user: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      setStatus("Perfil criado com sucesso.");
      await loadProfile();
    } catch (error) {
      console.error(error);
      setStatus("Falha ao criar perfil. Verifique a console.");
    }
  }, [program, userPda, wallet.publicKey, loadProfile]);

  const registerReading = useCallback(async () => {
    if (!program || !provider || !userPda || !wallet.publicKey || !mintAuthority) return;
    if (!isbn) {
      setStatus("Digite o ISBN antes de registrar a leitura.");
      return;
    }
    if (!mintAddress || mintAddress === DEFAULT_MINT) {
      setStatus("Informe o endereço do token SPL a ser usado para a recompensa.");
      return;
    }

    setStatus("Registrando leitura...");

    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const userAta = await getAssociatedTokenAddress(mintPublicKey, wallet.publicKey);

      const existingAta = await connection.getAccountInfo(userAta);
      if (!existingAta) {
        const createAtaTx = new web3.Transaction().add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            userAta,
            wallet.publicKey,
            mintPublicKey,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
        await provider.sendAndConfirm(createAtaTx);
      }

      await program.methods
        .registerReading(isbn)
        .accounts({
          userAccount: userPda,
          userTokenAccount: userAta,
          user: wallet.publicKey,
          tokenMint: mintPublicKey,
          mintAuthority,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      setStatus("Leitura registrada! Atualizando perfil...");
      await loadProfile();
    } catch (error) {
      console.error(error);
      setStatus("Erro ao registrar leitura. Veja a console para mais detalhes.");
    }
  }, [program, userPda, wallet.publicKey, isbn, mintAddress, mintAuthority, loadProfile, connection, provider]);

  const addToReadingList = useCallback((listId: string, bookId: string) => {
    setReadingLists(prev => prev.map(list =>
      list.id === listId
        ? { ...list, books: list.books.includes(bookId) ? list.books : [...list.books, bookId] }
        : list
    ));
  }, []);

  const removeFromReadingList = useCallback((listId: string, bookId: string) => {
    setReadingLists(prev => prev.map(list =>
      list.id === listId
        ? { ...list, books: list.books.filter(id => id !== bookId) }
        : list
    ));
  }, []);

  const openBookModal = useCallback((book: Book) => {
    setSelectedBook(book);
    setShowBookModal(true);
  }, []);

  const closeBookModal = useCallback(() => {
    setShowBookModal(false);
    setSelectedBook(null);
  }, []);

  const openReader = useCallback((book: Book) => {
    setReadingBook(book);
    setShowReader(true);
  }, []);

  const closeReader = useCallback(() => {
    setShowReader(false);
    setReadingBook(null);
  }, []);

  const getBookByIsbn = useCallback((isbn: string) => {
    return allBooks.find(book => book.isbn === isbn);
  }, []);

  const getReadingProgress = useCallback(() => {
    if (!userAccount) return 0;
    const currentYear = new Date().getFullYear();
    const booksThisYear = userAccount.booksRead.length; // In a real app, you'd track dates
    return Math.min((booksThisYear / readingGoal) * 100, 100);
  }, [userAccount, readingGoal]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <span className="brand">Biblioteca GJL</span>
          <p className="brand-subtitle">Clube de leitura gamificado</p>
        </div>
        <nav className="top-nav">
          <button
            className={activeTab === "home" ? "active" : ""}
            onClick={() => setActiveTab("home")}
          >
            Início
          </button>
          <button
            className={activeTab === "explore" ? "active" : ""}
            onClick={() => setActiveTab("explore")}
          >
            Explorar
          </button>
          <button
            className={activeTab === "lists" ? "active" : ""}
            onClick={() => setActiveTab("lists")}
          >
            Listas
          </button>
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Perfil
          </button>
        </nav>
        <div className="wallet-bar">
          <WalletMultiButton />
        </div>
      </header>

      {activeTab === "home" && (
        <>
          <section className="hero-panel">
            <div className="hero-copy">
              <span className="eyebrow">Inspirado em sites famosos de leitura</span>
              <h1>Descubra, leia e ganhe prêmios com cada livro.</h1>
              <p>
                Um frontend inspirado em Goodreads e bibliotecas modernas, com um visual limpo e foco em suas leituras.
              </p>
              <div className="hero-actions">
                <button onClick={() => setActiveTab("explore")}>
                  Explorar Livros
                </button>
                <button className="secondary" onClick={() => setActiveTab("profile")}>
                  Ver Perfil
                </button>
              </div>
            </div>

            <div className="hero-card">
              <div className="book-highlight">
                <strong>Livro do mês</strong>
                <h2>O Pequeno Príncipe</h2>
                <p>Uma jornada leve e profunda para leitores de todas as idades.</p>
                <div className="badge-row">
                  <span>4.7</span>
                  <span>Filosofia</span>
                  <span>Clássico</span>
                </div>
              </div>
            </div>
          </section>

          <section className="stats-panel">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Livros na Biblioteca</h3>
                <p className="stat-number">{allBooks.length}</p>
              </div>
              <div className="stat-card">
                <h3>Gêneros Disponíveis</h3>
                <p className="stat-number">{genres.length - 1}</p>
              </div>
              <div className="stat-card">
                <h3>Conquistas Disponíveis</h3>
                <p className="stat-number">{achievements.length}</p>
              </div>
              <div className="stat-card">
                <h3>Leitores Ativos</h3>
                <p className="stat-number">∞</p>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === "explore" && (
        <section className="explore-panel">
          <div className="explore-header">
            <h1>Explorar Livros</h1>
            <p>Descubra novos livros e adicione aos seus favoritos</p>
          </div>

          <div className="search-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Buscar por título, autor ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="genre-filter">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="book-grid">
            {filteredBooks.map((book) => (
              <article className="book-card" key={book.id} onClick={() => openBookModal(book)}>
                <div className="book-cover">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={`Capa do livro ${book.title}`}
                      className="book-cover-image"
                      onError={(e) => {
                        // Fallback para placeholder se a imagem não carregar
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.parentElement!.querySelector('.cover-placeholder') as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="cover-placeholder">
                    {book.title.charAt(0)}
                  </div>
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="author">{book.author}</p>
                  <div className="book-meta">
                    <span className="rating">⭐ {book.rating}</span>
                    <span className="pages">{book.pages} páginas</span>
                  </div>
                  <div className="genre-tags">
                    {book.genre.slice(0, 2).map((genre) => (
                      <span key={genre} className="genre-tag">{genre}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === "lists" && (
        <section className="lists-panel">
          <div className="lists-header">
            <h1>Minhas Listas de Leitura</h1>
            <p>Organize seus livros em listas personalizadas</p>
          </div>

          <div className="lists-grid">
            {readingLists.map((list) => (
              <div key={list.id} className="list-card">
                <div className="list-header">
                  <h3>{list.name}</h3>
                  <span className="book-count">{list.books.length} livros</span>
                </div>
                <p>{list.description}</p>
                <div className="list-books">
                  {list.books.length > 0 ? (
                    list.books.slice(0, 3).map((bookId) => {
                      const book = allBooks.find(b => b.id === bookId);
                      return book ? (
                        <div key={bookId} className="list-book-item">
                          <span>{book.title}</span>
                          <button
                            onClick={() => removeFromReadingList(list.id, bookId)}
                            className="remove-btn"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <p className="empty-list">Nenhum livro nesta lista ainda</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "profile" && (
        <section className="profile-panel">
          <div className="profile-header">
            <h1>Meu Perfil de Leitor</h1>
            <p>Acompanhe seu progresso e conquistas</p>
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <h3>XP Total</h3>
              <p className="stat-number">{userAccount?.xp || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Nível</h3>
              <p className="stat-number">{userAccount?.level || 1}</p>
            </div>
            <div className="stat-card">
              <h3>Livros Lidos</h3>
              <p className="stat-number">{userAccount?.booksRead.length || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Tokens READ</h3>
              <p className="stat-number">{tokenBalance}</p>
            </div>
          </div>

          <div className="reading-goal">
            <h3>Meta de Leitura Anual</h3>
            <div className="goal-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${getReadingProgress()}%` }}
                ></div>
              </div>
              <p>{userAccount?.booksRead.length || 0} de {readingGoal} livros</p>
            </div>
          </div>

          <div className="achievements-section">
            <h3>Conquistas</h3>
            <div className="achievements-grid">
              {userAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <h4>{achievement.name}</h4>
                    <p>{achievement.description}</p>
                    {achievement.unlocked && (
                      <span className="xp-reward">+{achievement.xpReward} XP</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="recent-reads">
            <h3>Leituras Recentes</h3>
            {userAccount && userAccount.booksRead.length > 0 ? (
              <div className="recent-books">
                {userAccount.booksRead.slice(-5).reverse().map((isbn, index) => {
                  const book = getBookByIsbn(isbn);
                  return book ? (
                    <div key={`${isbn}-${index}`} className="recent-book">
                      <span>{book.title}</span>
                      <span className="author">{book.author}</span>
                    </div>
                  ) : (
                    <div key={`${isbn}-${index}`} className="recent-book">
                      <span>ISBN: {isbn}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>Nenhum livro registrado ainda.</p>
            )}
          </div>

          <div className="profile-actions">
            <button onClick={loadProfile} disabled={!wallet.connected}>
              Atualizar Perfil
            </button>
            <button onClick={initializeUser} disabled={!wallet.connected}>
              Criar Perfil
            </button>
          </div>

          <div className="register-reading">
            <h3>Registrar Nova Leitura</h3>
            <div className="register-form">
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Digite o ISBN do livro"
              />
              <button onClick={registerReading} disabled={!wallet.connected}>
                Registrar Leitura
              </button>
            </div>
            <p className="status-text">{status}</p>
          </div>
        </section>
      )}

      {showBookModal && selectedBook && (
        <div className="modal-overlay" onClick={closeBookModal}>
          <div className="book-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeBookModal}>×</button>

            <div className="modal-content">
              <div className="modal-book-cover">
                {selectedBook.coverUrl ? (
                  <img
                    src={selectedBook.coverUrl}
                    alt={`Capa do livro ${selectedBook.title}`}
                    className="book-cover-image large"
                    onError={(e) => {
                      // Fallback para placeholder se a imagem não carregar
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.parentElement!.querySelector('.cover-placeholder') as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="cover-placeholder large">
                  {selectedBook.title.charAt(0)}
                </div>
              </div>

              <div className="modal-book-info">
                <h2>{selectedBook.title}</h2>
                <p className="modal-author">por {selectedBook.author}</p>

                <div className="modal-meta">
                  <span className="rating">⭐ {selectedBook.rating}</span>
                  <span>{selectedBook.pages} páginas</span>
                  <span>{selectedBook.publishedYear}</span>
                  <span>{selectedBook.language}</span>
                </div>

                <div className="modal-genres">
                  {selectedBook.genre.map((genre) => (
                    <span key={genre} className="genre-tag">{genre}</span>
                  ))}
                </div>

                <p className="modal-description">{selectedBook.description}</p>

                <div className="modal-actions">
                  <button
                    className="read-now-btn"
                    onClick={() => openReader(selectedBook)}
                  >
                    Ler Agora
                  </button>
                  <button
                    className="add-to-list-btn"
                    onClick={() => addToReadingList("want-to-read", selectedBook.id)}
                  >
                    Quero Ler
                  </button>
                  <button
                    className="add-to-list-btn"
                    onClick={() => addToReadingList("currently-reading", selectedBook.id)}
                  >
                    Estou Lendo
                  </button>
                  <button
                    className="add-to-list-btn"
                    onClick={() => addToReadingList("read", selectedBook.id)}
                  >
                    Já Li
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReader && readingBook && (
        <div className="modal-overlay" onClick={closeReader}>
          <div className="reader-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reader-header">
              <div className="reader-book-info">
                <h2>{readingBook.title}</h2>
                <p className="reader-author">por {readingBook.author}</p>
              </div>
              <button className="close-reader" onClick={closeReader}>×</button>
            </div>
            <div className="reader-content">
              <div className="book-text">
                {readingBook.content ? readingBook.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                )) : (
                  <p>Conteúdo não disponível para este livro.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default App;
