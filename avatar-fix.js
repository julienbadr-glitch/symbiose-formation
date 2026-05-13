/* Avatar + Anti-Doublon Fix v4 */
(function(){
  /* === ANTI-DOUBLON: intercept fetch to api-chat.php === */
  var _origFetch = window.fetch;
  var _lastChatCall = 0;
  var _lastChatBody = '';
  
  window.fetch = function(url, opts) {
    // Intercept calls to api-chat.php
    if (typeof url === 'string' && url.indexOf('api-chat.php') !== -1 && opts && opts.method === 'POST') {
      var now = Date.now();
      var body = opts.body || '';
      
      // Block if same call within 5 seconds
      if (now - _lastChatCall < 5000) {
        console.log('[anti-doublon] Blocked duplicate api-chat.php call (' + (now - _lastChatCall) + 'ms)');
        return Promise.resolve(new Response('{"reply":""}', {status: 200, headers: {'Content-Type':'application/json'}}));
      }
      _lastChatCall = now;
      _lastChatBody = body;
    }
    return _origFetch.apply(this, arguments);
  };
  
  // Also intercept XMLHttpRequest for safety
  var _origXHROpen = XMLHttpRequest.prototype.open;
  var _origXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    this._method = method;
    return _origXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function(body) {
    if (this._url && this._url.indexOf('api-chat.php') !== -1 && this._method === 'POST') {
      var now = Date.now();
      if (now - _lastChatCall < 5000) {
        console.log('[anti-doublon] Blocked duplicate XHR api-chat.php call');
        // Fake a successful empty response
        var self = this;
        setTimeout(function(){
          Object.defineProperty(self, 'readyState', {value: 4});
          Object.defineProperty(self, 'status', {value: 200});
          Object.defineProperty(self, 'responseText', {value: '{"reply":""}'});
          if (self.onreadystatechange) self.onreadystatechange();
          if (self.onload) self.onload();
        }, 10);
        return;
      }
      _lastChatCall = now;
    }
    return _origXHRSend.apply(this, arguments);
  };

  /* === ALSO block duplicate addUserMessage DOM insertions === */
  var _lastMsgText = '';
  var _lastMsgTime = 0;
  
  var _origAppend = Element.prototype.appendChild;
  Element.prototype.appendChild = function(child) {
    // Check if this is a chat message being added
    if (child && child.classList && child.classList.contains('rp-msg') && child.classList.contains('user')) {
      var now = Date.now();
      var msgText = child.textContent.trim();
      if (msgText === _lastMsgText && now - _lastMsgTime < 5000) {
        console.log('[anti-doublon] Blocked duplicate message DOM insertion');
        return child; // Don't insert, return the child as if it was inserted
      }
      _lastMsgText = msgText;
      _lastMsgTime = now;
    }
    return _origAppend.apply(this, arguments);
  };

  /* === NPC AVATAR FIX === */
  function getNpcInitials(){
    var tn=document.querySelector(".rp-topbar-name");
    if(!tn)return null;
    var fc=tn.childNodes[0];
    if(!fc)return null;
    var name=fc.textContent.trim();
    var parts=name.split(/\s+/);
    if(parts.length>=2)return(parts[0][0]+parts[parts.length-1][0]).toUpperCase();
    return parts[0]?parts[0].substring(0,2).toUpperCase():null;
  }
  function getUserInitials(){
    try{
      var s=JSON.parse(localStorage.getItem("symbiose_session")||"{}");
      if(s.email){
        var p=s.email.split("@")[0].split(".");
        if(p.length>=2)return(p[0][0]+p[1][0]).toUpperCase();
        return p[0].substring(0,2).toUpperCase();
      }
    }catch(e){}
    return null;
  }
  
  setInterval(function(){
    var npc=getNpcInitials();
    if(npc){
      document.querySelectorAll(".rp-msg-avatar.bot").forEach(function(el){
        if(el.textContent.trim()!==npc)el.textContent=npc;
      });
      var ta=document.querySelector(".rp-topbar-avatar");
      if(ta&&ta.textContent.trim()!==npc)ta.textContent=npc;
    }
    var ui=getUserInitials();
    if(ui){
      document.querySelectorAll(".rp-msg-avatar.user").forEach(function(el){
        if(el.textContent.trim()!==ui)el.textContent=ui;
      });
      var ha=document.querySelector(".header-avatar");
      if(ha&&ha.textContent.trim()!==ui)ha.textContent=ui;
    }
  },400);
})();