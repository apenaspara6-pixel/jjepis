# JJ Epi's — Segurança Rodoviária

Loja em português com catálogo, categorias, pesquisa, filtros, páginas de produto, carrinho persistente, contato e administração autenticada. Interface industrial responsiva. As fotografias reais de produtos serão cadastradas posteriormente.

## Organização

- `app/`: páginas, metadados e endpoints.
- `components/store/`: loja, cartões, busca, galerias, carrinho e formulários.
- `components/admin/`: administração e formulários reutilizáveis.
- `lib/catalog.ts`: tipos, identidade padrão, categorias e exemplos demonstrativos.
- `lib/repository.ts`: fonte de dados central, local ou Shopify.
- `lib/shopify.ts`: integração exclusivamente no servidor.
- `lib/security.ts` e `lib/validation.ts`: autorização e validação.
- `db/` e `drizzle/`: estrutura D1 e migrações.
- `public/images/`: imagem editorial do banner.

## Desenvolvimento

Node 22.13 ou superior. Instale com `npm run install:ci`, inicie com `npm run dev`, verifique tipos com `npx tsc --noEmit` e compile com `npm run build`. Siga as instruções do plugin Sites para configurar o perfil da máquina e publicar. O checkout local mantém seu estado em diretórios ignorados pelo Git.

O projeto usa Cloudflare D1 e R2, com os vínculos lógicos DB e BUCKET. Migrações são geradas com `npm run db:generate` e incluídas na publicação pelo Sites. Não reaplique migrações já executadas.

## Administração e segurança

A entrada administrativa é `/admin`, com usuário e senha. Configure `ADMIN_USERNAME` e os segredos `ADMIN_PASSWORD_HASH` e `ADMIN_PASSWORD_PEPPER` no ambiente do Sites. O hash usa PBKDF2-SHA256 com 100.000 iterações (limite do runtime hospedado), salt aleatório de 16 bytes e HMAC-SHA256 posterior com pepper aleatório de 32 bytes mantido como segredo. O formato é `pbkdf2-sha256-peppered:100000:saltHex:hmacHex`. Não remova o pepper nem armazene segredos no código. Nunca salve a senha em texto no código. A sessão opaca fica em cookie HttpOnly, SameSite=Strict e Secure em HTTPS; o banco guarda somente seu hash. Ela expira em oito horas, é revogada ao sair e invalidada quando a credencial muda. O login limita tentativas por IP. A privacidade da hospedagem Sites é independente deste login e permanece conforme o público autorizado.

A identidade ChatGPT do starter continua disponível para a área de cliente, mas não concede acesso administrativo. Configure credenciais locais separadas em .env para testar.

Não salve credenciais no código ou no repositório. Configure segredos pelo ambiente seguro do Sites. Os endpoints administrativos verificam identidade e autorização no servidor; gravações verificam origem e conteúdo. Uploads aceitam apenas imagens JPEG, PNG ou WebP, com validação da assinatura e limite de 5 MB.

## Como gerenciar a loja

1. Em **Produtos**, crie ou edite nome, categoria, preço de venda, preço anterior, estoque, SKU, descrições, especificações, variantes e relacionados.
2. O preço anterior é opcional: use zero quando não houver promoção. Quando informado, precisa ser maior que o preço de venda.
3. Produtos novos começam ocultos. Ative somente depois de revisar as informações.
4. Os 12 itens iniciais são exemplos explicitamente demonstrativos, com preços de referência. Não representam estoque real nem habilitam pagamentos.
5. Em **Categorias**, cadastre ou edite nomes, descrições e imagens.
6. Em **Configurações**, altere marca, logo, contatos, redes sociais, banners e políticas. O WhatsApp está vazio até a empresa informar um número.
7. As solicitações de orçamento ficam em **Mensagens**. O formulário armazena a mensagem e os itens do carrinho; não afirma enviar e-mails sem serviço de envio conectado.

## Fotografias reais

