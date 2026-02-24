let masterEventsData = [];
if (typeof event !== 'undefined' && Array.isArray(event)) { masterEventsData = event; } 
else if (typeof window.events !== 'undefined') { masterEventsData = window.events; } 
else if (typeof window.event !== 'undefined' && Array.isArray(window.event)) { masterEventsData = window.event; }

let countdownInterval;
let currentDateInput = "";
let currentMonthInput = "";
let currentYear = new Date().getFullYear();
let prevDays, prevHours, prevMins, prevSecs;
let confettiFired = false; 
let isMsgExpanded = false; 

let customTitle = "";
let customSender = "";
let customReceiver = "";
let customMessage = "";

const fullscreen_area = document.getElementById("fullscreen_area");
const controls_section = document.getElementById("controls_section"); 
const el_event = document.getElementById("event");
const event_date_subtitle = document.getElementById("event_date_subtitle"); 

const home_d = document.getElementById("home_d");
const home_m = document.getElementById("home_m");
const home_y = document.getElementById("home_y");
const btn_home_start = document.getElementById("btn_home_start");
const btn_home_add_msg = document.getElementById("btn_home_add_msg"); 

const set_d = document.getElementById("set_d");
const set_m = document.getElementById("set_m");
const set_y = document.getElementById("set_y");
const input_title = document.getElementById("input_title");
const input_receiver = document.getElementById("input_receiver");
const input_sender = document.getElementById("input_sender");
const input_message = document.getElementById("input_message");
const text_settings_year_btn = document.getElementById("text_settings_year_btn"); 

const btn_toggle_msg = document.getElementById("btn_toggle_msg");
const icon_toggle_msg = document.getElementById("icon_toggle_msg");
const container_msg_fields = document.getElementById("container_msg_fields");

const btn_open_settings = document.getElementById("btn_open_settings");
const btn_share = document.getElementById("btn_share");
const btn_fullscreen = document.getElementById("btn_fullscreen");
const share_tooltip = document.getElementById("share_tooltip");
const val_days = document.getElementById("val_days"), val_hours = document.getElementById("val_hours"), val_minutes = document.getElementById("val_minutes"), val_seconds = document.getElementById("val_seconds");
const message_done = document.getElementById("message_done");

const event_modal = document.getElementById("event_modal"), modal_content = document.getElementById("modal_content"), btn_open_modal = document.getElementById("btn_open_modal"), btn_close_modal = document.getElementById("btn_close_modal"), modal_overlay = document.getElementById("modal_overlay"), modal_search = document.getElementById("modal_search"), modal_list = document.getElementById("modal_list");
const settings_modal = document.getElementById("settings_modal"), settings_content = document.getElementById("settings_content"), settings_overlay = document.getElementById("settings_overlay"), btn_close_settings = document.getElementById("btn_close_settings"), btn_save_settings = document.getElementById("btn_save_settings"), btn_reset_home = document.getElementById("btn_reset_home"), btn_settings_browse = document.getElementById("btn_settings_browse");

const btn_open_msg = document.getElementById("btn_open_msg");
const read_msg_modal = document.getElementById("read_msg_modal"), read_msg_content = document.getElementById("read_msg_content"), read_msg_overlay = document.getElementById("read_msg_overlay"), btn_close_read_msg = document.getElementById("btn_close_read_msg");
const display_msg_title = document.getElementById("display_msg_title"), display_msg_to = document.getElementById("display_msg_to"), display_msg_text = document.getElementById("display_msg_text"), display_msg_from = document.getElementById("display_msg_from");

const month_mappings = { "JAN": "Jan", "FEB": "Feb", "MAR": "Mar", "APR": "Apr", "MEI": "May", "JUN": "Jun", "JUL": "Jul", "AGU": "Aug", "SEP": "Sep", "OKT": "Oct", "NOV": "Nov", "DES": "Dec" };
const full_month_mappings = { "JAN": "Januari", "FEB": "Februari", "MAR": "Maret", "APR": "April", "MEI": "Mei", "JUN": "Juni", "JUL": "Juli", "AGU": "Agustus", "SEP": "September", "OKT": "Oktober", "NOV": "November", "DES": "Desember" };

