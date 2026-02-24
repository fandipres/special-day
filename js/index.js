let countdownInterval;
let currentDateInput = "";
let currentMonthInput = "";
let currentYear = new Date().getFullYear();
let prevDays, prevHours, prevMins, prevSecs;
let confettiFired = false; 

const el_choosen_date = document.getElementById("choosen_date");
const el_event = document.getElementById("event");
const el_inc = document.getElementById("inc");
const el_dec = document.getElementById("dec");
const el_year = document.querySelectorAll(".year");
const fullscreen_area = document.getElementById("fullscreen_area");
const btn_fullscreen = document.getElementById("btn_fullscreen");
const btn_share = document.getElementById("btn_share");
const share_tooltip = document.getElementById("share_tooltip");
const val_days = document.getElementById("val_days");
const val_hours = document.getElementById("val_hours");
const val_minutes = document.getElementById("val_minutes");
const val_seconds = document.getElementById("val_seconds");
const message_done = document.getElementById("message_done");

const event_modal = document.getElementById("event_modal");
const modal_content = document.getElementById("modal_content");
const btn_open_modal = document.getElementById("btn_open_modal");
const btn_close_modal = document.getElementById("btn_close_modal");
const modal_overlay = document.getElementById("modal_overlay");
const modal_search = document.getElementById("modal_search");
const modal_list = document.getElementById("modal_list");

const month_mappings = { "JAN": "Jan", "FEB": "Feb", "MAR": "Mar", "APR": "Apr", "MEI": "May", "JUN": "Jun", "JUL": "Jul", "AGU": "Aug", "SEP": "Sep", "OKT": "Oct", "NOV": "Nov", "DES": "Dec" };
const full_month_mappings = { "JAN": "Januari", "FEB": "Februari", "MAR": "Maret", "APR": "April", "MEI": "Mei", "JUN": "Juni", "JUL": "Juli", "AGU": "Agustus", "SEP": "September", "OKT": "Oktober", "NOV": "November", "DES": "Desember" };

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramDate = urlParams.get('d');
    const paramMonth = urlParams.get('m');
    const paramTitle = urlParams.get('t');
    const paramYear = urlParams.get('y');

    if (paramDate && paramMonth) {
        currentYear = paramYear ? parseInt(paramYear) : new Date().getFullYear();
        UpdateYearDisplay(currentYear);
        let fullInput = `${paramDate} ${paramMonth}`;
        el_choosen_date.value = fullInput;
        processInput(fullInput, paramTitle);
        return; 
    }

    const savedDate = localStorage.getItem("sd_date");
    const savedMonth = localStorage.getItem("sd_month");
    const savedTitle = localStorage.getItem("sd_title");
    const savedYear = localStorage.getItem("sd_year");

    if (savedDate && savedMonth) {
        currentYear = savedYear ? parseInt(savedYear) : new Date().getFullYear();
        UpdateYearDisplay(currentYear);
        let fullIndoMonth = full_month_mappings[Object.keys(month_mappings).find(key => month_mappings[key] === savedMonth)] || savedMonth; 
        el_choosen_date.value = `${savedDate} ${fullIndoMonth.slice(0,3).toUpperCase()}`;
        setEventTitle(savedTitle || `${savedDate} ${fullIndoMonth}`, savedDate, savedMonth, currentYear);
    } else {
        UpdateYearDisplay(currentYear);
    }
};

