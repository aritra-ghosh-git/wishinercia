// LOGIN + PROFILE SYSTEM
// Users aur personalised website data Firebase Authentication + Firestore se load hoga.
const firebaseConfig = window.WISHINERCIA_FIREBASE_CONFIG;
const firebaseConfigured = firebaseConfig && !Object.values(firebaseConfig).some(value =>
  String(value).startsWith("PASTE_")
);
let firebaseAuth = null;
let firebaseDb = null;

if(firebaseConfigured){
firebase.initializeApp(firebaseConfig);
firebaseAuth = firebase.auth();
firebaseDb = firebase.firestore();
}

let activeProfile = null;

const passwordBtn =
document.getElementById("passwordBtn");

const loginBtn = document.getElementById("loginBtn");

document.body.classList.add("dark-opening");

function showButton(button){

button.style.display = "inline-block";

requestAnimationFrame(()=>{
button.classList.add("button-visible");
});

}

function hideButton(button){

button.classList.add("button-hiding");

setTimeout(()=>{
button.style.display = "none";
},350);

}

loginBtn.addEventListener("click", async () => {

if(!firebaseConfigured){
document.getElementById("loginError").textContent = "Firebase configuration is not complete yet.";
return;
}

const username =
document.getElementById("usernameInput").value.trim().toLowerCase();

const password =
document.getElementById("loginPasswordInput").value.trim();

const loginError =
document.getElementById("loginError");

loginError.textContent = "";
loginBtn.disabled = true;

try{
const email = `${username}@wishinercia.app`;
const credential = await firebaseAuth.signInWithEmailAndPassword(email, password);
const profileSnapshot = await firebaseDb.collection("users").doc(credential.user.uid).get();

if(!profileSnapshot.exists){
throw new Error("Profile does not exist");
}

const profile = profileSnapshot.data();

activeProfile = profile;

if(profile.siteType === "no_context"){
openNoContextPage();
return;
}

applyProfile(profile);

document.getElementById("loginScreen").style.display = "none";
document.getElementById("passwordScreen").style.display = "flex";
document.getElementById("passwordInput").focus();
}catch(error){
const code = String(
error && (error.code || error.message) || ""
);

if(code.includes("user-not-found")
|| code.includes("wrong-password")
|| code.includes("invalid-credential")
|| code.includes("invalid-login-credentials")){
loginError.textContent = "❌ Wrong username or password";
}
else if(code.includes("invalid-email")){
loginError.textContent = "❌ Username is not in a valid format";
}
else if(code.includes("network")
|| code.includes("internal-error")){
loginError.textContent = "❌ Network issue, please check your internet";
}
else if(code.includes("too-many-requests")){
loginError.textContent = "❌ Too many attempts, please try again later";
}
else if(code.includes("Profile does not exist")){
loginError.textContent = "❌ Profile not found, please contact admin";
}
else{
loginError.textContent = "❌ Something went wrong, please try again";
}
}
finally{
loginBtn.disabled = false;
}
});

function openNoContextPage(){
const loginScreen = document.getElementById("loginScreen");
const noContextScreen = document.getElementById("noContextScreen");
const countdown = document.getElementById("redirectCountdown");
let secondsLeft = 10;

loginScreen.style.display = "none";
noContextScreen.style.display = "grid";
countdown.textContent = secondsLeft;

const timer = setInterval(() => {
secondsLeft -= 1;
countdown.textContent = secondsLeft;

if(secondsLeft <= 0){
clearInterval(timer);
noContextScreen.style.display = "none";
loginScreen.style.display = "grid";
document.getElementById("usernameInput").value = "";
document.getElementById("loginPasswordInput").value = "";
document.getElementById("loginError").textContent = "";
document.getElementById("usernameInput").focus();
activeProfile = null;
firebaseAuth?.signOut();
}
}, 1000);
}

