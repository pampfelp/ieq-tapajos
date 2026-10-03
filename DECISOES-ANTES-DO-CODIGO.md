# IEQ Tapajós — decisões antes de implementar

**Data inicial:** 2 de outubro de 2026. **Atualização:** 3 de outubro de 2026. As 16 respostas foram recebidas e o código local começou. As perguntas abaixo ficam como histórico da descoberta.

## Já definido pelas imagens escolhidas

- O ZIP enviado contém **seis telas**: a abertura com “A igreja” ativo, Horários, Ministérios, Localização, Contato e “Venha nos visitar”. Os JPEGs originais estão em `referencias-escolhidas/`.
- Direção visual: cabeçalho grafite, fundo claro, coral nos convites, títulos grandes, fotos humanas e as quatro cores da IEQ nos detalhes.
- Público do site: pessoas do Conjunto Tapajós e arredores que precisam descobrir quem é a igreja, quando ir, onde fica e como falar com alguém.
- Implementação seguirá o padrão de HTML, CSS e JavaScript sem build e será responsiva. O site público terá páginas com URLs próprias, metadados próprios, acessibilidade básica, PWA instalável e validação no navegador e celular reais.

As fotos de pessoas e da fachada nas maquetes foram geradas; o mapa também é ilustrativo. Não serão usados como registro factual da igreja na publicação.

## Decisões que mudam a implementação

**1. Quais são exatamente as páginas?** O primeiro JPEG tem “A igreja” ativo, mas parece a página inicial. Quer **seis páginas**, com “A igreja” levando à abertura, ou **sete**, com Início e A igreja separados? **Recomendação:** seis páginas, para uma navegação mais simples. Se forem seis, o logo também leva à abertura.

**2. O contato funciona como?** Na maquete há botão de conversa e formulário. Escolha um caminho:

- **A — WhatsApp apenas:** retirar ou adaptar o formulário; ao clicar, a pessoa abre uma conversa e precisa enviá-la. Mais simples, sem banco de mensagens.
- **B — WhatsApp + formulário que realmente envia:** a pessoa pode deixar nome, contato e mensagem sem abrir o WhatsApp. Exige destino, proteção contra spam, privacidade e uma forma de a igreja ler/responder.

**Recomendação:** B se “deixar um contato” for parte importante do objetivo; A se a equipe atender bem pelo WhatsApp e quiser lançar mais rápido. Não apresentar “Enviar mensagem” como envio concluído se ele só abrir outro aplicativo.

**3. Se houver formulário, quem recebe e como?** Nome/canal do responsável, se precisa notificação por e-mail ou WhatsApp, quem pode ler as mensagens, e se o formulário também aceita pedidos de oração. **Recomendação:** só nome, telefone ou e-mail e mensagem; acesso restrito; não expor nada ao público. O prazo de resposta só aparece no site se a equipe assumir um prazo real.

**4. O site deve conversar com o Sistema IEQ Tapajós já existente?** Por exemplo, registrar visitantes ou ler horários de cultos de lá. **Recomendação:** manter a primeira versão pública separada do sistema interno; qualquer integração precisa ser desenhada sem abrir dados de membros e finanças.

**5. Quem atualiza o conteúdo depois de publicado?** Felipe por alterações no repositório, ou alguém da igreja precisa editar horários/fotos/textos em um painel? **Recomendação:** conteúdo estático no começo, sem painel e sem login, se as mudanças forem ocasionais. Um painel muda bastante o escopo.

## Fatos e material que faltam

**6. Qual é o endereço oficial completo?** Envie rua, número, complemento, bairro, cidade/CEP e, se tiver, o link correto do Google Maps ou Waze. O pino da maquete não corresponde a uma coordenada real. Confirme também se o local está cadastrado no Google Maps com o nome correto.

**7. Os horários da bio continuam corretos?** Domingo **8h30 e 18h30**, terça **19h30** e quarta **19h30**. Esses encontros têm nomes próprios que devem aparecer? Há alguma variação regular, como Santa Ceia em um domingo específico?

**8. Qual é o canal oficial?** Confirme se **+55 91 98280-8543** é o WhatsApp que deve receber contatos do site, se o perfil **@ieqtapajos** continua oficial e quem responde às mensagens. O site deve mostrar outro telefone ou e-mail?

**9. Que fotografias podemos usar?** Envie os arquivos originais aprovados de culto, comunidade, Kids, Casais, Jovens, Mulheres, pastores e fachada, se existirem. Diga se há autorização para publicar imagens de pessoas e crianças. **Recomendação:** usar as fotos reais; as imagens geradas servem apenas para montagem e não devem sugerir que pessoas ou prédio fictícios são da IEQ Tapajós.

