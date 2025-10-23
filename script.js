let globalMandaty=0, boxMandaty=0, score=0, gameActive=false, moveInterval;
let citizens=[], laws=[], approvedLaws=[];
const globalCounter=document.getElementById('mandatCount');
const mandatBox=document.getElementById('mandatBox');
const zenek=document.getElementById('zenek');
const gameArea=document.getElementById('gameArea');
const scoreDisplay=document.getElementById('score');
const startButton=document.getElementById('startGame');
const citizenTable=document.getElementById('citizenTable');
const lawsList=document.getElementById('lawsList');
const approvedList=document.getElementById('approvedLaws');

/* --- LocalStorage --- */
function loadData(){
  globalMandaty=parseInt(localStorage.getItem("globalMandaty"))||0;
  boxMandaty=parseInt(localStorage.getItem("boxMandaty"))||0;
  citizens=JSON.parse(localStorage.getItem("citizens"))||[];
  laws=JSON.parse(localStorage.getItem("laws"))||[];
  approvedLaws=JSON.parse(localStorage.getItem("approvedLaws"))||[];
  updateCounters();
  renderCitizens();
  renderLaws();
  renderApprovedLaws();
}
function saveData(){
  localStorage.setItem("globalMandaty",globalMandaty);
  localStorage.setItem("boxMandaty",boxMandaty);
  localStorage.setItem("citizens",JSON.stringify(citizens));
  localStorage.setItem("laws",JSON.stringify(laws));
  localStorage.setItem("approvedLaws",JSON.stringify(approvedLaws));
}
function updateCounters(){ globalCounter.textContent=boxMandaty; }

/* --- Mandaty --- */
mandatBox.addEventListener('click',()=>{
  boxMandaty++; globalMandaty++; updateCounters(); addPointsToCitizen(1); saveData();
});

/* --- Minigra --- */
function moveZenek(){
  const x=Math.random()*(gameArea.clientWidth-zenek.clientWidth);
  const y=Math.random()*(gameArea.clientHeight-zenek.clientHeight);
  zenek.style.left=x+'px'; zenek.style.top=y+'px';
}
zenek.addEventListener('click',()=>{
  if(!gameActive) return;
  score++; scoreDisplay.textContent="Wynik: "+score;
  globalMandaty++; boxMandaty++; updateCounters(); addPointsToCitizen(1); saveData();
  moveZenek();
});
startButton.addEventListener('click',()=>{
  if(gameActive) return;
  score=0; scoreDisplay.textContent="Wynik: 0";
  gameActive=true; zenek.style.display="block";
  moveZenek(); moveInterval=setInterval(moveZenek,1000);
  setTimeout(()=>{ clearInterval(moveInterval); gameActive=false; zenek.style.display="none"; alert("Koniec gry! Wynik: "+score); },15000);
});

/* --- Ranking --- */
document.getElementById('addCitizen').addEventListener('submit', e=>{
  e.preventDefault();
  const name=document.getElementById('citizenName').value.trim();
  const title=document.getElementById('citizenTitle').value;
  if(!name) return;
  if(!citizens.find(c=>c.name===name)) citizens.push({name,title,points:0});
  renderCitizens(); saveData(); document.getElementById('citizenName').value="";
});
function addPointsToCitizen(pts){
  if(citizens.length===0) return;
  const last=citizens[citizens.length-1]; last.points+=pts;
  citizens.sort((a,b)=>b.points-a.points);
  renderCitizens(); saveData();
}
function renderCitizens(){
  citizenTable.innerHTML=""; citizens.forEach(c=>{
    const row=document.createElement('tr');
    row.innerHTML=`<td>${c.name}</td><td>${c.title}</td><td>${c.points}</td>`;
    citizenTable.appendChild(row);
  });
}

/* --- Ustawy --- */
document.getElementById('addLaw').addEventListener('submit',e=>{
  e.preventDefault();
  const name=document.getElementById('lawName').value.trim();
  const desc=document.getElementById('lawDesc').value.trim();
  const req=parseInt(document.getElementById('lawReq').value);
  if(!name || !desc || !req) return;
  laws.push({name,desc,votes:0,required:req});
  renderLaws(); saveData();
  document.getElementById('lawName').value="";
  document.getElementById('lawDesc').value="";
  document.getElementById('lawReq').value="";
});
function renderLaws(){
  lawsList.innerHTML="";
  laws.forEach((law,i)=>{
    const div=document.createElement('div'); div.className='law';
    div.innerHTML=`<strong>${law.name}</strong> (${law.votes}/${law.required} MZ)<br>${law.desc}<br>
    <input type="number" min="1" placeholder="Ilość MZ" id="donate${i}"> <button class="add">Przekaż mandaty</button>`;
    div.querySelector('button').addEventListener('click',()=>{
      const amt=parseInt(document.getElementById('donate'+i).value);
      if(!amt || citizens.length===0) return alert("Podaj ilość mandatów!");
      const citizen=citizens[citizens.length-1];
      if(amt>citizen.points) return alert("Nie masz tyle mandatów!");
      citizen.points-=amt; boxMandaty-=amt; if(boxMandaty<0) boxMandaty=0;
      globalMandaty-=amt; if(globalMandaty<0) globalMandaty=0;
      law.votes+=amt;
      if(law.votes>=law.required){ approvedLaws.push(law); laws=laws.filter(l=>l!==law);}
      renderCitizens(); renderLaws(); renderApprovedLaws(); updateCounters(); saveData();
    });
    lawsList.appendChild(div);
  });
}
function renderApprovedLaws(){
  approvedList.innerHTML="";
  approvedLaws.forEach(law=>{
    const div=document.createElement('div'); div.className='law';
    div.innerHTML=`<strong>${law.name}</strong> (${law.votes} MZ)<br>${law.desc}`;
    approvedList.appendChild(div);
  });
}
loadData();