Envie as imagens no cadastro do produto ou na biblioteca. A primeira foto é a principal e aparece automaticamente no catálogo, nos destaques e na página do produto. Reordene por arrastar, pelas setas ou pelo botão de imagem principal.

Uma fotografia da biblioteca pode ser associada pelo endereço copiado. Fotos de produto usam `object-fit: contain`, preservando proporção. O envio pelo formulário otimiza fotos grandes para WebP. Categorias e banners têm campos próprios, sem exigir mudança de layout.

Se as fotos forem enviadas nesta conversa acompanhadas do nome do produto, associe-as ao registro correspondente; preserve componentes, proporções e rotas existentes. Não substitua fotos oficiais por imagens geradas.

## Conexão Shopify

A loja usa a Storefront API 2026-07 para catálogo e carrinho. O checkout é sempre o oficial da Shopify.

1. Crie o canal Headless e publique o catálogo nesse canal.
2. Configure `SHOPIFY_STORE_DOMAIN` no formato loja.myshopify.com e `SHOPIFY_STOREFRONT_TOKEN` (token público da Storefront, mantido no servidor nesta aplicação).
3. Configure as permissões de leitura do catálogo, disponibilidade e carrinho para a Storefront.
4. Opcionalmente adicione `SHOPIFY_ADMIN_TOKEN`, exclusivamente como segredo, para consultas de pedidos, clientes e descontos. Solicite somente os escopos de leitura necessários, respeitando as aprovações Shopify para dados de clientes.
5. Aplique o novo ambiente pelo Sites e use **Integrações > Shopify > Conectar Shopify** para verificar.
6. Configure moeda BRL, frete, cupons e pagamentos na Shopify.

Quando a Shopify estiver configurada, ela se torna a fonte dos produtos, imagens, variantes, preços e estoque. O painel direciona edições comerciais para o administrador oficial Shopify, evitando dois catálogos concorrentes.

Use o tipo de produto em português ou as tags `categoria:paineis-de-seguranca`, `categoria:rotulos-de-risco`, `categoria:conexoes`, `categoria:protecao`, `categoria:sinalizacao` e `categoria:acessorios`. A tag `destaque` exibe o produto nos destaques. Use `classe:3`, por exemplo, para habilitar filtros de risco.

O conector carrega até 4.000 produtos, 100 variantes e 20 imagens por produto. Para volumes maiores, implemente paginação sob demanda no provedor. O resumo financeiro usa os últimos 50 pedidos acessíveis, considera pedidos pagos em BRL e explicita esse recorte; não representa uma ferramenta contábil. Pedidos e clientes respeitam as permissões e o histórico permitido pela API.

Sem a Shopify, o carrinho e os orçamentos funcionam, mas o checkout informa que a conexão é necessária. Não existe processamento fictício de pagamento.

Documentação oficial:
- https://shopify.dev/docs/storefronts/headless
- https://shopify.dev/docs/api/storefront/2026-07/mutations/cartCreate
- https://shopify.dev/docs/api/admin-graphql/2026-07

## Análise de uso e conteúdo

Analytics, GTM e Meta Pixel ficam em Integrações e são carregados somente após consentimento do visitante. Ao usar GTM, configure os demais rastreadores nele para evitar duplicação. E-mail marketing possui um campo de planejamento; não há inscrição automática.

As políticas iniciais são conteúdo provisório editável, sem dados empresariais inventados. Revise os textos oficiais, informações comerciais, catálogo e condições de venda antes de abrir o site ao público.

## Validação executada

Revisão de desktop, tablet e celular; menu, pesquisa por termos/SKU, filtros, páginas e carrinho. Testes de autorização 401/403, criação e edição de produto, preço/estoque, upload e leitura de imagem, arquivo inválido, quantidade além do estoque, remoção do carrinho, contato persistente, validação de formulário e origem inválida. O fluxo administrativo também foi exercitado pela interface, com upload de imagem e alteração de preço.

A integração real com a Shopify e os meios de pagamento só poderão ser validados após fornecer as credenciais da loja.