**10. Existe logo em PNG transparente ou SVG?** O arquivo atual é um JPEG quadrado com fundo grafite e nomes dos pastores. Confirme a escrita oficial de **IEQ Tapajós**, **Pr. Manoel** e **Pra. Nete Siqueira**, e se os nomes devem ficar no cabeçalho e no rodapé. **Recomendação:** manter o logo original intacto e preparar uma versão reduzida só após aprovação.

**11. Os textos das maquetes estão aprovados para publicação?** Em especial “Uma casa para viver a fé”, “Gente real, encontros verdadeiros e um Deus que transforma a nossa cidade”, os quatro símbolos da fé, os títulos das páginas e as descrições de Kids, Casais, Jovens e Mulheres. Quem da igreja aprova a redação final? **Recomendação:** usar as frases selecionadas como rascunho e aprovar a copy completa antes de publicar.

**12. O que acontece ao clicar em cada ministério?** Abrir uma seção com explicação na mesma página, abrir WhatsApp com mensagem sobre aquele ministério ou ter páginas individuais? Há outras frentes que precisam aparecer? **Recomendação:** quatro seções na página de Ministérios e um contato contextual, sem criar páginas extras agora.

**13. O que podemos afirmar sobre a primeira visita?** Há recepção, atividades para crianças durante os cultos, acessibilidade, estacionamento, orientação de entrada ou qualquer informação útil confirmada? Se não houver confirmação, o site se limita aos horários, rota e contato.

## Decisões necessárias antes de publicar, mas que não travam o primeiro código local

**14. Qual será o endereço do site?** Já existe domínio da igreja? Se sim, quem administra DNS e renovação? Caso não exista, pode começar no endereço do GitHub Pages e vincular um domínio depois. **Recomendação:** repositório e domínio sob controle da igreja/Felipe, não de terceiro.

**15. Quer medição de visitas?** Há Google Analytics, Meta Pixel ou outro rastreamento desejado? **Recomendação:** começar sem rastreamento; se entrar depois, revisar consentimento e política de privacidade antes de carregar scripts de terceiros.

**16. Quem fará a conferência final?** Uma pessoa da liderança para fatos/copy, alguém que usa Android e alguém que usa iPhone para abrir o site, seguir a rota, testar WhatsApp e eventual formulário. O link só será divulgado depois desses testes e da conferência da busca e da prévia no WhatsApp.

## Ordem prática de resposta

Para começar o código sem inventar comportamento, responder primeiro **1 a 5**. Para substituir as simulações e ativar rotas/contato, responder **6 a 13**. Os itens **14 a 16** fecham a publicação. Pode responder por número; “siga a recomendação” vale nos itens em que ela está indicada, mas endereço, canal, fotos e responsável pelo contato precisam de dados reais.

## Respostas confirmadas em 3 de outubro

1. `referencia-aprovada-home.png` é a home. São seis páginas públicas: home, horários, ministérios, localização, contato e primeira visita.
2. WhatsApp e formulário real.
3. O formulário avisa pelo Telegram que alguém deixou contato. Destino: conversa privada da conta oficial da igreja, após a conta iniciar conversa com um bot próprio.
4. Site público começa separado do sistema interno IEQ.
5. Painel para editar textos e fotos, com prévia apontando exatamente onde a alteração aparece. Felipe respondeu inicialmente “qualquer pessoa com o link por enquanto”; a proteção para publicação está em confirmação porque o link público sozinho permitiria alteração por terceiros.
6. Endereço: R. Anhembi, 36 - Tapanã, Belém - PA, 66833-310.
7. Domingo 8h30 e 18h30; primeiro domingo Santa Ceia; segundo Culto da Família; terceiro Culto de Missões; quarto ou último Celebração de Células. Terça 19h30 Culto Sabedoria; quarta 19h30 Culto Fé.
8. WhatsApp +55 91 98280-8543 e Instagram @ieqtapajos confirmados; os pastores respondem.
9. Fotos reais serão inseridas depois pelo painel.
10. O logo disponível é apenas `logo.jpg`; uma adaptação SVG para web foi feita a partir dele. Nomes confirmados: Pr. Manoel e Pra. Nete Siqueira.
11. A redação das telas escolhidas serve por enquanto e pode mudar depois.
12. Os ministérios são explicados na mesma página. Itens clicáveis terão movimento e feedback próprios, respeitando redução de movimento do sistema.
13. Informações de primeira visita confirmadas, exceto estacionamento próprio: não há. Há espaço nas ruas próximas.
14. Site no GitHub Pages por enquanto, sem domínio próprio.
15. Medição com Google Analytics e Meta Pixel, carregados somente após consentimento.
16. Felipe fará os testes finais.
