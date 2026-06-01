let currentDayKey = 'Mon', currentShiftKey = 'AM', tempSelectedDayKey = 'Mon', tempSelectedDayName = '', weeklyData = {}, activeCustomerName = "", customerList = [];
const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], shiftKeys = ['AM', 'PM'];

function initData() {
    let sd = localStorage.getItem('2d_weekly_data_v3'), sc = localStorage.getItem('2d_customer_list');
    customerList = sc ? JSON.parse(sc) : []; sd ? weeklyData = JSON.parse(sd) : resetWeeklyStructure();
}
function resetWeeklyStructure() {
    weeklyData = {};
    dayKeys.forEach(d => { weeklyData[d] = {}; shiftKeys.forEach(s => { weeklyData[d][s] = { mainLedger: {}, mainLogHistory: [], customers: {} }; for(let i=0; i<100; i++) weeklyData[d][s].mainLedger[i.toString().padStart(2,'0')] = 0; customerList.forEach(c => createCustomerStructure(d,s,c)); }); });
    saveWeeklyToStorage();
}
function createCustomerStructure(d, s, n) {
    if (!weeklyData[d][s].customers[n]) { weeklyData[d][s].customers[n] = { ledger: {}, totalSalesAmt: 0, logHistory: [] }; for(let i=0; i<100; i++) weeklyData[d][s].customers[n].ledger[i.toString().padStart(2,'0')] = 0; }
}
const saveWeeklyToStorage = () => { localStorage.setItem('2d_weekly_data_v3', JSON.stringify(weeklyData)); localStorage.setItem('2d_customer_list', JSON.stringify(customerList)); };
const pressKey = v => { const t = document.getElementById('rawInput'); t.value += v; t.focus(); };
const goToCommissionStep = () => { document.getElementById('menu-step-1').style.display = 'none'; document.getElementById('menu-commission-step').style.display = 'block'; renderCommissionButtons(); };

function submitCommissionCustomer() {
    let n = document.getElementById('newCommissionName').value.trim();
    if(n) {
        if (!customerList.includes(n)) { customerList.push(n); dayKeys.forEach(d => shiftKeys.forEach(s => createCustomerStructure(d,s,n))); saveWeeklyToStorage(); renderCommissionButtons(); document.getElementById('newCommissionName').value = ''; }
        else alert("ဤအမည် ရှိနှင့်ပြီးသားဖြစ်သည်!");
    } else alert("ကျေးဇူးပြု၍ အမည်ရိုက်ထည့်ပါ၊");
}
function renderCommissionButtons() {
    const con = document.getElementById('commission-buttons-list'); if (!customerList.length) return con.innerHTML = `<div style="color:#aaa;font-size:12px;text-align:center;padding:10px;">ကော်မရှင်စား မရှိသေးပါ။</div>`;
    con.innerHTML = customerList.map(n => `<div style="display:flex;gap:5px;width:100%;align-items:center;"><button class="menu-day-btn" onclick="switchToCustomer('${n}')" style="margin-bottom:0;flex:1;${activeCustomerName===n?"border:2px solid #00ffcc;background:#153538;color:#00ffcc;":""} text-align:left;">👤 ${n}</button><button onclick="deleteCustomer('${n}')" style="background:#441111;color:#ff5555;border:1px solid #5c2424;border-radius:8px;width:40px;height:45px;font-weight:bold;cursor:pointer;transition:all 0.2s;">✕</button></div>`).join('');
}
function switchToCustomer(n) {
    activeCustomerName = n; document.getElementById('activeCustomerLabel').innerText = n ? n : "စုပေါင်းစာရင်းချုပ်";
    ['history-page-section'].forEach(id=>document.getElementById(id).classList.remove('active')); document.getElementById('main-page-section').classList.add('active');
    updateOutText(); renderLogs(); renderGrid(); closeMenu();
}
function deleteCustomer(n) {
    if(confirm(`⚠️ [${n}] စာရင်းအားလုံး ဖျက်မှာ သေချာလား?`)) { customerList = customerList.filter(c => c !== n); dayKeys.forEach(d => shiftKeys.forEach(s => { if(weeklyData[d][s].customers[n]) delete weeklyData[d][s].customers[n]; })); if(activeCustomerName === n) activeCustomerName = ""; saveWeeklyToStorage(); renderCommissionButtons(); switchToCustomer(activeCustomerName); }
}
function triggerResetWeeklyData() {
    if (!confirm("⚠️ စာရင်းအားလုံး ဖျက်မှာ သေချာလား?") || !confirm("🚨 နောက်ဆုံးအတည်ပြုချက်!")) return;
    let tot = calculateLimitAdjustedTotal();
    let today = new Date(), archStr = today.toLocaleDateString('my-MM') + " " + today.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), arch = JSON.parse(localStorage.getItem('2d_archive_history_v2')) || [];
    arch.unshift({ date: archStr, totalSales: tot, detailData: JSON.parse(JSON.stringify(weeklyData)) }); localStorage.setItem('2d_archive_history_v2', JSON.stringify(arch.slice(0,3)));
    resetWeeklyStructure(); activeCustomerName = ""; finalizeDayShift('AM'); closeMenu(); alert("🧹 ရှင်းလင်းပြီးပါပြီ");
}

