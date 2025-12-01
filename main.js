const url = "/api/news?q=";

window.addEventListener("load", () => fetchNews("India"));

function reload() {
    window.location.reload();
}

async function fetchNews(query) {
    try {
        const res = await fetch(`${url}${query}`);
        const data = await res.json();
        
        if (data.status === "error") {
            console.error("API Error:", data.message);
            showError(data.message);
            return;
        }
        
        if (!data.articles || data.articles.length === 0) {
            showError("No articles found");
            return;
        }
        
        bindData(data.articles);
        console.log(data);
    } catch (error) {
        console.error("Fetch Error:", error);
        showError("Failed to fetch news. The free News API doesn't work from browsers. You need to use a server-side proxy or upgrade your API plan.");
    }
}

function showError(message) {
    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #333;">
            <h2>⚠️ API Error</h2>
            <p style="margin-top: 20px; font-size: 16px;">${message}</p>
            <p style="margin-top: 20px; color: #666;">
                News API free tier doesn't allow browser requests. 
                You need to either upgrade your API plan or create a backend proxy server.
            </p>
        </div>
    `;
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});

// Add click handlers to nav items
const navItems = document.querySelectorAll(".nav-item");
navItems.forEach((item) => {
    item.addEventListener("click", () => {
        const navId = item.id;
        onNavItemClick(navId);
    });
});