/* AIsajuLab — 8월 페스티벌 완전 종료 (2026-08-15) */
(function(){
  function rm(){
    ['sjpbar','sjpfab'].forEach(function(id){
      var e=document.getElementById(id);
      if(e && e.parentNode) e.parentNode.removeChild(e);
    });
    document.querySelectorAll('.ajp-dim,.ajp-x,.ajp-cta,.ajp-foot').forEach(function(e){
      if(e.parentNode) e.parentNode.removeChild(e);
    });
    document.documentElement.style.overflow='';
    // localStorage에서 팝업 표시 기록 삭제 → 다음 방문에도 안 뜨게
    try{
      Object.keys(localStorage).filter(function(k){return k.indexOf('ajp_')===0;})
        .forEach(function(k){localStorage.removeItem(k);});
    }catch(e){}
    // body padding-bottom 복구 (바가 차지하던 공간 제거)
    document.body.style.paddingBottom='';
  }
  // 즉시 + DOM 로드 후 + 1초 후 세 번 실행 (타이밍 이슈 대비)
  rm();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', rm);
  }
  setTimeout(rm, 800);
  setTimeout(rm, 2000);
})();
