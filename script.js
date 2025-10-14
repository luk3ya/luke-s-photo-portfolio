// JavaScript 程式碼開始

// === 全域變數/DOM 元素 ===
const toggle = document.getElementById("theme-toggle");
const body = document.body;
const themeKey = 'photosite-theme';

const filterButtons = document.querySelectorAll(".filter-btn");
const allCards = document.querySelectorAll(".card");
const showMoreBtn = document.getElementById("show-more");
const galleryItems = document.querySelectorAll(".gallery-item"); // 燈箱用

const initialCount = 3; // 初始顯示的卡片數量
let isAllExpanded = false; // 追蹤 'all' 模式下是否已展開
let currentFilter = 'all'; // 追蹤當前的篩選條件

// === 主題切換 (無變動) ===
const loadTheme = () => {
    const savedTheme = localStorage.getItem(themeKey);
    if (savedTheme === 'light-mode') {
        body.classList.add('light-mode');
        toggle.textContent = "☀️";
    } else {
        body.classList.remove('light-mode');
        toggle.textContent = "🌙";
    }
};

loadTheme();

toggle.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    const isLightMode = body.classList.contains("light-mode");
    toggle.textContent = isLightMode ? "☀️" : "🌙";
    localStorage.setItem(themeKey, isLightMode ? 'light-mode' : 'dark-mode');
});

// === 聯絡表單 (無變動) ===
document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("感謝你的留言！我會盡快回覆你。");
    document.getElementById("contact-form").reset();
});

// === 燈箱 (Lightbox) 功能 (無變動) ===
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
let currentIndex;
let visibleItems = []; 

const updateVisibleItems = () => {
    visibleItems = Array.from(galleryItems).filter(item => {
        // 使用 window.getComputedStyle 檢查當前 display 屬性
        return window.getComputedStyle(item.closest('.card')).display !== 'none';
    });
};

galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
        updateVisibleItems();
        if (visibleItems.length === 0) return;
        
        currentIndex = visibleItems.indexOf(item);
        lightbox.classList.add("active");
        lightboxImg.src = item.src;
    });
});

const showImage = (index) => {
    if (visibleItems.length === 0) return;
    lightboxImg.src = visibleItems[index].src;
    currentIndex = index;
};

document.querySelector(".close-btn").addEventListener("click", () => lightbox.classList.remove("active"));
lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.remove("active");
});
document.querySelector(".prev-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex === 0) ? visibleItems.length - 1 : currentIndex - 1;
    showImage(currentIndex);
});
document.querySelector(".next-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex === visibleItems.length - 1) ? 0 : currentIndex + 1;
    showImage(currentIndex);
});
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') lightbox.classList.remove("active");
    else if (e.key === 'ArrowLeft') document.querySelector(".prev-btn").click();
    else if (e.key === 'ArrowRight') document.querySelector(".next-btn").click();
});


// === 作品分類與查看更多邏輯 (最終且正確的修正區) ===

/**
 * 根據篩選條件顯示或隱藏作品卡片。
 * @param {string} filter - 當前的分類 (例如: 'all', 'street')
 * @param {boolean} expanded - 僅在 filter='all' 時有效，指示是否已點擊「查看更多」
 */
const applyFilter = (filter, expanded) => {
    currentFilter = filter;
    let cardIndexInFilter = 0; // 追蹤在當前篩選條件下，匹配的卡片計數

    // 1. 遍歷所有卡片
    allCards.forEach(card => {
        const category = card.dataset.category;
        const isMatch = filter === 'all' || category === filter;

        if (isMatch) {
            cardIndexInFilter++; // 匹配條件的卡片數量增加

            if (filter === 'all') {
                // '全部' 篩選邏輯：嚴格遵循展開狀態和初始數量
                if (expanded || cardIndexInFilter <= initialCount) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            } else {
                // 特定分類篩選邏輯：直接顯示所有匹配的
                card.style.display = 'block';
            }
        } else {
            // 不匹配當前篩選器，隱藏
            card.style.display = 'none';
        }
    });

    // 2. 調整「查看更多」按鈕的顯示狀態和文字
    const totalMatchCount = cardIndexInFilter; // 這是當前篩選器下匹配的總數
    
    if (filter === 'all' && totalMatchCount > initialCount) {
        // 只有在 'all' 模式下，且作品數多於初始顯示數時才顯示按鈕
        showMoreBtn.style.display = 'block';
        showMoreBtn.textContent = expanded ? "收起作品" : "查看更多作品";
        
        // 將 isAllExpanded 狀態與當前顯示狀態同步
        isAllExpanded = expanded;

    } else {
        // 特定分類，或 'all' 但作品太少，都隱藏按鈕
        showMoreBtn.style.display = 'none';
        // 非 'all' 模式下，重設展開狀態，以防切換回 'all' 時出錯
        isAllExpanded = false; 
    }
};


// 篩選按鈕事件監聽器
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        // 樣式切換
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const filter = button.dataset.filter;
        
        if (filter === 'all') {
            // 點擊 '全部'：必須重設為未展開狀態 (expanded=false)，以確保只顯示 initialCount 張
            applyFilter(filter, false);
        } else {
            // 點擊特定分類：**永遠視為完全展開（顯示全部），並隱藏按鈕**
            applyFilter(filter, true); 
        }
    });
});


// 查看更多按鈕事件監聽器 (僅在 'all' 模式下有作用)
showMoreBtn.addEventListener("click", () => {
    // 檢查當前篩選器是否為 'all'
    if (currentFilter === 'all') {
        if (isAllExpanded) {
            // 當前已展開，點擊後收起
            applyFilter('all', false); // 設置為未展開
        } else {
            // 當前未展開，點擊後展開
            applyFilter('all', true); // 設置為已展開
            
            // 展開後滾動到作品區塊頂部
            document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
        }
    }
    // 非 'all' 模式下，按鈕會被 applyFilter 隱藏，此事件不會有副作用。
});


// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    // 預設套用 'all' 篩選，只顯示初始數量 (未展開)
    applyFilter('all', false); 
});
// JavaScript 程式碼結束