home_y.value = currentYear;
set_y.value = currentYear;
text_settings_year_btn.innerText = currentYear;

window.onload = () => {
    const urlParams = newSearchParams(window.location.search);
    const paramDate = urlParams.get('d');
    const paramMonth = urlParams.get('m');
    
    if (paramDate && paramMonth) {
        currentYear = urlParams.get('y') ? parseInt(urlParams.get('y')) : new Date().getFullYear();
        customTitle = urlParams.get('t') || "";
        customSender = urlParams.get('s') || "";
        customReceiver = urlParams.get('r') || "";
        customMessage = urlParams.get('msg') || "";
        processDirectData(paramDate, paramMonth, currentYear, customTitle);
        return; 
    }

    const savedDate = localStorage.getItem("sd_date");
    const savedMonth = localStorage.getItem("sd_month");
    
    if (savedDate && savedMonth) {
        currentYear = localStorage.getItem("sd_year") ? parseInt(localStorage.getItem("sd_year")) : new Date().getFullYear();
        customTitle = localStorage.getItem("sd_title") || "";
        customSender = localStorage.getItem("sd_sender") || "";
        customReceiver = localStorage.getItem("sd_receiver") || "";
        customMessage = localStorage.getItem("sd_msg") || "";

        let titleToUse = customTitle || `${savedDate} ${full_month_mappings[savedMonth] || savedMonth}`;
        setEventData(titleToUse, savedDate, savedMonth, currentYear);
    }
};

function newSearchParams(search) { return new URLSearchParams(search); }

function safeOpenModal(modal, content) {
    if (document.fullscreenElement) { document.fullscreenElement.appendChild(modal); } 
    else { document.body.appendChild(modal); }
    modal.classList.remove("hidden");
    setTimeout(() => { content.classList.remove("scale-95", "opacity-0"); content.classList.add("scale-100", "opacity-100"); }, 10);
}

function safeCloseModal(modal, content) {
    content.classList.remove("scale-100", "opacity-100");
    content.classList.add("scale-95", "opacity-0");
    setTimeout(() => { modal.classList.add("hidden"); }, 200);
}

function toggleMsgFields(forceOpen = false) {
    if (forceOpen || !isMsgExpanded) {
        container_msg_fields.classList.remove("max-h-0", "opacity-0");
        container_msg_fields.classList.add("max-h-96", "opacity-100");
        icon_toggle_msg.style.transform = "rotate(180deg)";
        isMsgExpanded = true;
    } else {
        container_msg_fields.classList.add("max-h-0", "opacity-0");
        container_msg_fields.classList.remove("max-h-96", "opacity-100");
        icon_toggle_msg.style.transform = "rotate(0deg)";
        isMsgExpanded = false;
    }
}
btn_toggle_msg.addEventListener("click", () => toggleMsgFields());

function checkAutoMatch(d, m) {
    if (!d || !m) return null;
    let monthKey = m.slice(0, 3);
    let fullIndoMonth = full_month_mappings[monthKey] || m; 
    let customDateLabel = `${d} ${fullIndoMonth}`.toUpperCase(); 

    let matched = masterEventsData.filter(e => FormatDate(e.date).toUpperCase() === customDateLabel);
    return matched.length > 0 ? matched[0].label : null;
}

function handleSettingsDateChange() {
    let d = set_d.value.trim(); let m = set_m.value;
    let matchedTitle = checkAutoMatch(d, m);
    if (matchedTitle) {
        input_title.value = matchedTitle;
        input_title.classList.add("bg-indigo-50");
        setTimeout(() => input_title.classList.remove("bg-indigo-50"), 500);
    }
}
set_d.addEventListener('input', handleSettingsDateChange);
set_m.addEventListener('change', handleSettingsDateChange);

set_y.addEventListener('input', () => { text_settings_year_btn.innerText = set_y.value || new Date().getFullYear(); });

btn_home_start.addEventListener("click", () => {
    let d = home_d.value.trim(), m = home_m.value, y = home_y.value.trim();
    if (!d || !m || !y) { alert("Lengkapi tanggal, bulan, dan tahun!"); return; }
    customSender = ""; customReceiver = ""; customMessage = "";
    let matchedTitle = checkAutoMatch(d, m);
    processDirectData(d, m, y, matchedTitle || `${d} ${full_month_mappings[m] || m} ${y}`);
});