passwordBtn.addEventListener("click", async () => {

const password =
document.getElementById("passwordInput").value.trim();

try{
const user = firebaseAuth?.currentUser;
if(!user){
throw new Error("No signed-in user");
}

const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
await user.reauthenticateWithCredential(credential);

unlockSceneAudio();

document.getElementById(
"passwordScreen"
).style.display = "none";

document.getElementById(
"welcomePage"
).style.display = "flex";

setTimeout(()=>{

document.getElementById(
"welcomePage"
).classList.add("fade-out");

setTimeout(()=>{

document.getElementById(
"welcomePage"
).style.display = "none";

playReligiousInterlude().then(()=>{

document.getElementById(
"gift-screen"
).style.display = "flex";

document.getElementById(
"gift-screen"
).style.animation =
"giftReveal 1.4s cubic-bezier(.22,.8,.28,1) forwards";

});

},1000);

},7000);
}
catch(error){

document.getElementById(
"errorText"
).innerHTML =
"❌ Wrong private password";

}

});

function unlockSceneAudio(){

const sceneAudios = [
document.getElementById("allahAudio"),
document.getElementById("krishnaAudio")
];

sceneAudios.forEach(audio=>{

audio.load();
audio.muted = true;
audio.volume = 0;

const playback = audio.play();

if(playback){
playback.then(()=>{
audio.pause();
audio.currentTime = 0;
audio.muted = false;
}).catch(()=>{});
}

});
}

async function playReligiousInterlude(){

const scene =
document.getElementById("religiousScene");

const scenes = [
{
element:document.querySelector(".scene-allah"),
audio:document.getElementById("allahAudio")
},
{
element:document.querySelector(".scene-krishna"),
audio:document.getElementById("krishnaAudio")
}
];

// 3-second smooth transition gap between the two scenes
const SCENE_GAP = 3000;

scene.style.display = "flex";
scene.classList.add("scene-visible");

for(let index = 0; index < scenes.length; index++){

const item = scenes[index];

// Fresh, clean start for every scene
item.element.style.opacity = "";
item.element.style.visibility = "";
item.element.classList.add("active-scene");

const audioStarted = await startSceneAudio(item.audio);
const duration = await getAudioDuration(item.audio);
const fadeDuration = Math.min(500, Math.max(250, Math.round(duration * .15)));

// Audio-duration sync: animation & audio dono ek saath poore time chale
item.element.style.setProperty("--scene-duration", `${duration}ms`);

item.element.classList.add("draw-scene");

if(audioStarted){
fadeAudioIn(item.audio,fadeDuration);
}

const fadeOutTimer = setTimeout(()=>{
fadeAudioOut(item.audio,fadeDuration);
item.element.classList.add("scene-fade");
},Math.max(duration - fadeDuration,0));

await wait(duration);
clearTimeout(fadeOutTimer);

item.audio.pause();
item.audio.currentTime = 0;
item.audio.loop = false;

if(index < scenes.length - 1){

// Smooth 3-second gap between scenes
const fadeOutGap = 1100;

item.element.classList.add("scene-exit","scene-fade");
await wait(fadeOutGap);

item.element.style.opacity = "0";
item.element.classList.remove("active-scene","draw-scene","scene-fade","scene-exit");

// Calm dark transition for the remaining gap (total ~3s)
await wait(SCENE_GAP - fadeOutGap);

}else{

// Last scene: smooth exit, then close the whole interlude
item.element.classList.add("scene-exit","scene-fade");
await wait(1100);

item.element.style.opacity = "0";
item.element.classList.remove("active-scene","draw-scene","scene-fade","scene-exit");

}

}

scene.classList.add("scene-hidden");
await wait(1100);
scene.style.display = "none";
scene.classList.remove("scene-visible","scene-hidden");

}

async function startSceneAudio(audio){

audio.volume = 0;
audio.currentTime = 0;
audio.muted = false;
audio.loop = false;

try{
await audio.play();
return true;
}catch(error){
console.warn("Religious scene audio could not start.", error);
return false;
}
}