btn_share.addEventListener("click", () => {
    if (!currentDateInput || !currentMonthInput) return;
    let indoMonthCode = Object.keys(month_mappings).find(key => month_mappings[key] === currentMonthInput) || currentMonthInput;
    let customTitle = el_event.innerText;
    let shareUrl = `${window.location.origin}${window.location.pathname}?d=${currentDateInput}&m=${indoMonthCode}&y=${currentYear}&t=${encodeURIComponent(customTitle)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        share_tooltip.classList.remove("opacity-0");
        setTimeout(() => share_tooltip.classList.add("opacity-0"), 2000);
    });
});

btn_open_modal.addEventListener("click", openModal);
btn_close_modal.addEventListener("click", closeModal);
modal_overlay.addEventListener("click", closeModal);
modal_search.addEventListener("input", function() { renderModalList(this.value); });

function openModal() {
    event_modal.classList.remove("hidden");
    renderModalList("");
    modal_search.value = "";
    setTimeout(() => {
        modal_content.classList.remove("scale-95", "opacity-0");
        modal_content.classList.add("scale-100", "opacity-100");
    }, 10);
    modal_search.focus();
}

function closeModal() {
    modal_content.classList.remove("scale-100", "opacity-100");
    modal_content.classList.add("scale-95", "opacity-0");
    setTimeout(() => { event_modal.classList.add("hidden"); }, 200);
}

function renderModalList(searchQuery) {
    modal_list.innerHTML = "";
    let filteredEvents = event.filter(e => 
        e.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        FormatDate(e.date).toLowerCase().includes(searchQuery.toLowerCase())
    );

    if(filteredEvents.length === 0) {
        modal_list.innerHTML = `<li class="p-4 text-center text-slate-400">Pencarian tidak ditemukan</li>`;
        return;
    }

    filteredEvents.forEach(e => {
        let formattedDate = FormatDate(e.date);
        let li = document.createElement("li");
        li.className = "flex justify-between items-center p-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors group";
        li.innerHTML = `<span class="font-medium text-slate-700 group-hover:text-indigo-700">${e.label}</span><span class="text-sm text-slate-400 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-600">${formattedDate}</span>`;
        li.addEventListener("click", () => {
            el_choosen_date.value = formattedDate;
            processInput(formattedDate, e.label);
            closeModal();
        });
        modal_list.appendChild(li);
    });
}

btn_fullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        fullscreen_area.requestFullscreen().then(() => {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch((err) => {
                    console.log("Perangkat tidak mendukung pemaksaan landscape, diabaikan.");
                });
            }
        }).catch(err => {
            alert(`Tidak bisa Fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

document.addEventListener("fullscreenchange", () => {
    let labels = document.querySelectorAll('.fullscreen-label');
    if (document.fullscreenElement) {
        labels.forEach(l => { l.classList.remove("text-slate-500"); l.classList.add("text-slate-400"); });
    } else {
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
        labels.forEach(l => { l.classList.add("text-slate-500"); l.classList.remove("text-slate-400"); });
    }
});

el_inc.addEventListener("click", () => ChangeYear("inc"));
el_dec.addEventListener("click", () => ChangeYear("dec"));

el_choosen_date.addEventListener("input", function () {
    let value = this.value.trim().toUpperCase();
    if (value === "") { resetDisplay(); return; }
    processInput(value, null);
});

function processInput(inputValue, eventLabelFromModal) {
    let value = inputValue.trim().toUpperCase();
    let parts = value.split(" ");
    let inputDate = parts[0];
    let inputMonth = parts[1]; 

    let validation = isValidInput(inputDate, inputMonth, currentYear);
    if (!validation.isValid) {
        showError(validation.message);
        return;
    }

    if (inputMonth && inputMonth.length >= 3) {
        let monthKey = inputMonth.slice(0, 3);
        let currentMonthInput = month_mappings[monthKey] || monthKey; 
        let fullIndoMonth = full_month_mappings[monthKey] || inputMonth; 
        let customDateLabel = `${inputDate} ${fullIndoMonth}`; 

        let matchingEvents = event.filter(e => FormatDate(e.date).toUpperCase() === customDateLabel.toUpperCase());

        if (eventLabelFromModal) {
            setEventTitle(eventLabelFromModal, inputDate, currentMonthInput, currentYear);
        } else if (matchingEvents.length > 1) {
            openConflictModal(matchingEvents, customDateLabel, inputDate, currentMonthInput);
        } else if (matchingEvents.length === 1) {
            setEventTitle(matchingEvents[0].label, inputDate, currentMonthInput, currentYear);
        } else {
            setEventTitle(`${customDateLabel} ${currentYear}`, inputDate, currentMonthInput, currentYear);
        }
    }
}

function setEventTitle(title, dateStr, monthStr, year) {
    el_event.innerHTML = title.toUpperCase();
    currentDateInput = dateStr;
    currentMonthInput = monthStr;
    
    localStorage.setItem("sd_date", dateStr);
    localStorage.setItem("sd_month", monthStr);
    localStorage.setItem("sd_title", title.toUpperCase());
    localStorage.setItem("sd_year", year);

    StartCountDown(dateStr, monthStr, year);
}

function openConflictModal(events, customDateLabel, dateStr, monthStr) {
    event_modal.classList.remove("hidden");
    modal_search.value = customDateLabel; 
    modal_list.innerHTML = "";

    let liCustom = document.createElement("li");
    liCustom.className = "flex justify-between items-center p-3 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors group border-b border-slate-200 bg-slate-100 mb-2";
    liCustom.innerHTML = `<span class="font-bold text-slate-800">Gunakan Judul Tanggal Saja</span><span class="text-xs text-slate-600 bg-white px-2 py-1 rounded-md shadow-sm">${customDateLabel} ${currentYear}</span>`;
    liCustom.addEventListener("click", () => {
        el_choosen_date.value = customDateLabel;
        setEventTitle(`${customDateLabel} ${currentYear}`, dateStr, monthStr, currentYear);
        closeModal();
    });
    modal_list.appendChild(liCustom);

    events.forEach(e => {
        let li = document.createElement("li");
        li.className = "flex justify-between items-center p-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors group";
        li.innerHTML = `<span class="font-medium text-slate-700 group-hover:text-indigo-700">${e.label}</span><span class="text-sm text-slate-400 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-600">${FormatDate(e.date)}</span>`;
        li.addEventListener("click", () => {
            el_choosen_date.value = FormatDate(e.date);
            setEventTitle(e.label, dateStr, monthStr, currentYear);
            closeModal();
        });
        modal_list.appendChild(li);
    });

    setTimeout(() => {
        modal_content.classList.remove("scale-95", "opacity-0");
        modal_content.classList.add("scale-100", "opacity-100");
    }, 10);
}

function resetDisplay() {
    currentDateInput = ""; currentMonthInput = "";
    el_event.innerHTML = "";
    fullscreen_area.classList.add("hidden"); 
    message_done.classList.add("hidden");
    clearInterval(countdownInterval);
}

function showError(message) {
    fullscreen_area.classList.remove("hidden");
    el_event.innerHTML = "⚠️ INPUT TIDAK VALID";
    
    updateCardValue(val_days, "00", prevDays);
    updateCardValue(val_hours, "00", prevHours);
    updateCardValue(val_minutes, "00", prevMins);
    updateCardValue(val_seconds, "00", prevSecs);
    prevDays = "00"; prevHours = "00"; prevMins = "00"; prevSecs = "00";
    
    message_done.innerHTML = message;
    message_done.classList.remove("hidden", "text-rose-500", "animate-pulse");
    message_done.classList.add("text-amber-500");
    clearInterval(countdownInterval);
}

function isLeapYear(year) { return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0); }

function isValidInput(dateStr, monthStr, year) {
    if (!monthStr || monthStr.length < 3) return { isValid: true }; 
    let monthKey = monthStr.slice(0, 3);
    const valid_months_max_days = { "JAN": 31, "FEB": isLeapYear(year) ? 29 : 28, "MAR": 31, "APR": 30, "MEI": 31, "JUN": 30, "JUL": 31, "AGU": 31, "SEP": 30, "OKT": 31, "NOV": 30, "DES": 31 };

    if (!valid_months_max_days[monthKey]) return { isValid: false, message: "Nama bulan tidak dikenali." };
    if (dateStr) {
        let dateNum = parseInt(dateStr);
        let maxDate = valid_months_max_days[monthKey];
        if (isNaN(dateNum) || dateNum > maxDate || dateNum <= 0) return { isValid: false, message: `Tanggal maksimal bulan ini: ${maxDate}` };
    }
    return { isValid: true };
}

function UpdateYearDisplay(year) {
    el_year.forEach(el => el.innerText = year);
    let parts = el_event.innerHTML.split(" ");
    if (parts.length === 3 && !isNaN(parts[2])) el_event.innerHTML = `${parts[0]} ${parts[1]} ${year}`;
}

function ChangeYear(action) {
    action === "inc" ? currentYear++ : currentYear--;
    UpdateYearDisplay(currentYear);
    if (currentDateInput && currentMonthInput) {
        let indonesianMonthKey = Object.keys(month_mappings).find(key => month_mappings[key] === currentMonthInput) || currentMonthInput;
        let validation = isValidInput(currentDateInput, indonesianMonthKey, currentYear);
        if (!validation.isValid) {
            showError("Tanggal ini tidak ada di tahun " + currentYear);
        } else {
             StartCountDown(currentDateInput, currentMonthInput, currentYear);
        }
    }
}

function fireConfetti() {
    if (typeof confetti !== 'function') return; 
    let duration = 3000;
    let end = Date.now() + duration;

    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#4f46e5', '#818cf8', '#ffffff'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#4f46e5', '#818cf8', '#ffffff'] });
        if (Date.now() < end) { requestAnimationFrame(frame); }
    }());
}