btn_home_add_msg.addEventListener("click", () => {
    set_d.value = home_d.value; set_m.value = home_m.value; set_y.value = home_y.value;
    text_settings_year_btn.innerText = set_y.value || currentYear;
    input_receiver.value = ""; input_sender.value = ""; input_message.value = "";
    if (home_d.value && home_m.value) handleSettingsDateChange(); 
    
    toggleMsgFields(true); 
    safeOpenModal(settings_modal, settings_content);
});

function processDirectData(d, m, y, title) {
    let validation = isValidInput(d, m, y);
    if (!validation.isValid) { showError(validation.message); return; }
    setEventData(title, d, m, parseInt(y));
}

function setEventData(title, dateStr, monthStr, year) {
    let fullIndoMonth = full_month_mappings[monthStr] || monthStr;
    let fullDateString = `${dateStr} ${fullIndoMonth} ${year}`.toUpperCase();
    
    el_event.innerHTML = title.toUpperCase();
    
    if (title.toUpperCase() !== fullDateString) {
        event_date_subtitle.innerText = fullDateString;
        event_date_subtitle.classList.remove("hidden");
    } else {
        event_date_subtitle.classList.add("hidden");
    }

    currentDateInput = dateStr; currentMonthInput = monthStr; currentYear = year;
    customTitle = title.toUpperCase();
    
    localStorage.setItem("sd_date", dateStr); localStorage.setItem("sd_month", monthStr); localStorage.setItem("sd_year", year);
    localStorage.setItem("sd_title", customTitle); localStorage.setItem("sd_sender", customSender); localStorage.setItem("sd_receiver", customReceiver); localStorage.setItem("sd_msg", customMessage);

    if (customMessage !== "" || customSender !== "" || customReceiver !== "") {
        btn_open_msg.classList.remove("hidden");
    } else {
        btn_open_msg.classList.add("hidden");
    }

    StartCountDown(dateStr, monthStr, year);
}

btn_open_settings.addEventListener("click", () => {
    set_d.value = currentDateInput; set_m.value = currentMonthInput; set_y.value = currentYear;
    text_settings_year_btn.innerText = currentYear;
    input_title.value = customTitle; input_receiver.value = customReceiver; input_sender.value = customSender; input_message.value = customMessage;
    
    if(customMessage || customSender || customReceiver) toggleMsgFields(true);
    else toggleMsgFields(false);
    
    safeOpenModal(settings_modal, settings_content);
});

btn_close_settings.onclick = settings_overlay.onclick = () => safeCloseModal(settings_modal, settings_content);

btn_save_settings.addEventListener("click", () => {
    let d = set_d.value.trim(), m = set_m.value, y = set_y.value.trim();
    if (!d || !m || !y) { alert("Tanggal tidak boleh kosong"); return; }

    customTitle = input_title.value.trim(); customReceiver = input_receiver.value.trim(); customSender = input_sender.value.trim(); customMessage = input_message.value.trim();

    if(customTitle === "") {
        let matched = checkAutoMatch(d, m);
        customTitle = matched || `${d} ${full_month_mappings[m] || m} ${y}`;
    }

    processDirectData(d, m, y, customTitle);
    safeCloseModal(settings_modal, settings_content);
});

btn_reset_home.addEventListener("click", () => {
    safeCloseModal(settings_modal, settings_content);
    resetDisplay(); localStorage.clear();
    if (document.fullscreenElement) document.exitFullscreen();
});

let isModalFromSettings = false;
btn_open_modal.addEventListener("click", () => { isModalFromSettings = false; openEventModal(); });
btn_settings_browse.addEventListener("click", () => { isModalFromSettings = true; openEventModal(); });

function openEventModal() {
    renderModalList(""); modal_search.value = "";
    safeOpenModal(event_modal, modal_content); modal_search.focus();
}

btn_close_modal.onclick = modal_overlay.onclick = () => safeCloseModal(event_modal, modal_content);
modal_search.oninput = function() { renderModalList(this.value); };

