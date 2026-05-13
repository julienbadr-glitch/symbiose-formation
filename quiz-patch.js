/* Quiz Restart Patch — injects "Recommencer le quiz" button into result panels */
(function(){
  function injectRestartBtn(panel){
    if(panel.querySelector('.quiz-restart-btn')) return;
    var wrap = document.createElement('div');
    wrap.className = 'quiz-restart-wrap';
    wrap.style.cssText = 'text-align:center;margin-top:18px;';
    var btn = document.createElement('button');
    btn.className = 'btn btn-primary quiz-restart-btn';
    btn.innerHTML = '<i class="fas fa-redo"></i> Recommencer le quiz';
    btn.addEventListener('click', function(){
      /* Determine step id from closest quizCard */
      var card = panel.closest('[id^="quizCard-"]');
      var stepId = card ? card.id.replace('quizCard-','') : null;
      if(stepId !== null){
        try{
          var st = JSON.parse(localStorage.getItem('symbiose_state'));
          if(st && st.quizAnswered){
            var idx = Number(stepId);
            if(!isNaN(idx)){
              st.quizAnswered[idx] = {};
              st.comboStreak = 0;
              localStorage.setItem('symbiose_state', JSON.stringify(st));
            }
          }
        }catch(e){}
      }
      /* Reload page to re-render quiz from question 1 */
      location.reload();
    });
    wrap.appendChild(btn);
    panel.appendChild(wrap);
  }

  /* Inject into any existing result panels */
  document.querySelectorAll('.quiz-result-panel').forEach(injectRestartBtn);

  /* Watch for future result panels */
  var obs = new MutationObserver(function(muts){
    muts.forEach(function(m){
      m.addedNodes.forEach(function(n){
        if(n.nodeType===1){
          if(n.classList && n.classList.contains('quiz-result-panel')) injectRestartBtn(n);
          var inner = n.querySelectorAll && n.querySelectorAll('.quiz-result-panel');
          if(inner) inner.forEach(injectRestartBtn);
        }
      });
    });
  });
  obs.observe(document.body, {childList:true, subtree:true});
})();