function StartCountDown(date, month, year) {
    clearInterval(countdownInterval);
    if (!date || !month) return;

    confettiFired = false; 
    
    fullscreen_area.classList.remove("hidden");
    message_done.classList.add("hidden");
    message_done.classList.remove("text-amber-500");
    message_done.classList.add("text-rose-500", "animate-pulse");
    message_done.innerHTML = "🎉 Waktunya Tiba! 🎉";

    let targetTime = new Date(`${month} ${date}, ${year} 00:00:00`).getTime();
    calculateTimeLeft(targetTime); 
    countdownInterval = setInterval(() => calculateTimeLeft(targetTime), 1000);
}

function calculateTimeLeft(targetTime) {
    let dist = targetTime - new Date().getTime();

    if (dist < 0) {
        clearInterval(countdownInterval);
        updateCardValue(val_days, "00", prevDays); updateCardValue(val_hours, "00", prevHours);
        updateCardValue(val_minutes, "00", prevMins); updateCardValue(val_seconds, "00", prevSecs);
        message_done.classList.remove("hidden");
        
        if (!confettiFired) { fireConfetti(); confettiFired = true; }
        return;
    }

    let dStr = Math.floor(dist / (86400000)).toString().padStart(2, '0');
    let hStr = Math.floor((dist % (86400000)) / 3600000).toString().padStart(2, '0');
    let mStr = Math.floor((dist % 3600000) / 60000).toString().padStart(2, '0');
    let sStr = Math.floor((dist % 60000) / 1000).toString().padStart(2, '0');

    updateCardValue(val_days, dStr, prevDays); updateCardValue(val_hours, hStr, prevHours);
    updateCardValue(val_minutes, mStr, prevMins); updateCardValue(val_seconds, sStr, prevSecs);
    prevDays = dStr; prevHours = hStr; prevMins = mStr; prevSecs = sStr;
}