function calculateLimitAdjustedTotal() {
    let p = weeklyData[currentDayKey][currentShiftKey];
    let limit = parseInt(document.getElementById('numLimit').value) || 0;
    let total = 0;
    if (p && p.mainLedger) {
        for (let i = 0; i < 100; i++) {
            let k = i.toString().padStart(2, '0');
            let val = p.mainLedger[k] || 0;
            if (limit > 0 && val > limit) total += limit; else total += val;
        }
    }
    return total;
}

function renderArchiveHistory() {
    const box = document.getElementById('historyLogContainer'); let arch = JSON.parse(localStorage.getItem('2d_archive_history_v2')) || []; if (!arch.length) return box.innerHTML = `<div style="color:#aaa;text-align:center;padding:20px;">မှတ်တမ်းမရှိသေးပါ။</div>`;
    box.innerHTML = arch.map((r, i) => `<div class="box" style="border:1px solid #ffaa00;margin-bottom:15px;background:#162a45;"><h4>📦 မှတ်တမ်း - (${i+1})</h4><p style="font-size:13px;color:#bbb;">နေ့ရက်: ${r.date}</p><p style="font-size:15px;color:#fff;">ရောင်းရငွေ: <span style="color:#00ffcc;font-weight:bold;">${r.totalSales.toLocaleString()}</span> ကျပ်</p></div>`).join('');
}
const selectHistoryCategory = () => { document.getElementById('main-page-section').classList.remove('active'); document.getElementById('history-page-section').classList.add('active'); renderArchiveHistory(); closeMenu(); };
const handleExitApp = () => { if(confirm("ထွက်ခွာမှာ သေချာပါသလား?")) alert("ပိတ်လိုက်ပါပြီ"); closeMenu(); };
window.addEventListener('DOMContentLoaded', () => { initData(); updateOutText(); renderLogs(); renderGrid(); });

const natsat = ['18','81','24','42','35','53','69','96','07','70'], power = ['05','50','16','61','27','72','38','83','49','94'], twins = ['00','11','22','33','44','55','66','77','88','99'], brothers = ['01','10','12','21','23','32','34','43','45','54','56','65','67','76','78','87','89','98','90','09'];
const bNum = { 'သုည':'0','၀':'0','0':'0','တစ်':'1','၁':'1','1':'1','နှစ်':'2','၂':'2','2':'2','သုံး':'3','၃':'3','3':'3','လေး':'4','၄':'4','4':'4','ငါး':'5','၅':'5','5':'5','ခြောက်':'6','၆':'6','6':'6','ခုနစ်':'7','၇':'7','7':'7','ရှစ်':'8','၈':'8','8':'8','ကိုး':'9','၉':'9','9':'9' };
const convertBurmeseToEnglish = t => { let r = t; for (let k in bNum) r = r.replace(new RegExp(k, 'g'), bNum[k]); return r; };

