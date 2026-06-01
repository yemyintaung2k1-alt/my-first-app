// Global State Multi-Ledger Control
let currentDayKey = 'Mon'; // Mon, Tue, Wed, Thu, Fri
let currentShiftKey = 'AM'; // AM, PM
let tempSelectedDayKey = 'Mon';
let tempSelectedDayName = '';

let weeklyData = {};
const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const shiftKeys = ['AM', 'PM'];

// ဒေတာတည်ဆောက်ပုံများကို သီးခြားစီ အပတ်စဉ်အလိုက် သတ်မှတ်ခြင်း
dayKeys.forEach(dKey => {
    weeklyData[dKey] = {};
    shiftKeys.forEach(sKey => {
        weeklyData[dKey][sKey] = {
            ledger: {},
            totalSalesAmt: 0,
            logHistory: []
        };
        for(let i=0; i<100; i++) {
            let key = i.toString().padStart(2, '0');
            weeklyData[dKey][sKey].ledger[key] = 0;
        }
    });
});

const natsat = ['18', '81', '24', '42', '35', '53', '69', '96'];
const power = ['05', '50', '16', '61', '27', '72', '38', '83', '49', '94'];
const twins = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
const evenTwins = ['00', '22', '44', '66', '88'];
const oddTwins = ['11', '33', '55', '77', '99'];
const brothers = ['01','10','12','21','23','32','34','43','45','54','56','65','67','76','78','87','89','98','90','09'];

const burmeseNumMap = { 'သုည':'0','၀':'0','0':'0','တစ်':'1','၁':'1','1':'1','နှစ်':'2','၂':'2','2':'2','သုံး':'3','၃':'3','3':'3','လေး':'4','၄':'4','4':'4','ငါး':'5','၅':'5','5':'5','ခြောက်':'6','၆':'6','6':'6','ခုနစ်':'7','၇':'7','7':'7','ရှစ်':'8','၈':'8','8':'8','ကိုး':'9','၉':'9','9':'9' };

function convertBurmeseToEnglish(text) {
    let result = text;
    for (let key in burmeseNumMap) { result = result.replace(new RegExp(key, 'g'), burmeseNumMap[key]); }
    return result;
}

/* MENU NAVIGATION LOGIC */
function openMenu() { document.getElementById('overlayMenu').classList.add('open'); backToStep1(); }
function closeMenu() { document.getElementById('overlayMenu').classList.remove('open'); }

function goToStep2() {
    document.getElementById('menu-step-1').style.display = 'none';
    document.getElementById('menu-step-2').style.display = 'block';
}
function backToStep1() {
    document.getElementById('menu-step-1').style.display = 'block';
    document.getElementById('menu-step-2').style.display = 'none';
    document.getElementById('menu-step-3').style.display = 'none';
}

function goToStep3(dayKey, dayName) {
    tempSelectedDayKey = dayKey;
    tempSelectedDayName = dayName;
    document.getElementById('selected-day-title').innerText = `${dayName}နေ့ စာရင်းရွေးချယ်မှု`;
    document.getElementById('menu-step-2').style.display = 'none';
    document.getElementById('menu-step-3').style.display = 'block';
}
function backToStep2() {
    document.getElementById('menu-step-2').style.display = 'block';
    document.getElementById('menu-step-3').style.display = 'none';
}

function finalizeDayShift(shift) {
    currentDayKey = tempSelectedDayKey;
    currentShiftKey = shift;
    let shiftName = shift === 'AM' ? 'မနက်ပိုင်း' : 'ညနေပိုင်း';
    document.getElementById('currentActiveDayLabel').innerText = `${tempSelectedDayName}နေ့ (${shiftName})`;
    document.getElementById('ledger-page-section').classList.remove('active');
    document.getElementById('main-page-section').classList.add('active');
    document.getElementById('batchTotalDisplay').style.display = 'none';
    updateOutText();
    renderLogs();
    closeMenu();
}

function selectLedgerCategory() {
    document.getElementById('main-page-section').classList.remove('active');
    document.getElementById('ledger-page-section').classList.add('active');
    renderGrid();
    closeMenu();
}

