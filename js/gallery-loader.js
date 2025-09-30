// Gallery loader without captions.
(function(){
  function youTubeId(input){
    try {
      var u = new URL(input);
      if (u.hostname.indexOf('youtube.com') !== -1) return u.searchParams.get('v');
      if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    } catch(e) {}
    return input;
  }
  function ensureContainer(){
    var container = document.querySelector('.gallery-grid');
    if (!container){
      container = document.createElement('section');
      container.className = 'gallery-grid';
      document.body.appendChild(container);
    }
    return container;
  }
  fetch('/content/gallery.json', { cache: 'no-store' })
    .then(function(r){ return r.json(); })
    .then(function(data){
      var items = (data.items||[]);
      var el = ensureContainer();
      el.innerHTML = items.map(function(item){
        if(item.type === 'image'){
          return [
            '<figure class="gallery-item">',
              '<div class="media-frame">',
                '<img loading="lazy" src="'+item.src+'" alt="'+(item.alt||'')+'">',
              '</div>',
            '</figure>'
          ].join('');
        }
        if(item.type === 'youtube'){
          var id = youTubeId(item.video||'');
          return [
            '<figure class="gallery-item video">',
              '<div class="media-frame">',
                '<iframe class="video-thumb yt-contain"',
                    ' src="https://www.youtube.com/embed/'+id+'?autoplay=0&mute=0&loop=1&playlist='+id+'&controls=1&modestbranding=1&rel=0"',
                    ' frameborder="0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen>',
                '</iframe>',
              '</div>',
            '</figure>'
          ].join('');
        }
        return '';
      }).join('');
    })
    .catch(function(err){ console.error('Gallery load error', err); });
})();