function getAudioDuration(audio){

// Real audio duration se hi animation sync hogi (metadata ke wait ke saath)
return new Promise((resolve)=>{

const fallbackDuration = 6000;

const calculate = ()=>{
const ms = Math.round(audio.duration * 1000);
return Number.isFinite(ms) && ms > 0 ? ms : fallbackDuration;
};

let settled = false;
const finish = ()=>{
if(settled) return;
settled = true;
audio.removeEventListener("loadedmetadata", finish);
audio.removeEventListener("durationchange", finish);
audio.removeEventListener("error", finish);
resolve(calculate());
};

if(Number.isFinite(audio.duration) && audio.duration > 0){
resolve(calculate());
return;
}

audio.addEventListener("loadedmetadata", finish);
audio.addEventListener("durationchange", finish);
audio.addEventListener("error", finish);

// Safety fallback: metadata load hone me 4s aur nahi lagna chahiye
setTimeout(finish, 4000);

});

}

function wait(duration){
return new Promise(resolve=>setTimeout(resolve,duration));
}

function fadeAudioIn(audio,duration){

audio.volume = 0;
const start = performance.now();
const fadeDuration = Math.min(500,duration);

const fade=now=>{
const progress = Math.min((now - start) / fadeDuration,1);
audio.volume = .55 * progress;
if(progress < 1 && !audio.paused){
requestAnimationFrame(fade);
}
};

requestAnimationFrame(fade);
}

function fadeAudioOut(audio,duration){

const startVolume = audio.volume;
const start = performance.now();
const fade=now=>{
const progress = Math.min((now - start) / duration,1);
audio.volume = startVolume * (1 - progress);
if(progress < 1){
requestAnimationFrame(fade);
}
};

requestAnimationFrame(fade);
}

// ===========================
// GIFT OPENING
// ===========================

const gift =
document.getElementById("gift-box");

const music =
document.getElementById("bgMusic");

gift.addEventListener("click", () => {

gift.classList.add("gift-opening");
roseRain();
document.body.classList.remove("dark-opening");

music.volume = 0;
music.currentTime = 0;
music.play().catch(()=>{});

let fadeIn = setInterval(()=>{

if(music.volume < 0.3){

music.volume += 0.02;

}else{

clearInterval(fadeIn);

}
},200);

const themeTransition = document.getElementById(
"themeTransition"
);

themeTransition.classList.add("theme-cover");

setTimeout(()=>{
themeTransition.classList.add("theme-reveal");
},80);

document.getElementById(
"gift-screen"
).classList.add("gift-transition-out");

setTimeout(()=>{

document.getElementById(
"gift-screen"
).style.display = "none";

document.getElementById(
"main-content"
).style.display = "block";

document.getElementById(
"main-content"
).classList.add("pageFadeIn");

startFloatingHearts();

setTimeout(()=>{
startTypewriter();
},450);

},850);

});

// ===========================
// TYPEWRITER TITLE
// ===========================

let titleText =
"🎁 Your Special Surprise 🎁";

let messageText =
`A special surprise has been made just for you.

Please sign in with your own username and password to unlock your personal gift.

Enjoy your moment. ❤️`;

function applyProfile(profile){

const config =
profile.siteConfig || {};

titleText =
config.title || "🎁 Your Special Surprise 🎁";

messageText =
config.message || "A special surprise has been made just for you. Please sign in with your own username and password to unlock your personal gift. ❤️";

document.getElementById("privateGreeting").textContent =
"Assalamualaikum 🥰";

document.querySelectorAll("[data-profile='name']").forEach(element => {
element.textContent = profile.displayName || "";
});
}

function startTypewriter(){

const target =
document.getElementById("typewriter");

const chars =
Array.from(titleText);

let i = 0;

const timer =
setInterval(() => {

target.textContent +=
chars[i];

i++;

if(i >= chars.length){

clearInterval(timer);

setTimeout(() => {

startMessageTyping();

},500);

}

},140);

}

// ===========================
// MESSAGE TYPEWRITER
// ===========================