/* 2D CORE LOGIC FUNCTION SETS */
function getCustomSortedKeys() {
    let sortedKeys = []; let used = new Set();
    for(let i=0; i<100; i++) {
        let k1 = i.toString().padStart(2, '0'); let r = k1.split('').reverse().join('');
        if(k1 !== r && !used.has(k1)) { sortedKeys.push(k1); sortedKeys.push(r); used.add(k1); used.add(r); }
    }
    sortedKeys.push("TWINS_MARKER"); twins.forEach(t => sortedKeys.push(t)); return sortedKeys;
}
function getBreakDigits(b) { let d = []; for(let i=0; i<100; i++) { if((Math.floor(i/10)+i%10)%10===b) d.push(i.toString().padStart(2, '0')); } return d; }
function getHeadDigits(h) { let d = []; for(let i=0; i<10; i++) d.push(h.toString()+i.toString()); return d; }
function getTailDigits(t) { let d = []; for(let i=0; i<10; i++) d.push(i.toString()+t.toString()); return d; }

function updateOutText() {
    const limit = parseInt(document.getElementById('numLimit').value) || 0;
    let outPieces = [];
    let activeLedger = weeklyData[currentDayKey][currentShiftKey].ledger;
    for(let i=0; i<100; i++) {
        let key = i.toString().padStart(2, '0');
        if (activeLedger[key] > limit) outPieces.push(`${key}-${activeLedger[key] - limit}`);
    }
    document.getElementById('outText').value = outPieces.length > 0 ? outPieces.join('\n') : '';
}

function renderGrid() {
    const container = document.getElementById('boardGrid');
    const limit = parseInt(document.getElementById('numLimit').value) || 0;
    container.innerHTML = '';
    let activeData = weeklyData[currentDayKey][currentShiftKey];
    const customOrder = getCustomSortedKeys();

    customOrder.forEach(key => {
        if(key === "TWINS_MARKER") { container.innerHTML += `<div class="section-title">အပူး ၁၀ ကွက် စာရင်း</div>`; return; }
        let amt = activeData.ledger[key];
        let isOver = amt >= limit && limit > 0;
        let css = isOver ? "num-cell limit-alert" : "num-cell";
        let percentText = "";
        if (limit > 0 && amt > 0) {
            let percentage = Math.round((amt / limit) * 100);
            percentText = ` (${percentage}%)`;
        }
        let displayText = amt > 0 ? amt.toLocaleString() + percentText : '';
        container.innerHTML += `<div class="${css}" id="cell-${key}"><span class="n">${key}</span><span class="a">${displayText}</span></div>`;
    });
    checkWinner();
    document.getElementById('totalSales').innerText = activeData.totalSalesAmt.toLocaleString();
}

