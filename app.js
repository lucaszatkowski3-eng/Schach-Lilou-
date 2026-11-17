import { Chess } from "https://esm.sh/chess.js@1.4.0";

const $ = (id) => document.getElementById(id);
const game = new Chess();
const glyphs = {wk:"♔",wq:"♕",wr:"♖",wb:"♗",wn:"♘",wp:"♙",bk:"♚",bq:"♛",br:"♜",bb:"♝",bn:"♞",bp:"♟"};
const lessons = [
  {title:"Das Schachbrett",piece:"▦",text:"Das Schachbrett hat 64 Felder. Es gibt helle und dunkle Felder. Jede Seite hat 8 Reihen und 8 Spalten.",example:"Merke dir: Unten rechts ist immer ein helles Feld."},
  {title:"Der Bauer",piece:"♙",text:"Bauern ziehen immer nach vorne. Beim allerersten Zug dürfen sie ein oder zwei Felder gehen. Danach immer nur ein Feld. Sie schlagen schräg nach vorne.",example:"Tipp: Bauern können niemals rückwärts laufen!"},
  {title:"Der Turm",piece:"♖",text:"Der Turm fährt geradeaus: nach oben, unten, links oder rechts. Er darf so weit ziehen, wie der Weg frei ist.",example:"Stell dir vor, der Turm fährt wie ein Zug auf geraden Schienen."},
  {title:"Der Läufer",piece:"♗",text:"Der Läufer bewegt sich diagonal. Das bedeutet: schräg über das Brett. Er bleibt immer auf Feldern derselben Farbe.",example:"Ein Läufer startet auf hell und bleibt immer auf hell – oder auf dunkel."},
  {title:"Das Pferd",piece:"♘",text:"Das Pferd macht einen L-Sprung: zwei Felder in eine Richtung und dann eins zur Seite. Es ist die einzige Figur, die über andere Figuren springen kann.",example:"Zähle: zwei geradeaus, eins zur Seite!"},
  {title:"Die Dame",piece:"♕",text:"Die Dame ist besonders stark. Sie kann gerade wie ein Turm und diagonal wie ein Läufer ziehen.",example:"Die Dame kann in alle Richtungen ziehen – aber nicht durch andere Figuren."},
  {title:"Der König",piece:"♔",text:"Der König ist die wichtigste Figur. Er darf ein Feld in jede Richtung gehen. Wenn er angegriffen wird, heißt das Schach.",example:"Wird der König angegriffen und kann sich nicht retten, ist es Schachmatt."}
];
const items = [
  {id:"cap",name:"Grüne Mütze",desc:"Ein gemütlicher Look",cost:8,preview:"▰",type:"hat"},
  {id:"crown",name:"Sternenkrone",desc:"Für echte Königinnen",cost:18,preview:"♛",type:"crown"},
  {id:"scarf",name:"Roter Schal",desc:"Warm und kuschelig",cost:12,preview:"〰",type:"scarf"},
  {id:"cape",name:"Abenteuer-Umhang",desc:"Bereit für neue Züge",cost:25,preview:"◆",type:"cape"},
  {id:"glasses",name:"Sternenbrille",desc:"Ganz schön schlau",cost:15,preview:"▤",type:"glasses"},
  {id:"flower",name:"Blumen-Haarspange",desc:"Ein kleiner Farbtupfer",cost:10,preview:"✿",type:"flower"}
];
let stars = Number(localStorage.getItem("lilou-stars") || 0);
let owned = JSON.parse(localStorage.getItem("lilou-owned") || '["base"]');
let equipped = localStorage.getItem("lilou-equipped") || "base";
let selected = null, legalTargets = [], completedGames = Number(localStorage.getItem("lilou-games") || 0);
let soundOn = true, lastRewarded = false;
const save = () => { localStorage.setItem("lilou-stars",stars);localStorage.setItem("lilou-owned",JSON.stringify(owned));localStorage.setItem("lilou-equipped",equipped);localStorage.setItem("lilou-games",completedGames); };
function updateStars(){ $("coin-count").textContent=stars;$("game-stars").textContent=stars;$("shop-coins").textContent=stars; }
function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2300);}
function showView(name){
  ["home","play","learn","wardrobe"].forEach(v=>{const el=$(v+"-view");if(el)el.classList.toggle("hidden",v!==name);});
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  if(name==="play")renderBoard();if(name==="wardrobe")renderShop();
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
function renderBoard(){
  const board=$("chessboard");board.innerHTML="";
  const matrix=game.board();
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const sq=String.fromCharCode(97+c)+(8-r),piece=matrix[r][c],el=document.createElement("button");
    el.className="square "+((r+c)%2===0?"light":"dark");el.setAttribute("role","gridcell");el.setAttribute("aria-label",sq);
    if(selected===sq)el.classList.add("selected");
    if(legalTargets.includes(sq))el.classList.add(game.get(sq)?"capture":"legal");
    if(piece){const span=document.createElement("span");span.className="piece "+(piece.color==="w"?"white":"black");span.textContent=glyphs[piece.color+piece.type];el.append(span);}
    el.addEventListener("click",()=>onSquare(sq));board.append(el);
  }
  $("move-number").textContent="Zug "+(Math.floor(game.history().length/2)+1);
  $("turn-label").textContent=game.isGameOver()?"Spiel beendet":game.turn()==="w"?"Du bist am Zug":"Der Roboter denkt …";
  $("game-message").textContent=game.isCheckmate()?"Schachmatt!":game.isDraw()?"Unentschieden":game.isCheck()?"Achtung: Schach!":"Wähle eine deiner weißen Figuren.";
}
function onSquare(sq){
  if(game.isGameOver()||game.turn()!=="w")return;
  const p=game.get(sq);
  if(selected&&legalTargets.includes(sq)){
    try{moveAnimated(selected,sq,"q");selected=null;legalTargets=[];if(game.isGameOver()){finishGame();return;}setTimeout(robotMove,520);}catch(e){selected=null;legalTargets=[];renderBoard();}
    return;
  }
  if(p&&p.color==="w"){selected=sq;legalTargets=game.moves({square:sq,verbose:true}).map(m=>m.to);$("coach-message").textContent=legalTargets.length?"Toll! Die leuchtenden Felder zeigen dir, wohin diese Figur ziehen darf.":"Diese Figur kann gerade nicht ziehen.";renderBoard();}
  else{selected=null;legalTargets=[];renderBoard();}
}
function animatePiece(from,to){
  const destination=document.querySelector(`.square[aria-label="${to}"] .piece`);
  if(!destination)return;
  const fromEl=document.querySelector(`.square[aria-label="${from}"]`);
  const toEl=document.querySelector(`.square[aria-label="${to}"]`);
  if(!fromEl||!toEl)return;
  const a=fromEl.getBoundingClientRect(),b=toEl.getBoundingClientRect();
  const dx=a.left-b.left,dy=a.top-b.top;
  if(Math.abs(dx)+Math.abs(dy)<1)return;
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce)return;
  destination.animate([
    {transform:`translate(${dx}px,${dy}px) scale(1.08)`,filter:"drop-shadow(0 5px 4px #243b2a55)"},
    {transform:"translate(0,0) scale(1)",filter:"drop-shadow(1px 2px 0 #4b514533)"}
  ],{duration:430,easing:"cubic-bezier(.2,.8,.2,1)",fill:"both"});
}
function moveAnimated(from,to,promotion="q"){
  const moving=game.get(from);
  const isCastle=moving?.type==="k"&&Math.abs(from.charCodeAt(0)-to.charCodeAt(0))===2;
  const rookFrom=isCastle?(to.charCodeAt(0)>from.charCodeAt(0)?(game.turn()==="w"?"h1":"h8"):(game.turn()==="w"?"a1":"a8")):null;
  const rookTo=isCastle?(to.charCodeAt(0)>from.charCodeAt(0)?(game.turn()==="w"?"f1":"f8"):(game.turn()==="w"?"d1":"d8")):null;
  game.move({from,to,promotion});
  renderBoard();
  requestAnimationFrame(()=>{
    animatePiece(from,to);
    if(rookFrom&&rookTo)animatePiece(rookFrom,rookTo);
  });
}
function robotMove(){
  if(game.isGameOver())return;
  const moves=game.moves({verbose:true});if(!moves.length)return;
  // Prefer captures and checks, otherwise choose a random legal move.
  const tactical=moves.filter(m=>m.captured||m.san.includes("+")||m.san.includes("#"));
  const pool=tactical.length&&Math.random()<.55?tactical:moves;
  const move=pool[Math.floor(Math.random()*pool.length)];moveAnimated(move.from,move.to,move.promotion);
  if(game.isGameOver())finishGame();
  else if(game.isCheck()){$("coach-message").textContent="Oh! Dein König steht im Schach. Zieh ihn in Sicherheit!";}
}
function finishGame(){
  if(!lastRewarded){stars+=3;completedGames++;lastRewarded=true;save();updateStars();}
  const won=game.isCheckmate()&&game.turn()==="b";
  $("coach-message").textContent=won?"Du hast gewonnen! Das hast du super gemacht!":"Gut gespielt! Jede Partie macht dich besser.";
  toast(won?"Gewonnen! Du bekommst 3 Sterne!":"Partie geschafft! Du bekommst 3 Sterne.");
  $("game-message").textContent=won?"Du hast den Roboter besiegt!":game.isCheckmate()?"Der Roboter hat gewonnen. Versuch es gleich noch einmal!":"Unentschieden – gut gekämpft!";
}
function newGame(){game.reset();selected=null;legalTargets=[];lastRewarded=false;$("coach-message").textContent="Ein neues Spiel! Du bist Weiß und darfst anfangen.";renderBoard();}
$("new-game").addEventListener("click",newGame);
$("undo-move").addEventListener("click",()=>{if(game.history().length){game.undo();if(game.turn()==="b"&&game.history().length)game.undo();selected=null;legalTargets=[];lastRewarded=false;renderBoard();toast("Zug zurückgenommen.");}else toast("Es gibt noch keinen Zug.");});
function showLesson(i){const l=lessons[i];$("lesson-title").textContent=l.title;$("lesson-piece").textContent=l.piece;$("lesson-text").textContent=l.text;$("lesson-example").textContent=l.example;document.querySelectorAll(".lesson-item").forEach((b,n)=>b.classList.toggle("selected",n===i));$("lesson-next").innerHTML=i===lessons.length-1?"Noch einmal ansehen <span>↻</span>":'Nächste Lektion <span>→</span>'; $("lesson-next").dataset.next=(i+1)%lessons.length;}
let lessonIndex=0;
document.querySelectorAll(".lesson-item").forEach(b=>b.addEventListener("click",()=>{lessonIndex=Number(b.dataset.lesson);showLesson(lessonIndex);}));
$("lesson-next").addEventListener("click",()=>{lessonIndex=Number($("lesson-next").dataset.next);showLesson(lessonIndex);});
function renderShop(){
  const grid=$("shop-grid");grid.innerHTML="";
  items.forEach(item=>{
    const card=document.createElement("div");card.className="shop-item";
    const preview=document.createElement("div");preview.className="item-preview";preview.textContent=item.preview;
    const title=document.createElement("b");title.textContent=item.name;
    const desc=document.createElement("small");desc.textContent=item.desc;
    const button=document.createElement("button");button.className="buy-button";
    const has=owned.includes(item.id),isOn=equipped===item.id;
    button.textContent=isOn?"Angezogen":has?"Anziehen":item.cost+" Sterne";
    button.disabled=isOn||(!has&&stars<item.cost);if(isOn)button.classList.add("equipped");
    button.addEventListener("click",()=>{if(!owned.includes(item.id)){if(stars<item.cost)return;stars-=item.cost;owned.push(item.id);toast(item.name+" gekauft!");}equipped=item.id;save();updateStars();renderShop();applyOutfit();});
    card.append(preview,title,desc,button);grid.append(card);
  });
}
function applyOutfit(){
  const ch=$("wardrobe-character");ch.className="pixel-character wardrobe-character outfit-"+equipped;
}
$("sound-toggle").addEventListener("click",()=>{soundOn=!soundOn;$("sound-toggle").textContent=soundOn?"♫":"♪";toast(soundOn?"Ton aktiviert":"Ton ausgeschaltet");});
updateStars();renderBoard();showLesson(0);applyOutfit();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));