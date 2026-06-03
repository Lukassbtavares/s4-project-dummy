/* ============================================================
   app.js — nav scrollspy, reveals, counters, lightbox, joint map
   v1.0
   ============================================================ */
(function(){
  'use strict';

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks  = document.getElementById('navLinks');
  if(navToggle){
    navToggle.addEventListener('click', function(){ navLinks.classList.toggle('open'); });
    navLinks.addEventListener('click', function(e){ if(e.target.tagName==='A') navLinks.classList.remove('open'); });
  }

  /* ---------- scrollspy ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
  var linkMap = {};
  document.querySelectorAll('.nav-links a[data-sec]').forEach(function(a){ linkMap[a.getAttribute('data-sec')] = a; });
  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        var id = en.target.id;
        Object.keys(linkMap).forEach(function(k){ linkMap[k].classList.toggle('active', k===id); });
      }
    });
  }, { rootMargin:'-45% 0px -50% 0px', threshold:0 });
  sections.forEach(function(s){ spy.observe(s); });

  /* ---------- reveal on scroll ---------- */
  var revObs = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add('in'); revObs.unobserve(en.target); }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function(el){ revObs.observe(el); });

  /* ---------- count-up stats ---------- */
  var statObs = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      statObs.unobserve(en.target);
      en.target.querySelectorAll('.num[data-count]').forEach(function(num){
        var target = parseInt(num.getAttribute('data-count'),10);
        var unit = num.querySelector('.u');
        var unitHTML = unit ? unit.outerHTML : '';
        var start = null, dur = 1100;
        function tick(t){
          if(start===null) start = t;
          var p = Math.min((t-start)/dur, 1);
          var eased = 1 - Math.pow(1-p, 3);
          var val = Math.round(eased * target);
          num.innerHTML = val + unitHTML;
          if(p<1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    });
  }, { threshold:0.5 });
  var strip = document.getElementById('statStrip');
  if(strip) statObs.observe(strip);

  /* ============================================================
     LIGHTBOX  (collects every [data-src] image plate/gallery item)
     ============================================================ */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-src]'));
  var current = 0;

  function openLb(i){
    current = (i + items.length) % items.length;
    var el = items[current];
    lbImg.src = el.getAttribute('data-src');
    lbCap.textContent = el.getAttribute('data-cap') || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb(){ lb.classList.remove('open'); document.body.style.overflow=''; }

  items.forEach(function(el, i){
    el.addEventListener('click', function(){ openLb(i); });
  });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function(){ openLb(current-1); });
  document.getElementById('lbNext').addEventListener('click', function(){ openLb(current+1); });
  lb.addEventListener('click', function(e){ if(e.target===lb) closeLb(); });
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key==='Escape') closeLb();
    if(e.key==='ArrowRight') openLb(current+1);
    if(e.key==='ArrowLeft') openLb(current-1);
  });

  /* ============================================================
     INTERACTIVE JOINT MAP
     positions are % of the blueprint image (bike faces right)
     ============================================================ */
  var JOINTS = [
    { id:'J1', x:18, y:65, name:'Wheel hub', sub:'Front & rear · rotating',
      img:'assets/image17.png', cap:'Fig 06 — Section view of the wheel-hub connection',
      desc:'The hub was made to rotate and attach from both sides, so the spokes were moved to the centre of the part.',
      changes:[['MOVED','Spokes relocated to the hub centre for double-sided mounting'],['SIZE','Overall diameter increased to benefit the connecting tube joints']] },
    { id:'J2', x:78, y:71, name:'Front wheel connection', sub:'Servo + bearing',
      img:'assets/image20.jpeg', cap:'Fig 09 — J2 bearing housing, in real life',
      desc:'A left/right pair — one side holds the servo, the other a three-part bearing housing built around a shear pin that breaks under excess force.',
      changes:[['MECHANISM','Bearing housing designed to release on shear overload'],['FIT','Servo joint v2 fixed v1\u2019s over-tight tolerances — now fits with zero support']] },
    { id:'J3', x:56, y:27, name:'Front top frame joint', sub:'Over-tube clamp',
      img:'assets/image23.png', cap:'Fig 11 — J3-002 section view',
      desc:'The printed part now slides over the tubes for 10–40 mm instead of inserting inside them.',
      changes:[['WALL','Internal wall added to stop the steering tube sliding up and down']] },
    { id:'J4', x:67, y:35, name:'Front fork', sub:'Carried over',
      img:'assets/image11.png', cap:'Fig 13 — J4 front fork joint',
      desc:'The previous group\u2019s fork design caused no problems, so it was kept — only surface smoothing was applied.',
      changes:[['SMOOTH','Surfaces smoothed; geometry otherwise unchanged']] },
    { id:'J5', x:57, y:9, name:'Handlebar connection', sub:'Re-iterated ×4',
      img:'assets/image25.png', cap:'Fig 14 — J5 handlebar joint',
      desc:'Balancing clamp force against ease of release was the hardest joint — it broke about four times before the opening angle was right.',
      changes:[['CENTRE','Middle wall keeps the handlebars centred, balancing arm load'],['SUPPORT','Final version is smoothed and needs no print support']] },
    { id:'J6', x:32, y:23, name:'Rear top frame joint', sub:'Over-tube clamp',
      img:'assets/image26.png', cap:'Fig 15 — J6 rear top frame joint',
      desc:'All connections changed so the printed part goes over the tube, with heavy surface smoothing over the previous version.',
      changes:[['OVER-TUBE','Connections reversed to clamp outside the tube'],['FINISH','Surfaces smoothed for a cleaner, stronger joint']] },
    { id:'J7', x:43, y:74, name:'Lower frame joint', sub:'Re-walled + filleted',
      img:'assets/image27.png', cap:'Fig 16 — J7 lower frame joint',
      desc:'Previously inserted inside the tube and broke often. Switched to over-tube connections, the most reliable fix seen across prior iterations.',
      changes:[['OVER-TUBE','Inside-tube connections replaced with over-tube clamps'],['FILLETS','Added to reduce the chance of scratching anything on impact']] },
    { id:'J8', x:25, y:73, name:'Rear wheel connection', sub:'Servo + bearing',
      img:'assets/image31.png', cap:'Fig 17 — Back wheel connection (with section view)',
      desc:'Rebuilt like J2: a servo housing on the right, a bearing system on the left, joined through a grey breaking pin.',
      changes:[['PINS','Breaking pins enlarged for print repeatability (holes widened to match)'],['ACCESS','Servo clearance opened and a rear hole added for easy removal']] }
  ];

  var jmImg   = document.getElementById('jmImg');
  var jmId    = document.getElementById('jmId');
  var jmCount = document.getElementById('jmCount');
  var jmBody  = document.getElementById('jmBody');
  var activeIdx = 0;

  // build hotspots
  JOINTS.forEach(function(j, i){
    var h = document.createElement('button');
    h.className = 'hot';
    h.style.left = j.x + '%';
    h.style.top  = j.y + '%';
    h.setAttribute('aria-label', j.id + ' ' + j.name);
    h.innerHTML = '<span class="ring"></span><span class="core"></span><span class="lbl">'+j.id+' · '+j.name+'</span>';
    h.addEventListener('click', function(){ selectJoint(i); });
    jmImg.appendChild(h);
  });
  var hotEls = Array.prototype.slice.call(jmImg.querySelectorAll('.hot'));

  function selectJoint(i){
    activeIdx = i;
    var j = JOINTS[i];
    hotEls.forEach(function(el, k){ el.classList.toggle('active', k===i); });
    jmId.textContent = j.id;
    jmCount.textContent = (i+1<10?'0':'') + (i+1) + ' / 08';
    var changes = j.changes.map(function(c){
      return '<div class="change"><span class="t">'+c[0]+'</span><span>'+c[1]+'</span></div>';
    }).join('');
    jmBody.innerHTML =
      '<h4>'+j.name+'</h4>'+
      '<div class="sub">'+j.sub+'</div>'+
      '<p>'+j.desc+'</p>'+
      changes+
      '<div class="plate" style="margin-top:18px;cursor:zoom-in;" data-jm-src="'+j.img+'" data-jm-cap="'+j.cap+'">'+
        '<div class="plate-img cad" style="cursor:zoom-in;"><img src="'+j.img+'" alt="'+j.name+'" style="width:100%;"></div>'+
      '</div>';
    // wire the inline plate to the lightbox (append a temp item)
    var plate = jmBody.querySelector('[data-jm-src]');
    if(plate){
      plate.addEventListener('click', function(){
        lbImg.src = j.img; lbCap.textContent = j.cap;
        lb.classList.add('open'); document.body.style.overflow='hidden';
      });
    }
  }
  selectJoint(0);

})();