function updateCardValue(element, newValue, prevValue) {
    if (newValue === prevValue || prevValue === undefined) {
        element.innerHTML = `
            <span class="invisible flex items-center h-full justify-center">${newValue}</span>
            <div class="flip-half top"><span>${newValue}</span></div>
            <div class="flip-half bottom"><span>${newValue}</span></div>
        `;
        return;
    }
    
    element.innerHTML = `
        <span class="invisible flex items-center h-full justify-center">${newValue}</span>
        <div class="flip-half top"><span>${newValue}</span></div>
        <div class="flip-half bottom"><span>${prevValue}</span></div>
        <div class="flip-half top flip-top"><span>${prevValue}</span></div>
        <div class="flip-half bottom flip-bottom"><span>${newValue}</span></div>
    `;
}

el_event.addEventListener("keydown", function(e) { if (e.key === "Enter") { e.preventDefault(); this.blur(); }});

el_event.addEventListener("blur", function() {
    let currentText = this.innerText.trim();
    if (currentText === "") {
        if (currentDateInput && currentMonthInput) {
             let fullIndoMonth = full_month_mappings[Object.keys(month_mappings).find(key => month_mappings[key] === currentMonthInput)] || currentMonthInput; 
             this.innerText = `${currentDateInput} ${fullIndoMonth} ${currentYear}`.toUpperCase();
        } else {
             this.innerText = "MOMEN SPESIAL".toUpperCase();
        }
    } else { 
        this.innerText = currentText.toUpperCase(); 
    }
    
    localStorage.setItem("sd_title", this.innerText);
    window.scrollTo(0, 0); 
});

el_event.addEventListener("focus", function() {
    const range = document.createRange(); range.selectNodeContents(this);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
});