function startMessageTyping(){

const box =
document.getElementById(
"message-box"
);

const chars =
Array.from(messageText);

let i = 0;

const speed =
20000 / Math.max(chars.length, 1);

const typing =
setInterval(() => {

box.textContent +=
chars[i];

i++;

if(i >= chars.length){

clearInterval(typing);

showButton(document.getElementById("nextBtn"));

}

},speed);

}

// ===========================
// FLOATING HEARTS
// ===========================

function roseRain(){

const roseCount = 24;

for(let i = 0; i < roseCount; i++){

const rose =
document.createElement("span");

rose.className = "rose rose-cinematic";
rose.textContent = "🌹";
rose.style.left = `${Math.random() * 100}%`;
rose.style.fontSize = `${16 + Math.random() * 22}px`;
rose.style.animationDelay = `${Math.random() * 1.4}s`;
rose.style.animationDuration = `${4.5 + Math.random() * 2.5}s`;
rose.style.setProperty("--rose-drift", `${(Math.random() - .5) * 180}px`);
rose.style.setProperty("--rose-spin", `${Math.random() > .5 ? 1 : -1}`);

document.body.appendChild(rose);

setTimeout(()=>{
rose.remove();
},8000);

}

}

function startFloatingHearts(){

setInterval(() => {

const heart =
document.createElement("div");

heart.className = "heart";

heart.innerHTML =
Math.random() > 0.5
? "❤️"
: "🥰";

heart.style.left =
Math.random() * 100 + "vw";

heart.style.bottom = "-50px";

document.body.appendChild(
heart
);

setTimeout(() => {

heart.remove();

},8000);

},1000);

}

// ===========================
// NEXT BUTTON
// ===========================

document.getElementById(
"nextBtn"
).addEventListener(
"click",
() => {

const mainPage =
document.getElementById(
"main-content"
);

const emojiPage =
document.getElementById(
"emojiPage"
);

const galleryPage =
document.getElementById(
"galleryPage"
);

// Main Page Fade Out

mainPage.classList.add(
"pageFadeOut"
);

setTimeout(() => {

mainPage.style.display =
"none";

// Emoji Page Open

emojiPage.style.display =
"block";

emojiPage.classList.add(
"pageFadeIn"
);

emojiBlast();

// Emoji Page → Gallery

setTimeout(() => {

emojiPage.classList.remove(
"pageFadeIn"
);

emojiPage.classList.add(
"pageFadeOut"
);

setTimeout(() => {

emojiPage.style.display =
"none";

galleryPage.style.display =
"block";

galleryPage.classList.add(
"pageFadeIn"
);

startSlideshow();

},800);

},5000);

},800);

}
);
// ===========================
// EMOJI BLAST
// ===========================

function emojiBlast(){

const container =
document.getElementById(
"emojiBlastContainer"
);

for(let i=0;i<48;i++){

const emoji =
document.createElement("div");

const emojis = [
"❤️",
"🥰",
"🌹"
];

emoji.innerHTML =
emojis[
Math.floor(
Math.random()*emojis.length
)
];
emoji.style.position =
"absolute";

emoji.style.left =
Math.random()*100 + "%";

emoji.style.top =
Math.random()*100 + "%";

emoji.style.fontSize =
(18 + Math.random()*25)
+ "px";

emoji.style.transition =
"all 5s linear";
emoji.style.willChange =
"transform, opacity";
container.appendChild(
emoji
);

setTimeout(() => {

emoji.style.transform =
`translate(
${(Math.random()-0.5)*800}px,
${(Math.random()-0.5)*800}px
)
rotate(720deg)`;

emoji.style.opacity =
"0";

},100);

setTimeout(() => {

emoji.remove();

},5000);

}

}

// ===========================
// STACKING POLAROID PHOTOS
// ===========================