// 🌟 ဆက်တိုက်ကပ်ရေးထားသော စာသားများကိုပါ အလိုအလျောက် ခွဲထုတ်တွက်ချက်ပေးမည့် စနစ်သစ် 🌟
function parse2DText() {
    const text = document.getElementById('rawInput').value.trim(); if(!text) return;
    let activeData = weeklyData[currentDayKey][currentShiftKey];
    
    // Line တစ်ကြောင်းချင်းစီ ခွဲထုတ်ခြင်း
    const lines = text.split(/\r?\n/);
    let currentBatchTotalSales = 0;

    lines.forEach(line => {
        let orig = line.trim(); if(!orig) return;
        
        // မြန်မာဂဏန်းများကို အင်္ဂလိပ်ဂဏန်း ပြောင်းလဲခြင်း
        let convertedLine = convertBurmeseToEnglish(orig.toLowerCase());
        
        // သင်္ကေတ အနည်းငယ် ရှင်းလင်းခြင်း ( space, -, =, / များကို ခွဲခြားရလွယ်အောင် ညှိခြင်း )
        // သို့သော် ကပ်ရက် ရေးသားမှုများကို ရှာဖွေနိုင်ရန် Regular Expression Pattern သုံးပါမည်။
        
        // 🌟 2D စာရင်း ပုံစံအမျိုးမျိုးကို စာကြောင်းထဲမှ ရှာဖွေဖော်ထုတ်ရန် သတ်မှတ်ချက် (Regex)
        // ဥပမာ - "25r10000", "26ထိပ်5000", "05-1000", "35b200" စသည်တို့ကို သီးသန့်စီ အတွဲလိုက် ဖမ်းယူပေးမည်။
        const pattern = /(([0-9.,]+(r|အာ|\*|&|@|d|ဒဲ့)?)|([0-9])(ထိပ်|h|ပိတ်|t|b|ဘရိတ်)|(နတ်ခတ်|နတ်ခက်|နက္ခတ်|nk|power|ပါဝါ|အပူး|ပူး|ညီအကို|ညီကို|ကိုညီ))([0-9]+)/g;
        
        let matches = [...convertedLine.matchAll(pattern)];
        
        // အကယ်၍ တစ်ကြောင်းလုံး ကပ်ရေးထားခြင်းမျိုး မဟုတ်ဘဲ Pattern နဲ့လည်း မကိုက်ညီပါက 
        // ယခင်အတိုင်း တစ်ကြောင်းလုံးကို ပေါင်းစပ်ဖတ်ရှုရန် စီမံခြင်း
        if (matches.length === 0) {
            let cur = convertedLine.replace(/[\s\-=\/]/g, '');
            processChunk(cur, orig, activeData, (amt) => { currentBatchTotalSales += amt; });
        } else {
            // အတွဲလိုက် တွေ့ရှိပါက တစ်တွဲချင်းစီကို ခွဲထုတ်ပြီး စာရင်းသွင်းခြင်း
            matches.forEach(match => {
                let chunk = match[0].replace(/[\s\-=\/]/g, '');
                processChunk(chunk, match[0], activeData, (amt) => { currentBatchTotalSales += amt; });
            });
        }
    });

    // မျက်နှာပြင်ပေါ်တွင် တစ်ကြိမ်တင် စုစုပေါင်း ပေါင်းလဒ်ကို ပြသခြင်း
    if (currentBatchTotalSales > 0) {
        document.getElementById('batchTotalAmt').innerText = currentBatchTotalSales.toLocaleString();
        document.getElementById('batchTotalDisplay').style.display = 'block';
    } else {
        document.getElementById('batchTotalDisplay').style.display = 'none';
    }

    document.getElementById('rawInput').value = '';
    updateOutText(); renderLogs();
}