/* 🔄 Backdrop Layer ပါ ထိန်းချုပ်ပေးမည့် Menu အပိတ်/အဖွင့် စနစ်သစ် */
const openMenu = () => { 
    document.getElementById('overlayMenu').classList.add('open'); 
    document.getElementById('menuBackdrop').classList.add('open');
    backToStep1(); 
};
const closeMenu = () => {
    document.getElementById('overlayMenu').classList.remove('open');
    document.getElementById('menuBackdrop').classList.remove('open');
};

const goToStep2 = () => { document.getElementById('menu-step-1').style.display = 'none'; document.getElementById('menu-step-2').style.display = 'block'; }, backToStep1 = () => { document.getElementById('menu-step-1').style.display = 'block'; ['menu-step-2','menu-step-3','menu-commission-step'].forEach(id=>document.getElementById(id).style.display='none'); };
const goToStep3 = (k, n) => { tempSelectedDayKey = k; tempSelectedDayName = n; document.getElementById('selected-day-title').innerText = `📅 ${n}နေ့ စာရင်းချုပ်`; document.getElementById('menu-step-2').style.display = 'none'; document.getElementById('menu-step-3').style.display = 'block'; }, backToStep2 = () => { document.getElementById('menu-step-2').style.display = 'block'; document.getElementById('menu-step-3').style.display = 'none'; };

function finalizeDayShift(s) {
    currentDayKey = tempSelectedDayKey; currentShiftKey = s; document.getElementById('currentActiveDayLabel').innerText = `${tempSelectedDayName}နေ့ (${s==='AM'?'မနက်':'ညနေ'})`;
    document.getElementById('history-page-section').classList.remove('active'); document.getElementById('main-page-section').classList.add('active');
    document.getElementById('batchTotalDisplay').style.display = 'none'; updateOutText(); renderLogs(); renderGrid(); closeMenu();
}
const getCustomSortedKeys = () => { let res = [], used = new Set(); for(let i=0; i<100; i++) { let f = i.toString().padStart(2,'0'), r = f.split('').reverse().join(''); if(f!==r && !used.has(f)) { res.push(f, r); used.add(f); used.add(r); } } res.push("TWINS_MARKER"); twins.forEach(t=>res.push(t)); return res; };
const getBreakDigits = b => { let d = []; for(let i=0; i<100; i++) if((Math.floor(i/10)+i%10)%10===b) d.push(i.toString().padStart(2,'0')); return d; };
const getHeadDigits = h => { let d = []; for(let i=0; i<10; i++) d.push(h+""+i); return d; };
const getTailDigits = t => { let d = []; for(let i=0; i<10; i++) d.push(i+""+t); return d; };
const getPatTheeDigits = p => { let d = new Set(); for(let i=0; i<10; i++) { d.add(p+""+i); d.add(i+""+p); } return Array.from(d); };
const getCurrentLedgerSource = () => { let p = weeklyData[currentDayKey][currentShiftKey]; return (activeCustomerName && p.customers[activeCustomerName]) ? p.customers[activeCustomerName].ledger : p.mainLedger; };

function updateOutText() {
    let limit = parseInt(document.getElementById('numLimit').value) || 0, out = [], led = getCurrentLedgerSource();
    for(let i=0; i<100; i++) { let k = i.toString().padStart(2,'0'); if(led[k] > limit && limit > 0) out.push(`${k}-${led[k]-limit}`); }
    document.getElementById('outText').value = out.length ? out.join('\n') : '';
}

