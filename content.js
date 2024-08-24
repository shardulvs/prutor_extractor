(async () => {
    const src = chrome.runtime.getURL('jszip.js');
    const src2 = chrome.runtime.getURL('FileSaver.js');
    const contentScript = await import(src);
    const contentScript2 = await import(src2);
    contentScript.main();
    contentScript2.main();
})();

function getUrls() {
    return Array.from(document.querySelectorAll("#eventsnow > table > tbody > tr > td:nth-child(4) > a")).map(anchor => anchor.href);
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'getUrls') {
        const urls = getUrls();
        sendResponse({urls: urls});
        const updatedUrls = urls.map(url => {
            return url.replace('/editor/', '/editor/download/');
        });
        try {
            const dataPromises = urls.map(url => fetchAndExtractData(url));
            const data = await Promise.all(dataPromises);
            const cpps = await fetchTextFromUrls(updatedUrls)
            console.log(data);
            console.log(cpps)
            await createAndDownloadZip(data, cpps)
        } catch (error) {
            console.error('Error processing URLs:', error);
        }
    }
});

async function fetchAndExtractData(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // Replace 'selector-for-specific-text' with the actual selector
        return doc.querySelector("#statement")?.innerText || '';
    } catch (error) {
        console.error('Error fetching or parsing URL:', error);
        return '';
    }
}

async function createAndDownloadZip(files, cpps) {
    const zip = new JSZip();
    files.forEach((file, index) => {
        zip.file(`description/${index + 1}.txt`, file);
    });
    cpps.forEach((file, index) => {
        zip.file(`templates/${index + 1}.cpp`, file);
    });

    try {
        const filename = document.querySelector("#eventsnow > h2 > span").innerText;
        const content = await zip.generateAsync({ type: 'blob' })
            .then(function (blob) {
                saveAs(blob, filename);
            });
    } catch (error) {
        console.error('Error generating or downloading ZIP file:', error);
    }
}

async function fetchTextFromUrls(urls) {
    const texts = [];
    for (let url of urls) {
        try {
            let response = await fetch(url);
            if (response.ok) {
                let text = await response.text();
                texts.push(text);
            } else {
                console.error(`Failed to fetch ${url}: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
        }
    }
    return texts;
}
