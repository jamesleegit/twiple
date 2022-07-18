
(function() {
    window.onmessagegetter = Object.getOwnPropertyDescriptor(WebSocket.prototype, 'onmessage').get;
    window.onmessagesetter = Object.getOwnPropertyDescriptor(WebSocket.prototype, 'onmessage').set;
    Object.defineProperty(window.WebSocket.prototype, 'onmessage', {
      get() {
        return window.onmessagegetter.apply(this);
      },
      set() {
        var t = arguments[0];
        arguments[0] = function(...args) { if (window.$websocketonmessage) { window.$websocketonmessage(...args);  } t(...args); }
        return window.onmessagesetter.apply(this, arguments);
      }
    });
  })();
  
  // 트위치콘 처음엔 지원안함 (추후에 추가할 수 있으면 하자.) => 일단 지금은 필터링안되고있음. 필터링해야함.
  
  (async ()=>{
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const map = function(n, start1, stop1, start2, stop2) {
      return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
    };
    const intersectRect = (a, b) => a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom;
  
    const fontFamily = `Roboto, 'Segoe UI',Arial,'Malgun Gothic',Gulim,sans-serif`;
    const fontSizeRatios = { sm: 0.0125, md: 0.015, lg: 0.025 };
    const getFontSizeRatio = ()=>fontSizeRatios[(window.$twiple && window.$twiple.config.font) || 'lg'];
    const getAble = ()=> window.$twiple ? window.$twiple.config.able : false;

    let videoRatio = 0;
  
    let Comments = [];
  
    window.$websocketonmessage = (packet) => {
      const data = packet.data;
      if (!data.includes('https://') && !data.includes('http://') && data.indexOf('@badge-info') === 0 && !data.includes(';system-msg=') && data.split('tmi-sent-ts=')[1]) {
        const ts = Number(data.split('tmi-sent-ts=')[1].split(';')[0]);
        const temp = data.split(':');
        const message = temp[temp.length - 1].trim();
        if (!message || message.indexOf('!') === 0 || message.indexOf('@') === 0 || message.length > 40) {
          return;
        }
        Comments.push({ time: new Date().getTime(), message });
      }
    };
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style = 'position: absolute; top: 0; left: 0; pointer-events: none; display: block; margin: 0 auto; z-index: 99;';
    canvas.width = 0;
    canvas.height = 0;
  
    const hiddenElement = document.createElement('div');
    hiddenElement.style = 'position: fixed; top: -100px; left: -100px; opacity: 0; z-index: -1; line-height: 1; letter-spacing: 0px; font-family: ' + fontFamily;
    document.body.appendChild(hiddenElement);
  
    function resize() {
      if (location.href.replace('://', '').split('/').filter(v=>!!v).length !== 2) {
        return;
      }
      const wrapper = document.querySelector('.video-player__container');
  
      if (wrapper) {
        const video = wrapper.querySelector('video');
        const scale = wrapper.clientWidth / video.videoWidth;
  
        canvas.width = wrapper.clientWidth;
        canvas.height = video.videoHeight * scale;
  
        // const box = wrapper.getBoundingClientRect();
        // console.log(window.pageYOffset, box.top);
        // canvas.style.top = (window.pageYOffset + box.top) + 'px';
        // canvas.style.left = (window.pageXOffset + box.left) + ((wrapper.clientWidth - canvas.width) / 2) + 'px';
    
        canvas.style.top = ((wrapper.clientHeight - canvas.height) / 2) + 'px';
        canvas.style.left = ((wrapper.clientWidth - canvas.width) / 2) + 'px';
  
        const fontSize = canvas.width * getFontSizeRatio();
  
        hiddenElement.style.fontSize = fontSize + 'px';
        
        if (!wrapper.querySelector('canvas')) {
          wrapper.appendChild(canvas);
  
          // UI
          if (!window.$twiple) {
            const style = document.createElement('style');
            style.innerHTML = `
              .twiple-hide { display: none; }
              .twiple-opt-panel { 
                position: absolute;
                bottom: 0;
                top: 0;
                right: 0;
                left: 0;
                margin: auto;
                z-index: 2001;
                width: 300px;
                height: 150px;
                border-radius: 0.6rem;
                color: #fff;
                background-color: #18181b;
                box-shadow: 0 6px 16px rgba(0,0,0,0.5),0 0px 4px rgba(0,0,0,0.4);
                padding: 1rem;
              }
              .twiple-opt-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2000;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,.5);
              }
              .twiple-opt-wrap { display: flex; align-items: center; }
              .twiple-opt-title { width: 60px; text-align: center; margin-right: 1em; }
              .twiple-opt-content { flex: 1; }
              .twiple-opt-wrap button { 
                vertical-align: middle;
                height: 30px;
                padding: 0 10px;
                background: #000;
                border: 1px solid #222;
              }
              .twiple-opt-wrap button.twiple-active { 
                color: yellow;
              }
              .twiple-toggle-btn {
                position: relative;
                margin-left: .5rem;
                overflow: visible;
              }
              .twiple-toggle-btn:hover::before {
                content: 'twiple';
                display: block;
                position: absolute;
                bottom: 100%;
                right: 0;
                margin-bottom: 5px;
                font-size: 1.3rem;
                padding: 3px 6px;
                background: #040109;
                color: #fff;
              }
              .twiple-btn-close {
                display: flex; align-items: center; height: 30px; width: 100%; border-radius: 0.4rem;
                padding: 0 0.5rem;
              }
              .twiple-btn-close:hover {
                background-color: hsla(0,0%,100%,0.2);
              }
              .twiple-hr {
                border-top: 1px solid hsla(0,0%,100%,0.1);
                margin-top: 1rem ;
                margin-left: 0.5rem;
                margin-right: 0.5rem;
                padding-bottom: 1rem;
              }
            `;
            document.head.appendChild(style);
            window.$twiple = {
              config: {
                able: true,
                font: 'lg'
              },
              setPanel: function(v) {
                this.isOpenPanel = !!v;
                const target = document.querySelector('.twiple-opt-panel');
                const target2 = document.querySelector('.twiple-opt-backdrop');
                if (target) {
                  if (this.isOpenPanel) {
                    target.classList.remove('twiple-hide');
                    target2.classList.remove('twiple-hide');
                  } else {
                    target.classList.add('twiple-hide');
                    target2.classList.add('twiple-hide');
                  }
                }
              },
              isOpenPanel: false,
              updateClass: function () {
                document.querySelectorAll('*[data-twiple-config]').forEach((e) => {
                  const arr = e.getAttribute('data-twiple-config').split(':');
                  // console.log(window.$twiple.config[arr[0]], arr[0], arr[1]);
                  if (['true', 'false'].includes(arr[1])) {
                    arr[1] = arr[1]==='true';
                  }
                  if (window.$twiple.config[arr[0]] === arr[1]) {
                    e.classList.add('twiple-active')
                  } else {
                    e.classList.remove('twiple-active')
                  }
                });
              }
            };
          
            document.addEventListener("click", function(e) {
              if (e.target) {
                const attr = e.target.getAttribute('data-twiple-config');
                if (attr) {
                  const arr = attr.split(':');
                  if (['true', 'false'].includes(arr[1])) {
                    arr[1] = arr[1]==='true';
                  }
                  window.$twiple.config[arr[0]] = arr[1];
                  // global
                  localStorage.setItem('twiple-config', JSON.stringify(window.$twiple.config));
                  window.$twiple.updateClass();
                }
              }
            });
            if (localStorage.getItem('twiple-config')) {
              try {
                const obj = JSON.parse(localStorage.getItem('twiple-config'));
                window.$twiple.config = obj;
              } catch(e) {
                console.log(e);
              }
            }
          }

          // 엘레먼트 추가
          const backdrop = document.createElement('div');
          backdrop.setAttribute('class', 'twiple-opt-backdrop twiple-hide');
          backdrop.setAttribute('onclick', '$twiple.setPanel(false)');

          const panel = document.createElement('div');
          panel.setAttribute('class', 'twiple-opt-panel twiple-hide');
          panel.innerHTML = `
            <button class="twiple-btn-close" onclick="$twiple.setPanel(false)">
              <svg width="20px" height="20px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="ScIconSVG-sc-1bgeryd-1 ifdSJl"><g><path d="M8.5 10L4 5.5 5.5 4 10 8.5 14.5 4 16 5.5 11.5 10l4.5 4.5-1.5 1.5-4.5-4.5L5.5 16 4 14.5 8.5 10z"></path></g></svg>
              <span style="margin-left: 0.5rem;">닫기</span>
            </button>
            <div class="twiple-hr"></div>
            <div class="twiple-opt-wrap">
              <div class="twiple-opt-title">twiple</div>
              <div class="twiple-opt-content"><button style="margin-right: 5px;" data-twiple-config="able:true">ON</button><button data-twiple-config="able:false">OFF</button></div>
            </div>
            <div style="height: 1em;"></div>
            <div class="twiple-opt-wrap">
              <div class="twiple-opt-title">Font</div>
              <div class="twiple-opt-content"><button style="margin-right: 5px;" data-twiple-config="font:sm">Small</button><button style="margin-right: 5px;" data-twiple-config="font:md">Middle</button><button data-twiple-config="font:lg">Large</button></div>
            </div>`;
          wrapper.querySelector('.video-ref').append(panel);
          wrapper.querySelector('.video-ref').append(backdrop);
          
          const button = document.createElement('button');
          button.setAttribute('class', 'ScCoreButton-sc-1qn4ixc-0 cgCHoV ScButtonIcon-sc-o7ndmn-0 dKvQD twiple-toggle-btn');
          button.setAttribute('onclick', '$twiple.setPanel(!$twiple.isOpenPanel)');
          button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px;" viewBox="0 0 640 512"><path fill="#fff" d="M543.3 214.5C543.5 212.3 544 210.2 544 208C544 146.1 493.9 96 432 96c-11.41 0-22.19 2.207-32.56 5.377C368.9 59.51 319.8 32 264 32C170.8 32 95.41 107.9 96.08 200.8C40.24 220.6 0 273.4 0 336C0 415.5 64.47 480 144 480h360c75.11 0 136-60.89 136-136C640 282.7 599.1 231.4 543.3 214.5zM504 432H144c-52.94 0-96-43.07-96-96c0-40.2 25.77-76.36 64.13-89.97l32.19-11.42c-.2734-38.62-.2246-33.15-.293-37.17C145.4 132.4 198.7 80 264 80c38.4 0 73.63 18.1 96.66 49.67l20.14 27.6l32.67-9.988c48.86-14.94 84.23 25.56 81.96 64.4l-2.193 37.72l36.15 10.99C566.8 271.8 592 305.4 592 344C592 392.5 552.5 432 504 432z"/></svg>`;
          wrapper.querySelector('.video-ref .player-controls__right-control-group').append(button);
  
          
          const button2 = document.createElement('button');
          button2.setAttribute('class', 'ScCoreButton-sc-1qn4ixc-0 cgCHoV ScButtonIcon-sc-o7ndmn-0 dKvQD twiple-toggle-btn');
          button2.innerHTML = button.innerHTML;
          wrapper.querySelector('.stream-display-ad__wrapper .player-controls__right-control-group').append(button2);
        
          window.$twiple.updateClass();
        }
      }
    }
  
    const getSize = (str) => {
      hiddenElement.innerText = str;
      return {width: hiddenElement.clientWidth, height: hiddenElement.clientHeight};
    }
  
    // window.addEventListener('resize', ()=>resize());
    // window.addEventListener('scroll', ()=>resize());
    setInterval(()=>resize(), 500);
    
    const update = (timestamp) => {
      const fontSizeRatio = getFontSizeRatio();
      
      /**************************************** */
      const {width, height} = canvas;
      const fontSize = width * fontSizeRatio;
    
      Comments = Comments.filter(v=>new Date().getTime() - v.time < 1000 * 5);
      const comments = Comments;
      /*****************************************/
    
      ctx.clearRect(-100,-100,width+200,height+200);

      if (getAble()) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
    
        for (let i = 0; i < comments.length; i++) {
          const comment = comments[i];
          if (!comment.position) {
            const targets = comments.filter(v=>v.position).map(v=>v.position);
            const l = 20;
            for (let j = 0; j < l; j ++) {
              const temp = getSize(comment.message);
              const w = temp.width;
              const h = temp.height;
              const x = map(Math.random(), 0, 1, 0, width - w);
              const y = map(Math.random(), 0, 1, 0, height - h);
              // console.log(w,  h, {to  {top: v.y, bottom: v.y+v.h, left: v.x, right: v.x+v.w});
              
              if (j === l - 1 || targets.every(v=>!intersectRect({top: v.y, bottom: v.y+v.h, left: v.x, right: v.x+v.w}, {top: y, bottom: y+h, left: x, right: x+w}))) {
                comment.position = { x, y, w, h };
                break;
              }
            }
          }
          const {x, y, w, h} = comment.position;
    
          const g = new Date().getTime() - comment.time;
          const o1 = Math.min(1, map(g, 0, 300, 0, 1));
          const o2 = Math.min(1, map(g, 4700, 5000, 1, 0));
    
          ctx.lineWidth = fontSize > 20 ? 6 : 2;
          ctx.strokeStyle = `rgba(0,0,0,${Math.min(o1, o2)})`;
          ctx.strokeText(comment.message, x, y);
    
          ctx.fillStyle = `rgba(255,255,255,${Math.min(o1, o2)})`;
          ctx.fillText(comment.message, x, y);
        }
      }
  
      window.requestAnimationFrame(update);
    }
    window.requestAnimationFrame(update);
  })();
  