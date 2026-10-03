# Formulário e aviso no Telegram

O site público chama um Web App do Google Apps Script. O token do bot e a chave do Turnstile ficam somente nas propriedades do script. O projeto Apps Script não deve ser público.

1. A conta oficial da igreja cria um bot pelo BotFather no Telegram e inicia uma conversa privada com ele. O bot só consegue enviar a mensagem depois dessa primeira interação. Anote o `chat_id` da conversa a partir de `getUpdates` no navegador da própria conta. Não coloque token ou `chat_id` no repositório.
2. Crie um widget Cloudflare Turnstile para o domínio GitHub Pages escolhido. Anote o sitekey público e o secret privado.
3. Crie um projeto Apps Script e copie `Code.gs`. Em **Configurações do projeto > Propriedades do script**, adicione `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TURNSTILE_SECRET` e `ALLOWED_HOSTNAME` (apenas o host, como `usuario.github.io`).
4. Implante como Web App executando como a conta proprietária e com acesso a qualquer pessoa. Copie a URL `/exec` para `formEndpoint` em `config.js`, e o sitekey público para `turnstileSiteKey`.
5. Envie um formulário real e confira a mensagem na conversa privada do Telegram. Teste também campos vazios, consentimento desmarcado, desafio expirado e envios repetidos.

O formulário exibe erro e oferece o WhatsApp quando o endpoint está ausente ou falha. O aviso de sucesso só aparece após resposta `ok:true` do proxy.