function renderModalList(searchQuery) {
    modal_list.innerHTML = "";
    let filteredEvents = masterEventsData.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase()) || FormatDate(e.date).toLowerCase().includes(searchQuery.toLowerCase()));
    if(filteredEvents.length === 0) { modal_list.innerHTML = `<li class="p-4 text-center text-slate-400">Pencarian tidak ditemukan</li>`; return; }

    filteredEvents.forEach(e => {
        let li = document.createElement("li");
        li.className = "flex justify-between items-center p-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors group";
        li.innerHTML = `<span class="font-medium text-slate-700 group-hover:text-indigo-700">${e.label}</span><span class="text-sm text-slate-400 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-600">${FormatDate(e.date)}</span>`;
        
        li.addEventListener("click", () => {
            let parts = FormatDate(e.date).toUpperCase().split(" ");
            let d = parts[0], mFull = parts[1];
            let mCode = Object.keys(full_month_mappings).find(key => full_month_mappings[key].toUpperCase() === mFull) || mFull.slice(0,3);

            if (isModalFromSettings) {
                set_d.value = d; set_m.value = mCode; input_title.value = e.label;
                safeCloseModal(event_modal, modal_content);
            } else {
                home_d.value = d; home_m.value = mCode;
                customSender = ""; customReceiver = ""; customMessage = "";
                safeCloseModal(event_modal, modal_content);
                processDirectData(d, mCode, home_y.value, e.label);
            }
        });
        modal_list.appendChild(li);
    });
}

btn_open_msg.addEventListener("click", () => {
    display_msg_title.innerText = customTitle;
    display_msg_to.innerText = customReceiver !== "" ? `Untuk: ${customReceiver},` : "";
    display_msg_text.innerText = customMessage;
    display_msg_from.innerText = customSender !== "" ? `Dari: ${customSender}` : "";
    safeOpenModal(read_msg_modal, read_msg_content);
});
btn_close_read_msg.onclick = read_msg_overlay.onclick = () => safeCloseModal(read_msg_modal, read_msg_content);