function startSlideshow(){

const slides =
document.querySelectorAll(".slide");

let current = 0;

const rotations =
[-6,4,-3,5,-5,3,-2,6];

function stackPhotos(){

if(current < slides.length){

if(current > 0){
slides[current - 1].classList.remove("is-current");
slides[current - 1].classList.add("is-past");
}

slides[current]
.classList.add("active","is-current");

slides[current].style.zIndex =
current + 1;

slides[current].style.transform =
`translateY(0)
rotate(${rotations[current]}deg)
scale(1)`;
current++;

setTimeout(
stackPhotos,
2500
);

}else{

showButton(document.getElementById("voiceBtn"));

}

}

stackPhotos();

}

// ===========================
// VOICE PAGE
// ===========================

document.getElementById(
"voiceBtn"
).addEventListener(
"click",
() => {

const galleryPage =
document.getElementById(
"galleryPage"
);

const voicePage =
document.getElementById(
"voicePage"
);

// Gallery Fade Out

galleryPage.classList.add(
"pageFadeOut"
);

setTimeout(() => {

galleryPage.style.display =
"none";

// Voice Page Fade In

voicePage.style.display =
"block";

voicePage.classList.add(
"pageFadeIn"
);

},800);

}
);

// ===========================
// SHAYARI PAGE
// ===========================

document.getElementById(
"shayariBtn"
).addEventListener(
"click",
() => {

const voicePage =
document.getElementById(
"voicePage"
);

const shayariPage =
document.getElementById(
"shayariPage"
);

// Voice Page Fade Out

voicePage.classList.add(
"pageFadeOut"
);

setTimeout(() => {

voicePage.style.display =
"none";

// Shayari Page Fade In

shayariPage.style.display =
"block";

shayariPage.classList.add(
"pageFadeIn"
);

// Premium Rose Effect

roseRain();

},800);

}
);

// ENTER KEY SUPPORT

["usernameInput", "loginPasswordInput", "passwordInput"].forEach(inputId => {
document.getElementById(inputId)
.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){
        (inputId === "passwordInput" ? passwordBtn : loginBtn).click();
    }

});
});

// EXIT BUTTON

document.getElementById("exitBtn")
.addEventListener("click",()=>{

    document.body.innerHTML = `

    <div style="
    height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    flex-direction:column;

    background:
    radial-gradient(circle at top left,#ff006e33,transparent 30%),
    radial-gradient(circle at top right,#ff4d6d33,transparent 30%),
    linear-gradient(
    135deg,
    #0f0f1a,
    #1a1025,
    #2b123f,
    #12091d
    );

    color:white;
    font-family:'Segoe UI',sans-serif;
    text-align:center;
    animation:fadeInExit 1.5s ease;
    ">

    <h1 style="
    font-size:3rem;
    color:#ff6ea8;
    text-shadow:
    0 0 10px #ff4d6d,
    0 0 20px #ff006e;
    ">
    ❤️ Thank You Madam Ji ❤️
    </h1>

    <p style="
    margin-top:20px;
    font-size:20px;
    ">
    May Your Smile Always Stay Beautiful 🌹
    </p>

    </div>

    `;

    let fadeOut = setInterval(()=>{

        if(music.volume > 0.02){

            music.volume -= 0.02;

        }else{

            music.pause();
            clearInterval(fadeOut);

        }

    },150);

    setTimeout(()=>{

        window.location.href="about:blank";

    },3500);

});

// SECRET MESSAGE

document.getElementById("secretBtn")
.addEventListener("click",()=>{

    document.getElementById(
    "secretMessage"
    ).style.display="block";

    document.getElementById(
    "secretMessage"
    ).classList.add("smooth-reveal");

    hideButton(document.getElementById("secretBtn"));

});

// ROMANTIC CLICK FEEDBACK

document.addEventListener("click",(event)=>{

    const clickHeart =
    document.createElement("span");

    clickHeart.className = "click-heart";
    clickHeart.textContent = "♥";
    clickHeart.style.left = `${event.clientX}px`;
    clickHeart.style.top = `${event.clientY}px`;

    document.body.appendChild(clickHeart);

    setTimeout(()=>{
        clickHeart.remove();
    },900);

});
