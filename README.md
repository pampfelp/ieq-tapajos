# Site IEQ Tapajós

Site público da IEQ Tapajós baseado nas seis telas escolhidas em outubro de 2026. A home segue a referência aprovada, mantida localmente. O site usa HTML, CSS e JavaScript sem build.

Repositório: https://github.com/pampfelp/ieq-tapajos

Endereço planejado: https://pampfelp.github.io/ieq-tapajos/

## Abrir localmente

Clique em `TESTAR - index.html.bat` para a home ou em `TESTAR - admin.html.bat` para o painel. O navegador abre `http://localhost:8765`. Se a porta já estiver em uso, feche o servidor anterior. Também é possível executar `python -m http.server 8765` nesta pasta.

## O que já funciona localmente

- Navegação das seis páginas públicas, horários, programação dos domingos, rota pelo endereço confirmado, WhatsApp e Instagram.
- Painel em `admin.html`: escolher página e campo, ver o trecho em destaque, editar textos, inserir ou retirar fotos, conferir computador/celular e salvar rascunho no navegador.
- Formulário com validação e mensagem de indisponibilidade enquanto o endpoint não estiver configurado.
- Manifest, service worker, ícones e preparação para instalação em celular.

## O que falta para funcionar ao vivo

1. Definir a proteção da publicação no painel. O link do painel sozinho não é uma proteção contra edições por terceiros.
2. O Firebase público `ieq-tapajos-publico-2026` já está ligado em `config.js`, com Firestore em São Paulo e regras publicadas para leitura pública e escrita bloqueada. Depois da decisão de acesso, ativar a publicação pelo painel. Os textos ficarão em `site/publico`; cada foto, em `site_images/{chave}` para respeitar o limite por documento.
3. Conectar bot da conta oficial, Turnstile e Apps Script conforme `backend/CONFIGURAR.md`. O token fica apenas nas propriedades do Apps Script.
4. Inserir fotos reais da igreja. As fotos das maquetes são ficcionais e não foram usadas no site.
5. O GitHub Pages está ativo pela branch `main`, pasta raiz. A propriedade do endereço público foi verificada no Search Console, o sitemap foi enviado e a indexação da home foi solicitada. Acompanhar o processamento: logo após o envio, o Search Console ainda mostrava erro de leitura do sitemap, embora o arquivo estivesse acessível e válido.
6. Inserir IDs do Google Analytics e Meta Pixel em `config.js`. Os scripts só carregam depois de consentimento.
7. Felipe testa em dispositivos reais, inclusive envio de contato e instalação.

Os testes locais automatizados estão em `scripts/`: `visual-check.cjs`, `interaction-check.cjs` e `pwa-check.cjs`. Eles usam o Edge instalado nesta máquina.

Ao mudar `config.js`, `content.js`, `shared.js` ou `style.css`, atualize as versões `?v=` dos HTMLs e o nome do cache em `service-worker.js` antes de publicar. Sem isso, quem instalou o site pode continuar vendo a configuração antiga.
