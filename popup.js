document.addEventListener('DOMContentLoaded', () => {
    function displayUrls(urls) {
        const urlList = document.getElementById('url-list');
        urlList.innerHTML = ''; // Clear previous content
        urls.forEach(url => {
            const listItem = document.createElement('li');
            listItem.textContent = url;
            urlList.appendChild(listItem);
        });
    }

    function getUrlsFromContentScript() {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getUrls' }, response => {
                if (response && response.urls) {
                    displayUrls(response.urls);
                } else {
                    displayUrls(['No URLs found']);
                }
            });
        });
    }

    document.getElementById('fetch-urls').addEventListener('click', getUrlsFromContentScript);
});
