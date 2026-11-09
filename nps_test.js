const total = 135;
const promotores = 57;
const pasivos = 53;
const detractores = 25;

const pctProm = (promotores / total) * 100;
const pctPas = (pasivos / total) * 100;
const pctDet = (detractores / total) * 100;

console.log("Raw Pct Promotores:", pctProm);
console.log("Raw Pct Pasivos:", pctPas);
console.log("Raw Pct Detractores:", pctDet);

console.log("Rounded Pct Promotores:", Math.round(pctProm));
console.log("Rounded Pct Pasivos:", Math.round(pctPas));
console.log("Rounded Pct Detractores:", Math.round(pctDet));

const nps = pctProm - pctDet;
console.log("True NPS:", nps);
console.log("Rounded NPS:", Math.round(nps));
