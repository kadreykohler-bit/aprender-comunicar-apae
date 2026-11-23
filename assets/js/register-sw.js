// Registra o Service Worker para funcionar offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Modo offline ativado!'))
      .catch(erro => console.error('Erro no Service Worker:', erro));
  });
}