btn_share.addEventListener("click", () => {
    if (!currentDateInput || !currentMonthInput) return;
    let shareUrl = `${window.location.origin}${window.location.pathname}?d=${currentDateInput}&m=${currentMonthInput}&y=${currentYear}&t=${encodeURIComponent(customTitle)}`;
    if (customSender !== "") shareUrl += `&s=${encodeURIComponent(customSender)}`;
    if (customReceiver !== "") shareUrl += `&r=${encodeURIComponent(customReceiver)}`;
    if (customMessage !== "") shareUrl += `&msg=${encodeURIComponent(customMessage)}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
        share_tooltip.classList.remove("opacity-0");
        setTimeout(() => share_tooltip.classList.add("opacity-0"), 2000);
    });
});

btn_fullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        fullscreen_area.requestFullscreen().then(() => {
            if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
        }).catch(err => alert(`Tidak bisa Fullscreen: ${err.message}`));
    } else document.exitFullscreen();
});
document.addEventListener("fullscreenchange", () => {
    let labels = document.querySelectorAll('.fullscreen-label');
    if (document.fullscreenElement) {
        labels.forEach(l => { l.classList.remove("text-slate-500"); l.classList.add("text-slate-400"); });
    } else {
        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
        labels.forEach(l => { l.classList.add("text-slate-500"); l.classList.remove("text-slate-400"); });
    }
});

function resetDisplay() {
    currentDateInput = ""; currentMonthInput = ""; 
    el_event.innerHTML = ""; event_date_subtitle.classList.add("hidden");
    home_d.value = ""; home_m.value = ""; home_y.value = currentYear;
    customTitle = ""; customSender = ""; customReceiver = ""; customMessage = "";
    fullscreen_area.classList.add("hidden"); controls_section.classList.remove("hidden"); message_done.classList.add("hidden");
    clearInterval(countdownInterval);
}

function showError(message) {
    fullscreen_area.classList.remove("hidden"); controls_section.classList.add("hidden");
    el_event.innerHTML = "⚠️ INPUT TIDAK VALID"; event_date_subtitle.classList.add("hidden"); btn_open_msg.classList.add("hidden"); 
    updateCardValue(val_days, "00", prevDays); updateCardValue(val_hours, "00", prevHours); updateCardValue(val_minutes, "00", prevMins); updateCardValue(val_seconds, "00", prevSecs);
    prevDays = "00"; prevHours = "00"; prevMins = "00"; prevSecs = "00";
    message_done.innerHTML = message; message_done.classList.remove("hidden", "text-rose-500", "animate-pulse"); message_done.classList.add("text-amber-500");
    clearInterval(countdownInterval);
}

function isLeapYear(year) { return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0); }
function isValidInput(dateStr, monthStr, year) {
    let monthKey = monthStr.slice(0, 3);
    const valid_months_max_days = { "JAN": 31, "FEB": isLeapYear(year) ? 29 : 28, "MAR": 31, "APR": 30, "MEI": 31, "JUN": 30, "JUL": 31, "AGU": 31, "SEP": 30, "OKT": 31, "NOV": 30, "DES": 31 };
    if (!valid_months_max_days[monthKey]) return { isValid: false, message: "Nama bulan tidak dikenali." };
    if (dateStr) {
        let dateNum = parseInt(dateStr); let maxDate = valid_months_max_days[monthKey];
        if (isNaN(dateNum) || dateNum > maxDate || dateNum <= 0) return { isValid: false, message: `Tanggal maksimal bulan ini: ${maxDate}` };
    }
    return { isValid: true };
}

function fireConfetti() {
    if (typeof confetti !== 'function') return; 
    let duration = 3000; let end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#4f46e5', '#818cf8', '#ffffff'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#4f46e5', '#818cf8', '#ffffff'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

function StartCountDown(date, month, year) {
    clearInterval(countdownInterval); if (!date || !month) return;
    confettiFired = false; controls_section.classList.add("hidden"); fullscreen_area.classList.remove("hidden");
    message_done.classList.add("hidden"); message_done.classList.remove("text-amber-500"); message_done.classList.add("text-rose-500", "animate-pulse");
    message_done.innerHTML = "🎉 Waktunya Tiba! 🎉";

    let monthEng = month_mappings[month] || month;
    let targetTime = new Date(`${monthEng} ${date}, ${year} 00:00:00`).getTime();
    calculateTimeLeft(targetTime); 
    countdownInterval = setInterval(() => calculateTimeLeft(targetTime), 1000);
}

function calculateTimeLeft(targetTime) {
    let dist = targetTime - new Date().getTime();
    if (dist < 0) {
        clearInterval(countdownInterval);
        updateCardValue(val_days, "00", prevDays); updateCardValue(val_hours, "00", prevHours); updateCardValue(val_minutes, "00", prevMins); updateCardValue(val_seconds, "00", prevSecs);
        message_done.classList.remove("hidden");
        if (!confettiFired) { fireConfetti(); confettiFired = true; }
        return;
    }
    let dStr = Math.floor(dist / (86400000)).toString().padStart(2, '0'); let hStr = Math.floor((dist % (86400000)) / 3600000).toString().padStart(2, '0');
    let mStr = Math.floor((dist % 3600000) / 60000).toString().padStart(2, '0'); let sStr = Math.floor((dist % 60000) / 1000).toString().padStart(2, '0');
    updateCardValue(val_days, dStr, prevDays); updateCardValue(val_hours, hStr, prevHours); updateCardValue(val_minutes, mStr, prevMins); updateCardValue(val_seconds, sStr, prevSecs);
    prevDays = dStr; prevHours = hStr; prevMins = mStr; prevSecs = sStr;
}

function updateCardValue(element, newValue, prevValue) {
    if (newValue === prevValue || prevValue === undefined) {
        element.innerHTML = `<span class="invisible flex items-center h-full justify-center leading-none">${newValue}</span><div class="flip-half top"><span class="leading-none">${newValue}</span></div><div class="flip-half bottom"><span class="leading-none">${newValue}</span></div>`;
        return;
    }
    element.innerHTML = `<span class="invisible flex items-center h-full justify-center leading-none">${newValue}</span><div class="flip-half top"><span class="leading-none">${newValue}</span></div><div class="flip-half bottom"><span class="leading-none">${prevValue}</span></div><div class="flip-half top flip-top"><span class="leading-none">${prevValue}</span></div><div class="flip-half bottom flip-bottom"><span class="leading-none">${newValue}</span></div>`;
}