// ခွဲထုတ်ရရှိလာသော အပိုင်းအစ (Chunk) တစ်ခုချင်းစီကို စာရင်းခွဲသွင်းပေးသည့် ကူညီပေးမည့် Function
function processChunk(conv, originalPart, activeData, onSalesAdded) {
    let targets = []; let amt = 0; let isR = false; let isD = false; let dispAmt = "";

    if (conv.match(/([0-9])(ထိပ်|h)/)) { targets = getHeadDigits(parseInt(conv.match(/([0-9])(ထိပ်|h)/)[1])); amt = parseInt(conv.replace(/([0-9])(ထိပ်|h)/, '')); dispAmt = amt.toLocaleString(); } 
    else if (conv.match(/([0-9])(ပိတ်|t)/)) { targets = getTailDigits(parseInt(conv.match(/([0-9])(ပိတ်|t)/)[1])); amt = parseInt(conv.replace(/([0-9])(ပိတ်|t)/, '')); dispAmt = amt.toLocaleString(); }
    else if (conv.match(/(နတ်ခတ်|နတ်ခက်|နက္ခတ်|nk)/)) { targets = [...natsat]; amt = parseInt(conv.replace(/(နတ်ခတ်|နတ်ခက်|နက္ခတ်|nk)/, '')); dispAmt = amt.toLocaleString(); } 
    else if (conv.match(/(power|ပါဝါ)/)) { targets = [...power]; amt = parseInt(conv.replace(/(power|ပါဝါ)/, '')); dispAmt = amt.toLocaleString(); } 
    else if (conv.match(/(အပူး|ပူး)/)) { targets = [...twins]; amt = parseInt(conv.replace(/(အပူး|ပူး)/, '')); dispAmt = amt.toLocaleString(); } 
    else if (conv.match(/(ညီအကို|ညီကို|ကိုညီ)/)) { targets = [...brothers]; amt = parseInt(conv.replace(/(ညီအကို|ညီကို|ကိုညီ)/, '')); dispAmt = amt.toLocaleString(); } 
    else if (conv.match(/([0-9])(b|ဘရိတ်)/)) { targets = getBreakDigits(parseInt(conv.match(/([0-9])(b|ဘရိတ်)/)[1])); amt = parseInt(conv.replace(/([0-9])(b|ဘရိတ်)/, '')); dispAmt = amt.toLocaleString(); }
    else {
        isD = conv.includes('ဒဲ့') || conv.includes('d'); let clean = conv.replace(/(ဒဲ့|d)/g, '');
        let match = clean.match(/^([0-9.,]+)(r|အာ|\*|&|@)?([0-9]+)$/);
        if (match) {
            let numPart = match[1]; let sym = match[2] || ''; amt = parseInt(match[3]);
            if (!isD) isR = ['r', 'အာ', '*', '&', '@'].includes(sym);
            let base = numPart.includes('.') ? numPart.split('.') : (numPart.includes(',') ? numPart.split(',') : []);
            if(base.length === 0) { if(numPart.length%2===0){for(let k=0;k<numPart.length;k+=2)base.push(numPart.substring(k,k+2));}else base.push(numPart); }
            base.forEach(d => {
                let f = d.trim().padStart(2, '0'); let r = f.split('').reverse().join('');
                if (!targets.includes(f)) targets.push(f);
                if (isR && f !== r && !targets.includes(r)) targets.push(r);
            });
            dispAmt = isD ? `${amt.toLocaleString()}(ဒဲ့)` : (isR ? `${(amt/2).toLocaleString()}(အာ)` : `${amt.toLocaleString()}(ဒဲ့)`);
        }
    }

    if (isNaN(amt) || amt <= 0 || targets.length === 0) return;
    let lineSales = 0;
    targets.forEach(d => {
        let f = d.trim().padStart(2, '0'); let r = f.split('').reverse().join('');
        if (activeData.ledger[f] !== undefined) {
            if (isR && f !== r) { let h = amt / 2; activeData.ledger[f] += h; lineSales += h; } 
            else { activeData.ledger[f] += amt; lineSales += amt; }
        }
    });
    activeData.totalSalesAmt += lineSales;
    onSalesAdded(lineSales);
    activeData.logHistory.unshift({ raw: originalPart, digits: targets.join(','), eachAmt: dispAmt, total: lineSales.toLocaleString() });
}

function renderLogs() {
    const body = document.getElementById('logBody'); let logs = weeklyData[currentDayKey][currentShiftKey].logHistory;
    if(logs.length === 0) { body.innerHTML = `<tr><td colspan="4" class="no-log">မှတ်တမ်းမရှိသေးပါ။</td></tr>`; return; }
    body.innerHTML = '';
    logs.forEach(l => { body.innerHTML += `<tr><td><b>${l.raw}</b></td><td class="log-num">${l.digits}</td><td>${l.eachAmt}</td><td><b>${l.total}</b></td></tr>`; });
}

function copyOutTextOnly() {
    const area = document.getElementById('outText'); if(!area.value) { alert('ကူးယူရန် စာရင်းမရှိသေးပါ!'); return; }
    area.select(); navigator.clipboard.writeText(area.value);
}
function confirmAndDeleteOutText() {
    const area = document.getElementById('outText'); if(!area.value) { alert('ဖျက်ရန် စာရင်းမရှိသေးပါ!'); return; }
    if (confirm("ဒိုင်ကို တင်ပြီးပြီလားခင်ဗျာ?")) { area.value = ''; }
}

function checkWinner() {
    let win = document.getElementById('winNum').value.trim(); let payout = 0;
    let ledger = weeklyData[currentDayKey][currentShiftKey].ledger;
    document.querySelectorAll('.num-cell').forEach(el => el.classList.remove('win-alert'));
    if(win !== "") {
        let f = win.padStart(2, '0');
        if(ledger[f] !== undefined) { payout = ledger[f] * 80; let cell = document.getElementById(`cell-${f}`); if(cell) cell.classList.add('win-alert'); }
    }
    document.getElementById('totalPayout').innerText = payout.toLocaleString();
}
