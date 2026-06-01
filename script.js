// Global State Multi-Ledger Control & History
let currentDayKey = 'Mon'; 
let currentShiftKey = 'AM'; 
let tempSelectedDayKey = 'Mon';
let tempSelectedDayName = '';

let weeklyData = {};
const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const shiftKeys = ['AM', 'PM'];

function initData() {
    let storedWeekly = localStorage.getItem('2d_weekly_data');
    if (storedWeekly) {
        weeklyData = JSON.parse(storedWeekly);
    } else {
        resetWeeklyStructure();
    }
}

function resetWeeklyStructure() {
    weeklyData = {};
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
    saveWeeklyToStorage();
}

function saveWeeklyToStorage() {
    localStorage.setItem('2d_weekly_data', JSON.stringify(weeklyData));
}

function triggerResetWeeklyData() {
    let confirmFirst = confirm("⚠️ သတိပေးချက်!\n\nတနင်္လာနေ့မှ သောကြာနေ့အထိ ရှိသမျှ စာရင်းဇယားအားလုံးကို ရှင်းလင်းဖျက်သိမ်းမှာ သေချက်ပါသလား?");
    if (!confirmFirst) return;

    let confirmSecond = confirm("🚨 နောက်ဆုံးအတည်ပြုချက်!\n\nစာရင်းများအားလုံး ပျက်သွားပါမည်။ (မှတ်ချက် - ၃ ပတ်စာမှတ်တမ်းထဲသို့ အလိုအလျောက် ရွှေ့ပြောင်းသိမ်းဆည်းပေးမည် ဖြစ်ပါသည်)");
    if (!confirmSecond) return;

    let weeklyTotalSales = 0;
    dayKeys.forEach(d => {
        shiftKeys.forEach(s => {
            weeklyTotalSales += weeklyData[d][s].totalSalesAmt;
        });
    });

    let today = new Date();
    let archiveDateString = today.toLocaleDateString('my-MM', { year: 'numeric', month: 'long', day: 'numeric' }) + " " + today.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    let newArchiveRecord = {
        date: archiveDateString,
        totalSales: weeklyTotalSales,
        detailData: JSON.parse(JSON.stringify(weeklyData))
    };

    let archiveHistory = JSON.parse(localStorage.getItem('2d_archive_history')) || [];
    archiveHistory.unshift(newArchiveRecord);

    if (archiveHistory.length > 3) {
        archiveHistory = archiveHistory.slice(0, 3);
    }

    localStorage.setItem('2d_archive_history', JSON.stringify(archiveHistory));
    resetWeeklyStructure();

    finalizeDayShift('AM');
    alert("🧹 စာရင်းများအားလုံးကို အောင်မြင်စွာ ရှင်းလင်းပြီး၊ ၃ ပတ်စာမှတ်တမ်းထဲသို့ ထည့်သွင်းသိမ်းဆည်းပြီးပါပြီ ခင်ဗျာ။");
    closeMenu();
}

function renderArchiveHistory() {
    const container = document.getElementById('historyLogContainer');
    let archiveHistory = JSON.parse(localStorage.getItem('2d_archive_history')) || [];

    if (archiveHistory.length === 0) {
        container.innerHTML = `<div style="color: #aaa; text-align: center; padding: 20px;">သိမ်းဆည်းထားသော အပတ်စဉ်မှတ်တမ်း မရှိသေးပါခင်ဗျာ။</div>`;
        return;
    }

    container.innerHTML = '';
    archiveHistory.forEach((record, index) => {
        container.innerHTML += `
            <div class="box" style="border: 1px solid #ffaa00; margin-bottom: 15px; background: #162a45;">
                <h4 style="color: #ffaa00; margin: 0 0 5px 0;">📦 အပတ်စဉ်မှတ်တမ်း - (${index + 1})</h4>
                <p style="margin: 3px 0; font-size: 13px; color: #bbb;"><b>သိမ်းဆည်းခဲ့သည့်နေ့ရက်:</b> ${record.date}</p>
                <p style="margin: 3px 0; font-size: 15px; color: #fff;"><b>တစ်ပတ်စာ စုစုပေါင်းရောင်းရငွေ:</b> <span style="color: #00ffcc; font-weight: bold;">${record.totalSales.toLocaleString()}</span> ကျပ်</p>
            </div>
        `;
    });
}

function selectHistoryCategory() {
    document.getElementById('main-page-section').classList.remove('active');
    document.getElementById('ledger-page-section').classList.remove('active');
    document.getElementById('history-page-section').classList.add('active');
    renderArchiveHistory();
    closeMenu();
}