function renderGrid() {
    const box = document.getElementById('boardGrid'); let period = weeklyData[currentDayKey][currentShiftKey]; box.innerHTML = '';
    let limit = parseInt(document.getElementById('numLimit').value) || 0;
    
    getCustomSortedKeys().forEach(k => { 
        if(k === "TWINS_MARKER") return box.innerHTML += `<div class="section-title">အပူး ၁၀ ကွက်</div>`; 
        let a = period.mainLedger[k] || 0;
        
        if(limit > 0 && a > limit) { a = limit; }
        
        let disp = a > 0 ? a.toLocaleString() : ''; 
        box.innerHTML += `<div class="num-cell" id="cell-${k}"><span class="n">${k}</span><span class="a">${disp}</span></div>`; 
    });
    checkWinner(); 
    document.getElementById('totalSales').innerText = calculateLimitAdjustedTotal().toLocaleString();
}

function parse2DText() {
    let text = document.getElementById('rawInput').value.trim(); if(!text) return;
    let period = weeklyData[currentDayKey][currentShiftKey], act = activeCustomerName ? period.customers[activeCustomerName] : null, total = 0;
    text.split(/\r?\n/).forEach(line => {
        let orig = line.trim(); if(!orig) return; let engLine = convertBurmeseToEnglish(orig.toLowerCase()), normalized = engLine.replace(/,/g, ' ').replace(/\s+/g, ' ').trim(), tokens = normalized.split(' ');
        if (tokens.length > 1) {
            let last = tokens[tokens.length - 1], isPrice = last.match(/^(r|အာ|\*|&|@|d|ဒဲ့|-)?\d+(-\d+)?$/i) || last.match(/^\d+(r|အာ|\*|&|@|d|ဒဲ့)?$/i);
            if (isPrice) { tokens.pop(); tokens.forEach(num => { if(num.match(/^\d+$/) || num.match(/(ပါဝါ|နက္ခတ်|ညီကို|အပူး|ထိပ်|ပိတ်|ပတ်သီး|nk|power|h|t|b|bရိတ်)/)) processChunk(num + last, num + " " + last, act, period, (amt) => total += amt); }); return; }
        }
        let clean = engLine.replace(/\s+/g, ''), matches = [...clean.matchAll(/(([0-9.,]+)(r|အာ|\*|&|@|d|ဒဲ့|-)?|([0-9])(ထိပ်|h|ပိတ်|t|b|ဘရိတ်|ပတ်သီး|ပတ်|ပါ)|(နတ်ခတ်|နတ်ခက်|နက္ခတ်|nk|power|ပါဝါ|အပူး|ပူး|ညီအကို|ညီကို|ကိုညီ))([0-9]+(-[0-9]+)?)/g)];
        if (!matches.length) processChunk(clean.replace(/[\s\-=\/]/g, ''), orig, act, period, (amt) => total += amt); else matches.forEach(m => processChunk(m[0], m[0], act, period, (amt) => total += amt));
    });
    total > 0 ? (document.getElementById('batchTotalAmt').innerText = total.toLocaleString(), document.getElementById('batchTotalDisplay').style.display = 'block') : document.getElementById('batchTotalDisplay').style.display = 'none';
    document.getElementById('rawInput').value = ''; saveWeeklyToStorage(); updateOutText(); renderLogs(); renderGrid();
}
function processChunk(conv, orig, act, period, onAdd) {
    let targets = [], amt = 0, rAmt = 0, isR = false, isD = false, dispAmt = "", mainLedger = period.mainLedger;
    let splitMatch = conv.match(/(\d+)(r|အာ|\*|&|@|-)(\d+)-(\d+)$/i) || conv.match(/^([0-9.,]+)(?:r|အာ|\*|&|@|-)?(\d+)-(\d+)$/i);
    if (splitMatch && conv.includes('-')) {
        let numPart = splitMatch[1]; amt = parseInt(splitMatch[2]); rAmt = parseInt(splitMatch[3]); if (isNaN(amt)) { numPart = splitMatch[1]; amt = parseInt(splitMatch[3]); rAmt = parseInt(splitMatch[4]); }
        isR = true; let base = numPart.includes('.') ? numPart.split('.') : []; if(!base.length) { if(numPart.length%2===0){for(let k=0;k<numPart.length;k+=2)base.push(numPart.substring(k,k+2));}else base.push(numPart); }
        base.forEach(d => { let f = d.padStart(2,'0'), r = f.split('').reverse().join(''); if (act) { if (act.ledger[f] !== undefined) { act.ledger[f] += amt; act.totalSalesAmt += amt; onAdd(amt); if(!targets.includes(f)) targets.push(f); } if (f !== r && act.ledger[r] !== undefined) { act.ledger[r] += rAmt; act.totalSalesAmt += rAmt; onAdd(rAmt); if(!targets.includes(r)) targets.push(r); } } else { onAdd(amt); if(!targets.includes(f)) targets.push(f); if(f!==r) { onAdd(rAmt); if(!targets.includes(r)) targets.push(r); } } if (mainLedger[f] !== undefined) mainLedger[f] += amt; if (f !== r && mainLedger[r] !== undefined) mainLedger[r] += rAmt; });
        dispAmt = `${amt}-${rAmt}`; let logItem = { raw: orig, digits: targets.join(','), eachAmt: dispAmt, total: (targets.length * amt + (targets.filter(x=>x!=x.split('').reverse().join('')).length * rAmt)).toLocaleString() }; if(act) act.logHistory.unshift(logItem); else period.mainLogHistory.unshift(logItem); return;
    }
    if (conv.match(/([0-9])(ထိပ်|h)/)) { targets = getHeadDigits(conv.match(/([0-9])(ထိပ်|h)/)[1]); amt = parseInt(conv.replace(/([0-9])(ထိပ်|h)/, '')); }
    else if (conv.match(/([0-9])(ပိတ်|t)/)) { targets = getTailDigits(conv.match(/([0-9])(ပိတ်|t)/)[1]); amt = parseInt(conv.replace(/([0-9])(ပိတ်|t)/, '')); }
    else if (conv.match(/([0-9])(ပတ်သီး|ပတ်|ပါ)/)) { targets = getPatTheeDigits(conv.match(/([0-9])(ပတ်သီး|ပတ်|ပါ)/)[1]); amt = parseInt(conv.replace(/([0-9])(ပတ်သီး|ပတ်|ပါ)/, '')); }
    else if (conv.match(/(နတ်ခတ်|နတ်ခက်|နက္ခတ်|nk)/)) { targets = [...natsat]; amt = parseInt(conv.replace(/(နတ်ခတ်|နတ်ခက်|နက္ခတ်|nk)/, '')); }
    else if (conv.match(/(power|ပါဝါ)/)) { targets = [...power]; amt = parseInt(conv.replace(/(power|ပါဝါ)/, '')); }
    else if (conv.match(/(အပူး|ပူး)/)) { targets = [...twins]; amt = parseInt(conv.replace(/(အပူး|ပူး)/, '')); }
    else if (conv.match(/(ညီအကို|ညီကို|ကိုညီ)/)) { targets = [...brothers]; amt = parseInt(conv.replace(/(ညီအကို|ညီကို|ကိုညီ)/, '')); }
    else if (conv.match(/([0-9])(b|ဘရိတ်)/)) { targets = getBreakDigits(parseInt(conv.match(/([0-9])(b|ဘရိတ်)/)[1])); amt = parseInt(conv.replace(/([0-9])(b|ဘရိတ်)/, '')); }
    else {
        isD = conv.includes('ဒဲ့') || conv.includes('d'); let clean = conv.replace(/(ဒဲ့|d)/g, ''), match = clean.match(/^([0-9.,]+)(r|အာ|\*|&|@)?([0-9]+)$/);
        if (match) {
            let numPart = match[1], sym = match[2] || ''; amt = parseInt(match[3]); if (!isD) isR = ['r','အာ','*','&','@'].includes(sym);
            let base = numPart.includes('.') ? numPart.split('.') : []; if(!base.length) { if(numPart.length%2===0){for(let k=0;k<numPart.length;k+=2)base.push(numPart.substring(k,k+2));}else base.push(numPart); }
            base.forEach(d => { let f = d.padStart(2,'0'), r = f.split('').reverse().join(''); if(!targets.includes(f)) targets.push(f); if(isR && f!==r && !targets.includes(r)) targets.push(r); });
        }
    }
    if (isNaN(amt) || amt <= 0 || !targets.length) return;
    let lineSales = 0;
    targets.forEach(d => { let f = d.padStart(2,'0'), r = f.split('').reverse().join(''); if (mainLedger[f] !== undefined) { if (isR && f !== r) { if(act) act.ledger[f] += amt/2; mainLedger[f] += amt/2; lineSales += amt/2; } else { if(act) act.ledger[f] += amt; mainLedger[f] += amt; lineSales += amt; } } });
    if(act) act.totalSalesAmt += lineSales; onAdd(lineSales);
    dispAmt = orig.toLowerCase().includes('ပတ်') || orig.toLowerCase().includes('ပါ') ? `${amt.toLocaleString()}(ပတ်)` : (isD ? `${amt.toLocaleString()}(ဒဲ့)` : (isR ? `${(amt/2).toLocaleString()}(အာ)` : `${amt.toLocaleString()}(ဒဲ့)`));
    let logItem = { raw: orig, digits: targets.join(','), eachAmt: dispAmt, total: lineSales.toLocaleString() }; if(act) act.logHistory.unshift(logItem); else period.mainLogHistory.unshift(logItem);
}
function renderLogs() {
    const body = document.getElementById('logBody'); let period = weeklyData[currentDayKey][currentShiftKey];
    let logs = activeCustomerName ? (period.customers[activeCustomerName] ? period.customers[activeCustomerName].logHistory : []) : period.mainLogHistory;
    if(!logs || !logs.length) return body.innerHTML = `<tr><td colspan="4" class="no-log">မှတ်တမ်းမရှိသေးပါ။</td></tr>`;
    body.innerHTML = logs.map(l => `<tr><td><b>${l.raw}</b></td><td class="log-num">${l.digits}</td><td>${l.eachAmt}</td><td><b>${l.total}</b></td></tr>`).join('');
}
const copyOutTextOnly = () => { const a = document.getElementById('outText'); if(a.value) { a.select(); navigator.clipboard.writeText(a.value); } };
const confirmAndDeleteOutText = () => { const a = document.getElementById('outText'); if(a.value && confirm("ဒိုင်ကို တင်ပြီးပြီလားခင်ဗျာ?")) a.value = ''; };
function checkWinner() {
    let win = document.getElementById('winNum').value.trim(), payout = 0, led = weeklyData[currentDayKey][currentShiftKey].mainLedger; document.querySelectorAll('.num-cell').forEach(el => el.classList.remove('win-alert'));
    if(win !== "") { let f = win.padStart(2,'0'); if(led[f] !== undefined) { payout = led[f] * 80; document.getElementById(`cell-${f}`)?.classList.add('win-alert'); } }
    document.getElementById('totalPayout').innerText = payout.toLocaleString();
}

function toggleLedgerGrid() {
    const wrapper = document.getElementById('gridWrapper');
    const btn = document.querySelector('.toggle-grid-btn');
    
    wrapper.classList.toggle('show');
    
    if (wrapper.classList.contains('show')) {
        btn.innerHTML = "🔼 (00-99) အချပ်ကို ပြန်ဝှက်မည်";
    } else {
        btn.innerHTML = "📊 (00-99) အချပ်ကြည့်မည်";
    }
}
