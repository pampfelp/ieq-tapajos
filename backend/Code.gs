/**
 * Este arquivo NÃO é o banco de dados. Só recebe o contato público,
 * valida o desafio anti-spam e guarda os segredos usados para avisar
 * a conta oficial da igreja no Telegram.
 * Configure TURNSTILE_SECRET, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID e
 * ALLOWED_HOSTNAME nas propriedades do script antes de implantar.
 */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    if (body.website) return answer_({ok: true});
    var name = String(body.name || '').trim();
    var contact = String(body.contact || '').trim();
    var message = String(body.message || '').trim();
    var startedAt = Number(body.startedAt);
    if (!body.consent || name.length < 2 || name.length > 100 || contact.length < 5 || contact.length > 150 || !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) || /^\+?[\d\s()-]{8,20}$/.test(contact)) || message.length < 10 || message.length > 1500 || !startedAt || Date.now() - startedAt < 3000 || Date.now() - startedAt > 3600000) return answer_({ok: false, error: 'Dados inválidos'});
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('TURNSTILE_SECRET');
    var botToken = props.getProperty('TELEGRAM_BOT_TOKEN');
    var chatId = props.getProperty('TELEGRAM_CHAT_ID');
    var hostname = props.getProperty('ALLOWED_HOSTNAME');
    if (!secret || !botToken || !chatId || !hostname) return answer_({ok: false, error: 'Serviço indisponível'});
    var token = String(body.token || '');
    if (!token || token.length > 2048) return answer_({ok: false, error: 'Verificação necessária'});
    var verifyResponse = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {method:'post',contentType:'application/json',payload:JSON.stringify({secret:secret,response:token}),muteHttpExceptions:true});
    var verification = JSON.parse(verifyResponse.getContentText());
    if (!verification.success || verification.hostname !== hostname) return answer_({ok:false,error:'Verificação inválida'});
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, contact.toLowerCase());
    var key = Utilities.base64EncodeWebSafe(digest).slice(0,42);
    var cache = CacheService.getScriptCache();
    if (cache.get(key)) return answer_({ok:false,error:'Aguarde antes de enviar outra mensagem'});
    var text = 'Novo contato pelo site IEQ Tapajós\n\nNome: '+name+'\nContato: '+contact+'\nMensagem: '+message;
    var sendResponse = UrlFetchApp.fetch('https://api.telegram.org/bot'+botToken+'/sendMessage', {method:'post',contentType:'application/json',payload:JSON.stringify({chat_id:chatId,text:text}),muteHttpExceptions:true});
    var sent = JSON.parse(sendResponse.getContentText());
    if (!sent.ok) return answer_({ok:false,error:'Não foi possível avisar a igreja'});
    cache.put(key,'1',60);
    return answer_({ok:true});
  } catch (error) {
    console.error(error);
    return answer_({ok:false,error:'Serviço indisponível'});
  }
}
function answer_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