function handleExitApp() {
    if(confirm("အပလီကေးရှင်းမှ ထွက်ခွာမှာ သေချာပါသလား?")) {
        alert("စနစ်ကို ပိတ်လိုက်ပါပြီခင်ဗျာ။");
    }
    closeMenu();
}

window.addEventListener('DOMContentLoaded', () => {
    initData();
    updateOutText();
    renderLogs();
});

const natsat = ['18', '81', '24', '42', '35', '53', '69', '96'];
const power = ['05', '50', '16', '61', '27', '72', '38', '83', '49', '94'];
const twins = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
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
    document.getElementById('selected-day-title').innerText = `${dayName}နေ့ စာရင်း`;
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
    let shiftName = shift === 'AM' ? 'မနက်' : 'ညနေ';
    document.getElementById('currentActiveDayLabel').innerText = `${tempSelectedDayName}နေ့ (${shiftName})`;
    document.getElementById('ledger-page-section').classList.remove('active');
    document.getElementById('history-page-section').classList.remove('active');
    document.getElementById('main-page-section').classList.add('active');
    document.getElementById('batchTotalDisplay').style.display = 'none';
    updateOutText();
    renderLogs();
    closeMenu();
}

function selectLedgerCategory() {
    document.getElementById('main-page-section').classList.remove('active');
    document.getElementById('history-page-section').classList.remove('active');
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
        if(key === "TWINS_MARKER") { container.innerHTML += `<div class="section-title">အပူး ၁၀ ကွက်</div>`; return; }
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

// 🌟 စာသားများအား Space ကြောင့် လွဲချော်မှုမရှိစေရန် အပြည့်အစုံ ပြုပြင်ထားသော စနစ်အသစ်
function parse2DText() {
    const text = document.getElementById('rawInput').value.trim(); if(!text) return;
    let activeData = weeklyData[currentDayKey][currentShiftKey];
    
    // တစ်ကြောင်းချင်းစီခွဲထုတ်ခြင်း
    const lines = text.split(/\r?\n/);
    let currentBatchTotalSales = 0;

    lines.forEach(line => {
        let orig = line.trim(); if(!orig) return;
        
        // မြန်မာဂဏန်းများကို အင်္ဂလိပ်ပြောင်းပြီး စာလုံးအသေးလုပ်ခြင်း
        let convertedLine = convertBurmeseToEnglish(orig.toLowerCase());
        
        // 🌟 ကြားထဲက Space (ကွက်လပ်) အားလုံးကို ဖျက်ချပစ်လိုက်ခြင်း (ဥပမာ - "59 r 10000" မှ "59r10000" သို့ ပြောင်းလဲပစ်မည်)
        let cleanLine = convertedLine.replace(/\s+/g, '');
        
        // စာရင်းပုံစံ Pattern ကို တိကျစွာ ခွဲထုတ်ခြင်း
        const pattern = /(([0-9.,]+)(r|အာ|\*|&|@|d|ဒဲ့)?|([0-9])(ထိပ်|h|ပိတ်|t|b|ဘရိတ်)|(နတ်ခတ်|နတ်ခက်|နက္ခတ်|nk|power|ပါဝါ|အပူး|ပူး|ညီအကို|ညီကို|ကိုညီ))([0-9]+)/g;
        let matches = [...cleanLine.matchAll(pattern)];
        
        if (matches.length === 0) {
            let cur = cleanLine.replace(/[\s\-=\/]/g, '');
            processChunk(cur, orig, activeData, (amt) => { currentBatchTotalSales += amt; });
        } else {
            matches.forEach(match => {
                let chunk = match[0].replace(/[\s\-=\/]/g, '');
                processChunk(chunk, match[0], activeData, (amt) => { currentBatchTotalSales += amt; });
            });
        }
    });

    if (currentBatchTotalSales > 0) {
        document.getElementById('batchTotalAmt').innerText = currentBatchTotalSales.toLocaleString();
        document.getElementById('batchTotalDisplay').style.display = 'block';
    } else {
        document.getElementById('batchTotalDisplay').style.display = 'none';
    }

    document.getElementById('rawInput').value = '';
    saveWeeklyToStorage(); 
    updateOutText(); renderLogs();
}

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
    const area = document.getElementById('outText'); if(!area.value) return;
    area.select(); navigator.clipboard.writeText(area.value);
}
function confirmAndDeleteOutText() {
    const area = document.getElementById('outText'); if(!area.value) return;
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
